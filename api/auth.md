# 认证与登录

注册、登录、登出、健康检查与两步验证。

## POST /api/register

开放注册（是否放行由服务器开关决定）。注册后通常需管理员审核或直接激活。

请求体：

```json
{ "name": "alice", "password": "******", "email": "alice@example.com" }
```

约束：

- 用户名需符合服务端 `USERNAME_RE`。
- 密码需满足强度要求（服务端 `passwordStrength`）。
- 邮箱必填且格式合法。

响应：

```json
{ "ok": true, "message": "api.register.submitted" }
```

错误：`400`（格式/邮箱不合法）、`409`（`api.user.nameTaken` 用户名已占用）、`413`。

## POST /api/login

请求体：

```json
{ "username": "alice", "password": "******" }
```

未开启 2FA，成功建立会话（下发 `Set-Cookie`），响应：

```json
{ "ok": true, "username": "alice", "mustChange": false }
```

开启 2FA，响应（此时**不**建立会话）：

```json
{ "ok": true, "need2fa": true, "challenge": "<hex 挑战码>" }
```

错误：`400`（`api.invalidParams`）、`401`（`api.login.badCredentials`）、`403`（未激活 / 已被拒绝 / 被封禁 / IP 封禁）、`429`（触发限速）。

> 未审核通过（pending）或已拒绝（rejected）的账号无法登录。

## POST /api/twofa/verify

两步验证第二步。请求体：

```json
{ "code": "123456", "challenge": "<登录返回的 challenge>" }
```

验证通过后建立会话并下发 Cookie，响应：

```json
{ "ok": true }
```

挑战码有效期 5 分钟。

## POST /api/logout

销毁当前会话并清除 Cookie。

```json
{ "ok": true }
```

## GET /api/health

公开探活接口，无需登录。

```json
{ "ok": true, "uptime": 12345 }
```

## GET /api/setup

公开接口，用于登录页提示「内置管理员是否仍在使用默认密码」。

| 状态码 | 含义 |
| --- | --- |
| `200` | 正常返回初始化状态信息 |

---

## 两步验证（TOTP）配置接口

下列接口在[账号与资料](account.md)中说明：

- `POST /api/twofa/setup`：生成 TOTP 密钥 / 二维码
- `POST /api/twofa/enable`：开启 2FA
- `POST /api/twofa/disable`：关闭 2FA