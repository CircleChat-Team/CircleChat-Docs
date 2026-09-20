# 群组

群组相关的全部接口。群组以 `gid` 标识（字符串，≤64 字符）。

## GET /api/groups

返回当前用户加入的群组列表。

```json
{ "ok": true, "groups": [ { "gid": "...", "name": "...", ... } ] }
```

## POST /api/groups

创建群组。请求体：

```json
{ "name": "技术群", "desc": "讨论技术" }
```

响应含新群组信息。

## DELETE /api/groups

解散群组（仅群主 / 管理员）。请求体：

```json
{ "gid": "..." }
```

## GET /api/groups/members?gid=\<gid\>

获取群成员列表（附带在线状态与头像）。

```json
{ "ok": true, "members": [ { "name": "alice", "online": true, ... } ] }
```

## POST /api/groups/join

加入群组（无需审核的群）。请求体：

```json
{ "gid": "..." }
```

## POST /api/groups/leave

退出群组。请求体：

```json
{ "gid": "..." }
```

## POST /api/groups/rename

重命名群组（群主 / 管理员）。请求体：

```json
{ "gid": "...", "name": "新名字" }
```

## POST /api/groups/avatar

修改群头像。请求体：

```json
{ "gid": "...", "avatar": "/uploads/..." }
```

## POST /api/groups/announce

发布群公告。请求体：

```json
{ "gid": "...", "announce": "公告内容" }
```

## GET /api/groups/search?q=\<keyword\>

搜索公开群组。

```json
{ "ok": true, "groups": [ { "gid": "...", "name": "..." } ] }
```

## GET /api/groups/all

获取全部（可加入的）群组列表。

## POST /api/groups/request

发送入群申请（需审核的群）。请求体：

```json
{ "gid": "..." }
```

## GET /api/groups/manage?gid=\<gid\>

获取群管理信息（成员、待审核入群请求等）。

## GET /api/groups/logs?gid=\<gid\>

获取群操作日志（群主 / 管理员）。

## POST /api/groups/request/approve

通过某成员的入群申请。请求体：

```json
{ "gid": "...", "name": "alice" }
```

## POST /api/groups/request/reject

拒绝某成员的入群申请。请求体：

```json
{ "gid": "...", "name": "alice" }
```

## POST /api/groups/members/remove

将成员移出群（群主 / 管理员）。请求体：

```json
{ "gid": "...", "name": "alice" }
```

## POST /api/groups/transfer

转让群主。请求体：

```json
{ "gid": "...", "name": "bob" }
```

## POST /api/groups/file/delete

删除群内上传的文件。请求体：

```json
{ "gid": "...", "url": "/uploads/..." }
```

---

## 群相关权限矩阵

| 操作 | 群主 / 管理员 | 群成员 |
| --- | --- | --- |
| 解散 / 重命名 / 设公告 / 转让 | ✅ | ❌ |
| 移除成员 / 审核入群 | ✅ | ❌ |
| 看管理信息 / 群日志 | ✅ | ✅（管理端） |
| 看群消息 | ✅ | ✅（须是成员，否则 `403`） |
| 发群消息 | ✅ | ✅（须是成员） |