# 管理端 API

所有接口以 `/api/admin/` 开头，要求**管理员权限**（非管理员返回 `403`）。管理面板的每个页签都对应这里的一组接口。

## 举报处理

### GET /api/admin/reports

获取举报待处理列表。每条含举报者 IP、消息快照与被举报内容。

```json
{
  "ok": true,
  "reports": [
    { "id": 1, "reporter": "bob", "ip": "1.2.3.4", "idx": 123, "reason": "骚扰", "snapshot": "..." }
  ]
}
```

### POST /api/admin/reports/dismiss

驳回（关闭）举报。请求体：

```json
{ "id": 1 }
```

响应 `{ "ok": true }`。

### POST /api/admin/reports/punish

对举报对象执行处罚（一步到位，免去先查再罚）。请求体：

```json
{ "id": 1, "user": "alice", "action": "mute", "duration": 3600 }
```

处罚后会自动向被处罚用户写站内通知。响应 `{ "ok": true }`。

## 处罚管理

处罚类型 `action` 取值：`warning`（警告）/ `mute`（禁言）/ `ban`（封禁）/ `ipban`（IP 封禁）。`duration` 单位秒，上限 `MAX_DAYS = 3650` 天；永久处罚传 `duration` 为 0 或足够大使 `expires = null`。

### GET /api/admin/penalties

获取全部处罚记录。

```json
{
  "ok": true,
  "penalties": [
    { "id": 1, "user": "alice", "action": "mute", "duration": 3600, "expires": 1789903600000, "reason": "刷屏", "actor": "admin" }
  ]
}
```

### POST /api/admin/penalties/add

新增处罚。请求体：

```json
{ "user": "alice", "action": "ban", "duration": 86400 }
```

响应 `{ "ok": true }`。

### POST /api/admin/penalties/revoke

撤销处罚。请求体：

```json
{ "id": 1 }
```

响应 `{ "ok": true }`。

> 处罚信息会以 WebSocket `penalty` 消息实时推送给被处罚用户，前端据此禁用输入框，详见 [WebSocket 协议](websocket#penalty)。

## 公告

### POST /api/admin/announcements

发布系统公告（全员可见）。请求体：

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

响应 `{ "ok": true }`。

## 用户管理

### GET /api/admin/users

获取全部用户及状态（激活 / 待审 / 封禁等）。

```json
{
  "ok": true,
  "users": [
    { "name": "alice", "role": "user", "status": "active", "last_seen": 1789900000000 }
  ]
}
```

### GET /api/admin/approvals

获取待审核的注册申请列表（`pending` 状态账号）。

### POST /api/admin/review/approve

通过注册申请。请求体：

```json
{ "name": "alice" }
```

响应 `{ "ok": true }`。通过后账号激活，可登录。

### POST /api/admin/review/reject

拒绝注册申请。请求体：

```json
{ "name": "alice" }
```

### POST /api/admin/user/add

新增用户。请求体：

```json
{ "name": "alice", "password": "Passw0rd!" }
```

### POST /api/admin/user/del

删除用户。请求体：

```json
{ "name": "alice" }
```

删除会在一个事务里清理其消息、私聊、回应、群组、好友引用。

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

会同步更新 users / messages / dm / reactions / groups / friends 里的全部引用。

### POST /api/admin/user/pass

重置用户密码（无需旧密码）。请求体：

```json
{ "name": "alice", "password": "新密码" }
```

## 文件管理

### GET /api/admin/files

获取已上传文件列表（与 `FILE_TTL_DAYS` 保留策略相关）。

### POST /api/admin/file/del

删除指定文件。请求体：

```json
{ "url": "/uploads/xxx.png" }
```

### POST /api/admin/files/del-batch

批量删除文件。请求体：

```json
{ "urls": ["/uploads/xxx.png", "/uploads/yyy.png"] }
```

## 操作日志

### GET /api/admin/logs

分页获取审计 / 操作日志（登录、登出、发消息、上传、处罚、举报等）及来源 IP。支持 `actor` / `action` / `target` / `actionPrefix` / `excludeActions` 过滤与分页参数。

```json
{
  "ok": true,
  "logs": [
    { "actor": "alice", "action": "login", "detail": "{\"k\":\"audit.login\"}", "ip": "1.2.3.4", "ts": 1789900000000 }
  ]
}
```

`detail` 是结构化 `{k: i18n键, v: 占位变量}` 的 JSON 字符串，前端按语言翻译；单条详情上限 300 字符，总容量 5000 条。所有审计动作取值见 [开发指南 · 审计动作](../development/contribute#审计动作常量)。

## OAuth 配置

### GET /api/admin/oauth

读取 GitHub OAuth 配置（`client_id` / `client_secret` 等，`secret` 永不下发前端，只回脱敏或占位）。

### POST /api/admin/oauth

更新 GitHub OAuth 配置。请求体：

```json
{ "clientId": "...", "clientSecret": "..." }
```

普通用户侧流程见 [好友与用户 · OAuth](../api/friends)（实际挂在 `oauth` 路径：`/api/oauth/providers`、`/api/oauth/github/start`、`/api/oauth/github/callback`、`/api/oauth/me`、`/api/oauth/github/unbind`）。
