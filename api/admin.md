# 管理端 API

所有接口以 `/api/admin/` 开头，要求**管理员权限**（非管理员返回 `403`）。

## 举报处理

### GET /api/admin/reports

获取举报待处理列表。

### POST /api/admin/reports/dismiss

驳回（关闭）举报。请求体：

```json
{ "id": 1 }
```

### POST /api/admin/reports/punish

对举报对象执行处罚。请求体：

```json
{ "id": 1, "user": "alice", "action": "mute", "duration": 3600 }
```

处罚后会自动生成用户通知。

## 处罚管理

### GET /api/admin/penalties

获取全部处罚记录。

### POST /api/admin/penalties/add

新增处罚。请求体：

```json
{ "user": "alice", "action": "ban", "duration": 86400 }
```

### POST /api/admin/penalties/revoke

撤销处罚。请求体：

```json
{ "id": 1 }
```

> 处罚类型包括禁言（muted）、封禁（banned）、IP 封禁（ipBanned）。处罚信息会以 WebSocket `penalty` 消息推送给被处罚用户，详见[WebSocket 协议](websocket.md#服务端推送)。

## 公告

### POST /api/admin/announcements

发布公告。请求体：

```json
{ "title": "标题", "content": "内容" }
```

响应：

```json
{ "ok": true, "id": 1 }
```

### DELETE /api/admin/announcements

删除公告。请求体：

```json
{ "id": 1 }
```

## 用户管理

### GET /api/admin/users

获取全部用户及状态（激活 / 待审 / 封禁等）。

### GET /api/admin/approvals

获取待审核的注册申请列表。

### POST /api/admin/review/approve

通过注册申请。请求体：

```json
{ "name": "alice" }
```

### POST /api/admin/review/reject

拒绝注册申请。请求体：

```json
{ "name": "alice" }
```

### POST /api/admin/user/add

新增用户。请求体：

```json
{ "name": "alice", "password": "******" }
```

### POST /api/admin/user/del

删除用户。请求体：

```json
{ "name": "alice" }
```

### POST /api/admin/user/image

设置用户头像。请求体：

```json
{ "name": "alice", "image": "/uploads/..." }
```

### POST /api/admin/user/rename

重命名用户。请求体：

```json
{ "name": "alice", "newName": "alice2" }
```

### POST /api/admin/user/pass

重置用户密码。请求体：

```json
{ "name": "alice", "password": "新密码" }
```

## 文件管理

### GET /api/admin/files

获取已上传文件列表（与保留策略相关）。

### POST /api/admin/file/del

删除指定文件。请求体：

```json
{ "url": "/uploads/xxx.png" }
```

## 操作日志

### GET /api/admin/logs

分页获取审计 / 操作日志（`GET` 参数带分页条件）。

```json
{ "ok": true, "logs": [ { "actor": "alice", "action": "login", "detail": "...", "ip": "...", "ts": 1789900000000 } ] }
```

`action` 取值范围见 [开发指南 · 审计动作](../development/contribute.md)。