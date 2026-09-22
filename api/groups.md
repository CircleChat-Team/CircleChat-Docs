# 群组

群组相关的全部接口。群组以 `gid` 标识（16 位 hex 字符串）。鉴权总览见 [API 概览](overview.md)。

## GET /api/groups

返回当前用户**已加入**的群组列表。

```json
{
  "ok": true,
  "groups": [
    { "gid": "a1b2c3d4e5f6a7b8", "name": "技术群", "owner": "alice", "announce": "", "avatar": "" }
  ]
}
```

## POST /api/groups

创建群组，自己成为群主。请求体：

```json
{ "name": "技术群", "desc": "讨论技术" }
```

响应含新群组信息：

```json
{ "ok": true, "gid": "a1b2c3d4e5f6a7b8", "name": "技术群" }
```

## DELETE /api/groups

解散群组（仅群主 / 管理员）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8" }
```

响应 `{ "ok": true }`。

## GET /api/groups/members?gid=\<gid\>

获取群成员列表（附带在线状态与头像）。

```json
{ "ok": true, "members": [ { "name": "alice", "online": true, "role": "owner" } ] }
```

## POST /api/groups/join

加入**无需审核**的群。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8" }
```

响应 `{ "ok": true }`。需要审核的群改用 `groups/request`。

## POST /api/groups/leave

退出群组。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8" }
```

> 群主**不能退群**（服务端拒绝 owner 退群）。要先 `groups/transfer` 把群主转给别人，或 `DELETE /api/groups` 直接解散。

## POST /api/groups/rename

重命名群组（群主 / 管理员）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "name": "新名字" }
```

响应 `{ "ok": true }`。

## POST /api/groups/avatar

修改群头像。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "avatar": "https://example.com/icon.png" }
```

头像**只接受 `http(s)` 链接**（`/^https?:\/\//i`），不接受本地路径或 `javascript:` 之类的伪协议。

## POST /api/groups/announce

发布群公告。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "announce": "公告内容（最长 500 字）" }
```

公告超过 500 字会被拒。响应 `{ "ok": true }`。

## GET /api/groups/search?q=\<keyword\>

按关键字搜索公开群组。

```json
{ "ok": true, "groups": [ { "gid": "a1b2c3d4e5f6a7b8", "name": "技术群" } ] }
```

## GET /api/groups/all

获取全部可加入的群组列表（用于「发现群」一类入口）。

## POST /api/groups/request

向**需要审核**的群发送入群申请。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8" }
```

响应 `{ "ok": true }`。状态：`pending` / `approved` / `rejected`。

## GET /api/groups/manage?gid=\<gid\>

获取群管理信息（成员、待审核入群请求等），群主 / 管理员可用。

## GET /api/groups/logs?gid=\<gid\>

获取群操作日志（群主 / 管理员）。

## POST /api/groups/request/approve

通过某成员的入群申请。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "name": "alice" }
```

响应 `{ "ok": true }`。

## POST /api/groups/request/reject

拒绝某成员的入群申请。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "name": "alice" }
```

响应 `{ "ok": true }`。

## POST /api/groups/members/remove

将成员移出群（群主 / 管理员）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "name": "alice" }
```

响应 `{ "ok": true }`。

## POST /api/groups/transfer

转让群主。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "name": "bob" }
```

新群主**必须是群成员**，否则拒绝。响应 `{ "ok": true }`。

## POST /api/groups/file/delete

删除群内上传的文件。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "url": "/uploads/xxxx.png" }
```

响应 `{ "ok": true }`。

---

## 群相关权限矩阵

| 操作 | 群主 / 管理员 | 群成员 |
| --- | --- | --- |
| 解散 / 重命名 / 设公告 / 转让 | ✅ | ❌ |
| 移除成员 / 审核入群 | ✅ | ❌ |
| 看管理信息 / 群日志 | ✅ | （管理端） |
| 看群消息 | ✅ | ✅（须是成员，否则 `403`） |
| 发群消息 | ✅ | ✅（须是成员） |

> 私聊相关接口见 [好友与用户](friends.md)；实时收发走 [WebSocket 协议](websocket.md)。
