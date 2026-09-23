# 认证与登录

注册、登录、登出、健康检查、两步验证（TOTP）相关接口。所有接口路径都以 `/api` 开头。鉴权总览见 [API 概览](overview)。

## POST /api/register

开放注册时提交账号申请。是否放行由服务器开关决定；提交后账号进入 `pending`（待审核），**审核通过前不能登录**。

请求体：

```json
{ "name": "alice", "password": "Passw0rd!", "email": "alice@example.com" }
```

约束：

- 用户名需符合服务端 `USERNAME_RE`（`[\w\u4e00-\u9fa5\-.]{2,20}`）。
- 密码需满足强度要求（≥8 位且含数字 / 小写 / 大写 / 特殊符）。
- 邮箱必填且格式合法。

响应：

```json
{ "ok": true, "message": "api.register.submitted" }
```

错误：`400`（格式 / 邮箱不合法）、`409`（`api.user.nameTaken` 用户名已占用）、`413`（请求体过大）。

## POST /api/login

请求体：

```json
{ "username": "alice", "password": "Passw0rd!" }
```

**未开启 2FA**，成功建立会话（下发 `Set-Cookie: circlechat_token=...`），响应：

```json
{ "ok": true, "username": "alice", "mustChange": false }
```

`mustChange` 为 `true` 时，前端会强制弹出改密层，不让你进聊天页。

**已开启 2FA**，此时**不**建立会话，只回挑战码：

```json
{ "ok": true, "need2fa": true, "challenge": "<hex 挑战码>" }
```

错误：`400`（`api.invalidParams`）、`401`（`api.login.badCredentials`）、`403`（未激活 / 已拒绝 / 被封禁 / IP 封禁）、`429`（触发同 IP 5 次失败限速，锁 10 分钟）。

> 未审核通过（`pending`）或已拒绝（`rejected`）的账号无法登录。

## POST /api/twofa/verify

两步验证第二步。把登录拿到的 `challenge` 和当前动态码一起提交：

```json
{ "code": "123456", "challenge": "<登录返回的 challenge>" }
```

验证通过后建立会话并下发 Cookie：

```json
{ "ok": true }
```

挑战码有效期 **5 分钟**。错码返回 `401`。

## POST /api/logout

销毁当前会话并清除 Cookie。

```json
{ "ok": true }
```

## GET /api/health

公开探活，无需登录。可用于负载均衡 / 监控心跳。

```json
{ "ok": true, "uptime": 12345 }
```

`uptime` 是进程已运行的秒数。

## GET /api/setup

公开接口，用于登录页提示「内置管理员是否仍在使用默认密码」。返回：

```json
{ "ok": true, "defaultAdmin": true }
```

`defaultAdmin` 为 `true` 表示 `admin` 账号还在用初始密码 `Admin1234`，前端会给出改密提醒。生产环境应尽快改掉。

---

## 两步验证（TOTP）配置接口

下列接口需要已登录，且用于绑定 / 解绑 TOTP：

### POST /api/twofa/setup

生成 TOTP 密钥与二维码链接，供绑定。响应：

```json
{ "ok": true, "secret": "<Base32 密钥>", "otpauth": "otpauth://totp/CircleChat:alice?secret=...&issuer=CircleChat" }
```

`otpauth` 是标准 `otpauth://` 链接，可直接生成二维码扫进 Google Authenticator 等。密钥为 20 字节 Base32（服务端 `genSecret`）。

### POST /api/twofa/enable

开启两步验证。请求体携带绑定校验用的 `code` / `secret`：

```json
{ "code": "123456", "secret": "<setup 返回的 secret>" }
```

校验通过后账号标记 `totp_enabled = 1`，下次登录走 2FA 挑战。响应 `{ "ok": true }`。

### POST /api/twofa/disable

关闭两步验证（需通过既有校验，如再提交一次有效 `code`）。响应 `{ "ok": true }`。

> 在线 / 隐身 / 离开状态也可通过 WebSocket 的 `status` 消息实时更新，详见 [WebSocket 协议](websocket)。
