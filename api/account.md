# 账号与资料

当前登录用户相关的接口：个人资料、密码、通知与两步验证。

## GET /api/me

返回当前登录用户信息。

```json
{
  "ok": true,
  "username": "alice",
  "profile": { "...": "..." },
  "penalties": 0
}
```

## GET /api/me/penalties

返回当前用户的处罚记录（禁言 / 封禁 / IP 封禁等历史）。用于个人中心「我的处罚」。

```json
{ "ok": true, "penalties": [ { "...": "..." } ] }
```

## POST /api/pass

修改当前用户密码。请求体：

```json
{ "oldPassword": "旧密码", "newPassword": "新密码" }
```

响应：

```json
{ "ok": true }
```

错误：`400`（密码强度不足等）、`401`（旧密码错误）。

## POST /api/profile

更新当前用户的个人资料。请求体（按需携带）：

```json
{ "nickname": "...", "signature": "...", "avatar": "...", ... }
```

响应：

```json
{ "ok": true }
```

## GET /api/profile?name=\<username\>

查询某用户的公开资料（用于查看他人主页）。

```json
{ "ok": true, "profile": { "...": "..." } }
```

## GET /api/settings

获取当前用户的在线 / 隐身 / 离开等个性化设置。

```json
{ "ok": true, "invisible": false, "away": false, "lang": "zh" }
```

## POST /api/settings

更新设置。请求体：

```json
{ "invisible": true, "away": false, "lang": "en" }
```

## 两步验证（TOTP）

### POST /api/twofa/setup

生成 TOTP 密钥与二维码，供绑定。响应：

```json
{ "ok": true, "secret": "...", "otpauth": "otpauth://totp/..." }
```

### POST /api/twofa/enable

开启两步验证。请求体通常包含 `code` / `secret` 以完成绑定校验。

### POST /api/twofa/disable

关闭两步验证（需通过既有校验）。

---

> 在线 / 隐身 / 离开状态也可通过 WebSocket 的 `status` 消息实时更新，详见[WebSocket 协议](websocket.md)。