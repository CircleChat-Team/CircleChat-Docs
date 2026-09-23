# 账号与资料

当前登录用户相关的接口：个人信息、密码、通知、个性化设置与两步验证。除 `twofa/*` 外都需要已登录。

## GET /api/me

返回当前登录用户的基本信息，各入口页用它做鉴权（已登录直跳，否则回登录页）。

```json
{
  "ok": true,
  "username": "alice",
  "role": "user",
  "online": true,
  "platforms": ["web"],
  "penalties": 0,
  "profile": {
    "nickname": "Alice",
    "signature": "hello world",
    "avatar": "/uploads/abcd.png"
  }
}
```

- `role`：`user` 或 `admin`。管理面板靠它判断是否放行。
- `penalties`：当前生效的处罚数（>0 表示被禁言 / 封禁中）。
- `platforms`：该用户在线平台标识数组（如 `web`）。

## GET /api/me/penalties

返回当前用户的处罚记录（禁言 / 封禁 / IP 封禁等历史），用于个人中心「我的处罚」。

```json
{
  "ok": true,
  "penalties": [
    {
      "id": 1,
      "user": "alice",
      "action": "mute",
      "duration": 3600,
      "expires": 1789903600000,
      "reason": "刷屏",
      "actor": "admin",
      "created": 1789900000000
    }
  ]
}
```

`expires` 为 `null` 表示永久处罚。`action` 取值见 `warning` / `mute` / `ban` / `ipban`。

## POST /api/pass

修改当前用户密码（需要旧密码）。

请求体：

```json
{ "oldPassword": "旧密码", "newPassword": "新密码" }
```

响应：

```json
{ "ok": true }
```

错误：`400`（新密码强度不足等）、`401`（旧密码错误）。

## GET /api/profile?name=\<username\>

查询某用户的**公开**资料（用于查看他人主页 / 资料卡）。不传 `name` 查自己。

```json
{
  "ok": true,
  "profile": {
    "nickname": "Alice",
    "signature": "hello world",
    "avatar": "/uploads/abcd.png"
  }
}
```

## POST /api/profile

更新当前用户的个人资料。请求体按需携带：

```json
{ "nickname": "Alice", "signature": "hello", "avatar": "/uploads/abcd.png" }
```

| 字段 | 说明 |
| --- | --- |
| `nickname` | 昵称 |
| `signature` | 个性签名 |
| `avatar` | 头像 URL，必须是本服务器 `/uploads/...` 合法路径 |

响应 `{ "ok": true }`。

## GET /api/settings

获取当前用户的个性化设置（持久化的在线 / 隐身 / 离开与语言偏好）。

```json
{ "ok": true, "invisible": false, "away": false, "lang": "zh" }
```

## POST /api/settings

更新设置。请求体：

```json
{ "invisible": true, "away": false, "lang": "en" }
```

- `invisible`：隐身，对他人显示离线。
- `away`：离开，在线但标记为离开。
- `lang`：`zh` / `en` / `ja`。

响应 `{ "ok": true }`。注意实时状态也能通过 WebSocket `status` 消息即时切换（见 [WebSocket 协议](websocket)），这里存的是落库默认值。

---

## 两步验证（TOTP）

### POST /api/twofa/setup

生成 TOTP 密钥与二维码链接，供绑定。响应：

```json
{ "ok": true, "secret": "<Base32 密钥>", "otpauth": "otpauth://totp/CircleChat:alice?secret=...&issuer=CircleChat" }
```

### POST /api/twofa/enable

开启两步验证。请求体通常包含 `code` / `secret` 以完成绑定校验。响应 `{ "ok": true }`。

### POST /api/twofa/disable

关闭两步验证（需通过既有校验）。响应 `{ "ok": true }`。
