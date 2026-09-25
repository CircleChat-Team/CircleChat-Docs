# API 概览与鉴权

本文档描述 CircleChat 后端的 HTTP API 与 WebSocket 协议。所有接口都挂在服务根路径下的 `/api/...`。HTTP 部分负责注册 / 登录 / 资料 / 好友 / 群组 / 历史消息 / 上传 / 管理；**实时能力**（消息收发、在线状态、正在输入、表情回应、撤回、处罚推送）全部走 WebSocket，见 [WebSocket 协议](websocket)。

## 基础约定

### Base URL

完整请求地址 = `apiBase` + `/api/...`，其中 `apiBase` 来自前端 `public/js/config.js`：

- **同源部署**：`apiBase` 留空，Base URL 就是当前页面的 origin（如 `https://chat.example.com`）。
- **反代子路径**：`apiBase = '/chat'`，请求落在 `https://chat.example.com/chat/api/...`。
- **跨域**：`apiBase = 'https://api.example.com'`，请求直接打到该域名（`/` 同源策略下需要反代或 CORS 放行）。

下文示例统一用同源形态，即 `https://chat.example.com/api/...`。

### 内容类型

- JSON 接口：请求体 `Content-Type: application/json`，响应也是 `application/json`。
- 上传接口：请求体是 `multipart/form-data`（单次）或分片（见 [消息与上传](messages)）。
- Cookie：登录成功后，会话令牌下发在 HttpOnly Cookie `circlechat_token` 里。前端所有请求带 `credentials: 'same-origin'`，**用 curl 调试时须用 `-c` / `-b` 维持同一个 cookie jar**。

### 统一响应结构

成功：

```json
{ "ok": true, "...": "..." }
```

失败：

```json
{ "ok": false, "error": "i18n.key 或可读文本" }
```

`error` 绝大多数是前端 i18n 键（如 `api.login.badCredentials`）或中文提示，直接展示即可，不要当成机器码去解析。

## 鉴权方式

接口按权限分四档：

| 档位 | 接口 | 未满足条件时 |
| --- | --- | --- |
| 公开 | `register` / `login` / `health` / `setup` / `twofa/verify` | 不需要登录 |
| 已登录 | 其余 `/api/*`（除下面两档） | 无有效 Cookie 或 API Key → `401` |
| 管理 | `/api/admin/*` | 非管理员 → `403` |
| 两步验证 | 开了 TOTP 的账号登录 | 只回挑战码，不建会话 |

除会话 Cookie 外，也可以带 **API Key**（`Authorization: Bearer <key>` 或 `X-API-Key: <key>`）访问绝大多数接口：
服务端先认 Cookie，没有再认 Key。API Key 必须声明 scope，并受独立的每分钟限速约束，
`/api/keys*` 本身不接受 Key（防提权）。详见 [API Key](apikeys)。

### 登录限速

同 IP 连续登录失败 **5 次**，锁定 **10 分钟**。锁定期内再试直接返回 `429`（`api.login.rateLimited`），与密码对错无关。

## 鉴权流程（curl 示例）

用 curl 演示一次完整登录到取自己的资料，关键是复用 cookie jar。

```bash
# 1. 登录（拿到 Set-Cookie: circlechat_token=...）
curl -c cookies.txt -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"******"}' \
  https://chat.example.com/api/login
# => {"ok":true,"username":"alice","mustChange":false}

# 2. 带 cookie 取当前用户信息
curl -b cookies.txt https://chat.example.com/api/me
# => {"ok":true,"username":"alice","profile":{...},"penalties":0}

# 3. 退出（清 cookie + 销毁会话）
curl -b cookies.txt -X POST https://chat.example.com/api/logout
# => {"ok":true}
```

开了两步验证的账号，第一步只会回：

```json
{ "ok": true, "need2fa": true, "challenge": "<hex 挑战码>" }
```

这时要去校验动态码，挑战码有效期 5 分钟：

