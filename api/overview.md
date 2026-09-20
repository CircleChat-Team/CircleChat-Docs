# API 概览与鉴权

本文档描述 CircleChat 后端的 HTTP API 与 WebSocket 协议。所有接口请求到服务根路径下的 `/api/...`。

## 基础约定

- **Base URL**：取决于部署形态，由 `config.js` 的 `apiBase` 决定（同源部署为 `/`，反代子路径为 `/chat`，跨域为完整域名）。
- **内容类型**：JSON 接口的请求体与响应均为 `application/json`。
- **Cookie**：登录成功后在 `HttpOnly` Cookie `circlechat_token` 中下发会话令牌，前端所有请求带 `credentials: 'same-origin'`。

## 响应格式

绝大多数 JSON 接口返回统一结构：

```json
{ "ok": true, ... }
```

失败时返回：

```json
{ "ok": false, "error": "i18n.key 或可读文本" }
```

`error` 字段多为前端 i18n 键或中文提示，供展示用。

## 鉴权方式

- **公开接口**：`register`、`login`、`health`、`setup`、`twofa/verify` 不需要登录。
- **已登录接口**：除公开接口外，其余接口均要求携带有效会话 Cookie。
- **管理接口**：`/api/admin/...` 额外要求**管理员权限**，非管理员访问返回 `403`。
- **两步验证（2FA）**：若账号开启了 TOTP，登录只返回 `{ ok, need2fa: true, challenge }`，需调用 `POST /api/twofa/verify` 验证后才建立会话。

## 登录限速

同 IP 连续失败 5 次后锁定 10 分钟，期间登录返回 `429`（`api.login.rateLimited`）。

## HTTP 状态码速查

| 状态码 | 含义 |
| --- | --- |
| `200` | 成功 |
| `400` | 参数不合法 / 请求体过大 |
| `401` | 未登录或凭据错误 |
| `403` | 无权限（未激活、被封禁、非管理员、无法查看该房间） |
| `404` | 资源不存在 / 分片会话失效 |
| `409` | 冲突（如用户名已被占用） |
| `413` | 请求体 / 上传文件超限 |
| `429` | 触发登录限速 |

## 上传与 WebSocket

- 文件上传（单次与分片）属于特殊接口，见[消息与上传](messages.md)。
- 实时消息、在线状态、正在输入、表情回应、撤回、处罚推送均走 WebSocket，见[WebSocket 协议](websocket.md)。

## 接口分类总览

| 章节 | 覆盖接口 |
| --- | --- |
| [认证与登录](auth.md) | register / login / logout / health / setup / twofa |
| [账号与资料](account.md) | me / penalties / pass / profile / settings |
| [好友与用户](friends.md) | users / friends / profile / report |
| [群组](groups.md) | groups 系列 |
| [消息与上传](messages.md) | messages / upload 系列 |
| [站内信箱](mailbox.md) | announcements / notifications |
| [管理端 API](admin.md) | admin 系列 |