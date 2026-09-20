# WebSocket 协议

实时能力（消息、在线状态、正在输入、表情回应、撤回、处罚推送）全部经由 WebSocket 完成。协议为**自研实现**（`server/lib/ws.ts`），零第三方依赖：自实现握手、帧编解码、粘包处理、分片重组、掩码解码、Ping/Pong、Close。

## 连接

- **地址**：`<apiBase>/ws`（如 `ws(s)://host/ws`）。
- **鉴权**：登录后携带会话 Cookie 建立连接。握手通过标准 `Sec-WebSocket-*` 完成。
- **消息上限**：单条消息最大 **2MB**（防滥用）。

## 数据格式

所有通信均为 UTF-8 文本帧，JSON 编码，统一结构为：

```json
{ "type": "...", "data": { ... } }
```

服务端使用 `encodeText` 发送 TEXT 帧；服务端会按协议定时发送 PING（客户端应回 PONG）。

---

## 客户端 → 服务端

### `ping`

心跳。服务端回 `pong`。

```json
{ "type": "ping" }
```

### `typing`

「正在输入」提示。服务端节流（同一用户 2 秒内只转发一次），且**不回显给发起者**。

```json
{ "type": "typing", "data": { "pm": "bob" } }
```

- `pm` 为空：当前房间群聊广播；非空：仅推给该好友（**非好友不转发**）。

### `status`

更新在线 / 隐身 / 离开状态，并触发在线状态广播。

```json
{ "type": "status", "data": { "invisible": false, "away": false } }
```

### `msg`

发送消息。`data` 关键字段：

```json
{
  "type": "msg",
  "data": {
    "type": "text",
    "content": "你好",
    "pm": "bob",
    "gid": "群id",
    "name": "文件名",
    "size": 123,
    "replyTo": 100,
    "md": 0
  }
}
```

- `type`：`text` / `image` / `file` / `video` / `audio` / `merge`。
- 房间二选一：`pm`（私聊对方用户名）或 `gid`（群 id）。
- 服务端强校验：
  - 禁言 / 封禁用户被拦截，回推 `penalty`。
  - 私聊须互为好友；不能给自己发；对方账号须存在。
  - 群聊须是成员；文本非空；文本上限 **4096** 字符（merge ≤ 8000，其余媒体类 ≤ 300）。
  - `image/file/video/audio` 的 `content` 必须是 `^/uploads/...` 合法路径。
  - `replyTo` 仅接受同一房间存在且未撤回的消息。

成功后服务端向房间广播 `{ type: 'msg', data: <消息记录> }` 并写入审计。

### `react`

表情回应。

```json
{ "type": "react", "data": { "idx": 100, "emoji": "👍" } }
```

- 已撤回的消息不能回应；私聊仅双方可回应。
- emoji 按码点截断（≤ 4 个码点）。

### `recall`

撤回消息。

```json
{ "type": "recall", "data": { "idx": 100 } }
```

- 只能撤回自己的消息；**管理员可撤回任意人消息**。
- 私聊仅双方可撤回。

---

## 服务端 → 客户端

### `pong`

对客户端 `ping` 的应答。

```json
{ "type": "pong", "ts": 1789900000000 }
```

### `presence`

在线状态广播（用户不隐身时才会出现在 `present` 列表中）。

```json
{ "type": "presence", "users": ["alice", "bob"], "away": ["bob"] }
```

### `msg`

新消息广播给房间内目标。`data` 为完整消息记录。

### `typing`

正在输入转发。`data: { from: "alice" }`。

### `reaction`

表情回应变更。

```json
{ "type": "reaction", "data": { "idx": 100, "emoji": "👍", "added": true, "reactions": {}, "by": "alice" } }
```

### `recall`

撤回广播。

```json
{ "type": "recall", "data": { "idx": 100, "by": "alice", "owner": "alice", "admin": false } }
```

`admin` 为 `true` 表示管理员代删他人消息。

### `penalty`

处罚推送：被禁言 / 封禁的用户发消息、建立连接时会被推送，用于前端禁用输入。

```json
{ "type": "penalty", "data": { "muted": true, "banned": false, "mutedUntil": 1789900000000, "bannedUntil": 0 } }
```

---

## 广播规则

| 事件 | 广播范围 |
| --- | --- |
| `msg` / `reaction` / `recall` | 群聊：该 `gid` 其余在线成员；私聊：对方 |
| `typing` | 私聊仅好友单点；群聊推给其余所有在线 |
| `presence` | 全体在线（除隐身用户） |
| `penalty` | 被处罚用户 |