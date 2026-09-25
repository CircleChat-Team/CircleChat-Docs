# 群组

群组相关的全部接口。群组以 `gid` 标识（16 位 hex 字符串）。

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

## POST /api/groups/member/nickname

设置**我在本群的昵称**（群内展示名，所有人都看得到）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "nickname": "小王" }
```

`nickname` 传空串表示清除昵称、恢复显示账号名。只能改自己的，须是本群成员。
响应 `{ "ok": true }`，并广播 `group.members` 让其他成员刷新成员列表。

> 与「群备注」区分：群昵称是**对外**展示的，群备注是**自己**给群起的别名，见下方 `/api/groups/remark`。

## POST /api/groups/member/role

设 / 取消管理员（仅群主；平台管理员亦可）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "name": "alice", "role": "admin" }
```

`role` 取 `admin` 或 `member`。群主的角色不可改（`400`）。
响应 `{ "ok": true }`，广播 `groups.changed` 与 `group.members`。

## POST /api/groups/member/mute

禁言 / 解除禁言单个成员（群主或管理员）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "name": "alice", "muted": true }
```

不能禁言群主，也不能禁言自己（`400`）。响应 `{ "ok": true }`。

## POST /api/groups/muteall

开启 / 关闭**全员禁言**（群主或管理员）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "val": true }
```

开启后只有群主与管理员能发言，其余成员发消息会被拦回 `api.msg.groupMuted`。
响应 `{ "ok": true }`，广播 `groups.changed`。

## POST /api/groups/invite/setting

设置「普通成员邀请是否需要群主 / 管理员审批」（群主或平台管理员）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "memberInviteApprove": true }
```

- `true`：成员发起的邀请先进入待审批，管理者同意后才发给被邀请人；
- `false`：成员可直接邀请，被邀请人自己决定接不接受。

响应 `{ "ok": true }`。

## POST /api/groups/invite

邀请某人入群（群成员即可发起）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "invitee": "bob", "note": "来聊聊" }
```

三种结果：

| 情况 | 响应 |
| --- | --- |
| 对方设置了「允许任何人邀请我」 | `{ "ok": true, "autoJoined": true }` —— 直接入群 |
| 本群开了邀请审批，且发起者是普通成员 | `{ "ok": true }` + 状态 `pending`（等管理者审批） |
| 其余 | `{ "ok": true }` + 状态 `pending`（等对方接受） |

错误：`404`（`api.user.notFound` 用户不存在）、`403`（`api.group.noView` 不是本群成员）、`409`（已在群里 / 已邀请过等）。

## GET /api/groups/invites

列出与我相关的邀请：

```json
{ "ok": true, "invites": [{ "id": 1, "gid": "a1b2c3d4e5f6a7b8", "inviter": "alice", "invitee": "bob", "created": 1789900000000, "status": "pending", "note": "来聊聊" }] }
```

## POST /api/groups/invite/approve

群主 / 管理员审批通过某条待审批邀请。请求体 `{ "id": 1 }`，响应 `{ "ok": true }`。

## POST /api/groups/invite/reject

撤销 / 拒绝某条邀请：邀请人、被邀请人、群管理者都可以操作。请求体 `{ "id": 1 }`，响应 `{ "ok": true }`；已处理的返回 `409`。

## POST /api/groups/invite/accept

被邀请人接受邀请入群。请求体 `{ "id": 1 }`，响应 `{ "ok": true }`。

## POST /api/groups/remark

设置**我对这个群的备注**（仅自己可见，侧栏里替代群名显示）。请求体：

```json
{ "gid": "a1b2c3d4e5f6a7b8", "remark": "项目组" }
```

传空串表示清除备注。须是本群成员，响应 `{ "ok": true }`。

## GET /api/groups/remark?gid=\<gid\>

读取我给这个群的备注：

```json
{ "ok": true, "remark": "项目组" }
```

没设过返回空串。

---

## 群相关权限矩阵

「管理员」指群管理员，「平台管理员」是整站管理员（可越权操作任意群）。

| 操作 | 群主 | 群管理员 | 平台管理员 | 群成员 |
| --- | --- | --- | --- | --- |
| 解散 / 重命名 / 设公告 / 转让 | ✅ | ❌ | ✅ | ❌ |
| 设 / 取消管理员 | ✅ | ❌ | ✅ | ❌ |
| 移除成员 / 审核入群申请 | ✅ | ❌ | ✅ | ❌ |
| 禁言成员 / 全员禁言 | ✅ | ✅ | ✅ | ❌ |
| 审批成员发起的邀请 | ✅ | ✅ | ✅ | ❌ |
| 邀请他人入群 | ✅ | ✅ | ✅ | ✅（可能需审批） |
| 设自己在群内的昵称 | ✅ | ✅ | ✅ | ✅ |
| 设群备注（仅自己可见） | ✅ | ✅ | ✅ | ✅ |
| 看管理信息 / 群日志 | ✅ | ✅ | ✅ | ❌ |
| 看群消息 | ✅ | ✅ | ✅ | ✅（须是成员，否则 `403`） |
| 发群消息 | ✅（不受全员禁言） | ✅（不受全员禁言） | ✅ | ✅（全员禁言时 `api.msg.groupMuted`） |
| 退群 | ❌（须先转让） | ✅ | ✅ | ✅ |

> 私聊相关接口见 [好友与用户](friends)；实时收发走 [WebSocket 协议](websocket)。
