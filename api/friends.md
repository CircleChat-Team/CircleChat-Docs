# 好友与用户

用户搜索、好友关系（请求 / 接受 / 拒绝）与举报。

## GET /api/users

返回服务端用户列表（可用于搜索 / 加好友）。响应为名字数组或用户对象数组，`decorateNames` 会附带在线状态与头像。

```json
{ "ok": true, "users": [ "alice", "bob" ] }
```

## GET /api/friends

返回当前用户的好友列表，附带在线状态与头像字段。

```json
{
  "ok": true,
  "users": [
    { "name": "bob", "online": true, "image": "/uploads/..." }
  ]
}
```

## POST /api/friends/request

发送好友请求。请求体：

```json
{ "name": "bob" }
```

响应：

```json
{ "ok": true }
```

错误：`404`（`api.user.notFound` 用户不存在）、`409`（已是好友 / 已请求过）。

## POST /api/friends/accept

接受好友请求。请求体：

```json
{ "name": "bob" }
```

## POST /api/friends/decline

拒绝好友请求。请求体：

```json
{ "name": "bob" }
```

## 好友门禁

- 私聊要求**先互为好友**：通过 WebSocket 发送私聊消息前，服务端校验 `friends.isFriend`，非好友请求被静默拒绝。
- 「正在输入」同样只转发给**好友**（`friends.isFriend` 校验）。

## POST /api/report

举报消息或用户（用于治理）。请求体（按前端实现），例如：

```json
{ "idx": 123, "reason": "骚扰", "type": "message" }
```

响应：

```json
{ "ok": true }
```

举报内容进入管理员待处理队列，见[管理端 API · 举报处理](admin.md#举报处理)。