```bash
curl -c cookies.txt -H 'Content-Type: application/json' \
  -d '{"code":"123456","challenge":"<上一步的 challenge>"}' \
  https://chat.example.com/api/twofa/verify
# => {"ok":true}
```

### 注册 → 审核 → 登录

开放注册时，注册只是提交申请（`pending`），能不能登录取决于管理员是否通过（`review/approve`）：

```bash
curl -H 'Content-Type: application/json' \
  -d '{"name":"alice","password":"Passw0rd!","email":"alice@example.com"}' \
  https://chat.example.com/api/register
# => {"ok":true,"message":"api.register.submitted"}
```

错误时：

- `400`：用户名 / 邮箱格式不合法，或密码强度不足。
- `409`：用户名已占用（`api.user.nameTaken`）。
- `413`：请求体过大。

## 分页与过滤约定

列表类接口（历史消息、聊天记录搜索、审计日志、举报、处罚、用户等）支持分页与过滤，返回里带数据数组与容量信息。以审计日志为例，支持按以下维度过滤：

- `actor`：操作人
- `action`：动作（如 `login`、`message`、`penalty`）
- `target`：作用对象
- `actionPrefix`：动作前缀匹配（如只取 `group.*`）
- `excludeActions`：排除某些动作

调用示例：

```bash
# 取第 2 页审计日志，只看法务相关动作
curl -b cookies.txt 'https://chat.example.com/api/admin/logs?page=2&pageSize=50&actionPrefix=penalty'
```

具体每个列表接口接受的查询参数，见各自章节。所有列表响应都是 `{ok:true, ...}` 包裹，失败统一走 [状态码](#http-状态码速查)。

## HTTP 状态码速查

| 状态码 | 含义 | 典型触发 |
| --- | --- | --- |
| `200` | 成功 | 绝大多数正常响应 |
| `400` | 参数不合法 / 请求体过大 | 用户名格式错、缺字段、`413` 之前的参数校验 |
| `401` | 未登录或凭据错误 | Cookie 缺失 / 失效、密码错、两步验证码错 |
| `403` | 无权限 | 未激活 / 被拒 / 被封禁 / 非管理员 / 不是该房间成员 |
| `404` | 资源不存在 / 分片会话失效 | 用户不存在、群组不存在、`upload/chunk` 会话已过期需重新 `init` |
| `409` | 冲突 | 用户名已占用、已是好友 / 已发过请求、群主不能退群 |
| `413` | 请求体 / 上传文件超限 | 单文件 > 100MB、分片 > 上限、文本 > 4096 字符 |
| `429` | 触发限速 | 同 IP 连续登录失败 5 次被锁 10 分钟；API Key 超过每分钟限额 |

`400` 与 `413` 的边界：参数结构非法（如非 multipart、缺字段）通常 `400`；体积超限（文件大小、请求体大小）通常 `413`。上传接口会在读 body 前先看 `content-length`，超限直接 `413`，避免传完才报错。

## 上传与 WebSocket

- **文件上传**（单次与分片）是特殊接口，细节见 [消息与上传](messages)。
- **实时消息、在线状态、正在输入、表情回应、撤回、处罚推送**全部走 WebSocket，握手在 `/ws`，协议细节见 [WebSocket 协议](websocket)。

## 接口分类总览

| 章节 | 覆盖接口 |
| --- | --- |
| [认证与登录](auth) | `register` / `login` / `logout` / `health` / `setup` / `twofa/*` |
| [账号与资料](account) | `me` / `me/penalties` / `pass` / `profile` / `settings` / `twofa/setup·enable·disable` |
| [好友与用户](friends) | `users` / `friends` / `friends/request·accept·decline` / `report` |
| [群组](groups) | `groups` 系列 |
| [消息与上传](messages) | `messages` / `messages/search` / `upload` 系列 |
| [站内信箱](mailbox) | `announcements` / `me/notifications` / `me/notifications/read` |
| [API Key](apikeys) | `keys` / `keys/update` / `keys/delete` |
| [小程序](../mini/sdk) | `mini` 系列（小程序在沙箱内调用） |
| [管理端 API](admin) | `admin` 系列 |
