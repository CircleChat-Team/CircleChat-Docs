# 站内信箱

站内信箱包含两类内容：

- **公告（announcements）**：管理员发布，全员可见，全局广播。
- **通知（notifications）**：按用户分发（如处罚结果），用户维度。

数据表由 `server/lib/mailbox.ts` 在首次访问时自动创建。

## 读取公告列表（全员）

### GET /api/announcements

返回系统公告列表。

```json
{
  "ok": true,
  "announcements": [
    { "id": 1, "title": "更新公告", "content": "...", "actor": "admin", "created": 1789900000000, "updated": 1789900000000 }
  ]
}
```

## 读取我的通知

### GET /api/me/notifications

返回当前用户的个人通知（如处罚结果通知）。

```json
{
  "ok": true,
  "notifications": [
    { "id": 1, "kind": "penalty", "title": "禁言通知", "body": "...", "created": 1789900000000, "read": 0 }
  ]
}
```

## 标记通知已读

### POST /api/me/notifications/read

将通知标记为已读。请求体：

```json
{ "ids": [1, 2, 3] }
```

响应：

```json
{ "ok": true }
```

## 管理端

公告的**发布 / 删除**由管理员操作，走管理端接口，见[管理端 API · 公告](admin#公告)。涉及：

- `POST /api/admin/announcements`：发布公告
- `DELETE /api/admin/announcements`：删除公告

处罚通知由治理流程自动写入通知表（管理员处罚用户后自动推送），不必手动创建。