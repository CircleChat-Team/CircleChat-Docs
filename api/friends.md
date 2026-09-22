# 好友与用户

用户搜索、好友关系（请求 / 接受 / 拒绝）与举报。私聊的前提是互为好友——见下方「好友门禁」。鉴权总览见 [API 概览](overview.md)。

## GET /api/users

返回用户列表，可用于搜索 / 加好友。响应里 `decorateNames` 会附带在线状态与头像：

```json
{
  "ok": true,
  "users": [
    { "name": "bob", "online": true, "image": "/uploads/xxxx.png" }
  ]
}
```

不带参数时通常返回全部用户（或按 `q` 关键字过滤，具体以服务端实现为准）。

## GET /api/friends

返回当前用户的好友列表，附带在线状态与头像字段：

```json
{
  "ok": true,
  "users": [
    { "name": "bob", "online": true, "image": "/uploads/xxxx.png" }
  ]
}
```

## POST /api/friends/request

向某用户发送好友请求。请求体：

```json
{ "name": "bob" }
```

响应：

```json
{ "ok": true }
```

错误：`404`（`api.user.notFound` 用户不存在）、`409`（已是好友 / 已发过请求）。重复或反向申请会被拒（服务端 `friends.ts` 双向互加，拒绝反向 / 重复申请）。

## POST /api/friends/accept

接受某用户发来的好友请求。请求体：

```json
{ "name": "bob" }
```

响应 `{ "ok": true }`。接受后双方建立好友关系，可发起私聊。

## POST /api/friends/decline

拒绝好友请求。请求体：

```json
{ "name": "bob" }
```

响应 `{ "ok": true }`。

## 好友门禁

- **私聊必须先互为好友**：通过 WebSocket 发私聊消息前，服务端校验 `friends.isFriend`，非好友请求被静默拒绝（不发也不报错，只是不送达）。
- **「正在输入」同理**：`typing` 的 `pm` 方向只对好友转发，非好友不转发。
- 好友关系用 `pairKey(a,b)`（字典序 `[小:大]`）存储，双向互加只生成一条关系记录。

## POST /api/report

举报消息或用户，用于治理。请求体：

```json
{ "idx": 123, "reason": "骚扰", "type": "message" }
```

| 字段 | 说明 |
| --- | --- |
| `idx` | 被举报消息的索引（`type=message` 时必填） |
| `reason` | 举报原因文本 |
| `type` | 举报类型，如 `message` / `user` |

响应：

```json
{ "ok": true }
```

举报会记录举报者 IP 与消息快照，进入管理员待处理队列，见 [管理端 API · 举报处理](../api/admin.md#举报处理)。
