# API Key

API Key 用于**脚本 / 机器人 / 第三方集成**以你的身份调用 HTTP 接口（发消息、读好友、管群等）。

它与登录会话的关系：

- 会话 Cookie 是全权的，不需要 scope；
- API Key 是**受限凭据**：必须声明 scope，且带独立的每分钟限速；
- 会话 Cookie 与 API Key 二选一即可，服务端先认 Cookie，没有再认 Key。

对应界面：个人中心 →「安全」→「API Key」页签。

## 鉴权方式

两种写法等价，服务端都会读取：

```bash
# 方式一：Authorization 头
curl -H 'Authorization: Bearer cc_1a2b3c4d_xxxx...' https://chat.example.com/api/me

# 方式二：X-API-Key 头
curl -H 'X-API-Key: cc_1a2b3c4d_xxxx...' https://chat.example.com/api/me
```

Key 的格式是 `cc_<8位前缀>_<48位密钥>`。服务端**只存 sha256 哈希**，明文仅在创建时返回一次，之后无法找回——忘了就删掉重建。

## GET /api/keys

列出当前账号的 Key（不含明文）与可授予的 scope 列表。

```json
{
  "ok": true,
  "keys": [
    {
      "id": 3,
      "name": "备份脚本",
      "prefix": "1a2b3c4d",
      "scopes": ["messages.read", "messages.send"],
      "rateLimit": null,
      "created": 1789900000000,
      "lastUsed": 1789901234567,
      "expires": null,
      "revoked": false
    }
  ],
  "scopes": ["profile.read", "profile.write", "...", "admin"],
  "defaultRate": 60,
  "isAdmin": false
}
```

| 字段 | 说明 |
| --- | --- |
| `prefix` | 明文里的 8 位前缀，用于在界面上辨认是哪一把 Key |
| `rateLimit` | 该 Key 的限速（次/分钟），`null` 表示用默认值 60 |
| `lastUsed` | 最近一次使用时间，长期不用的 Key 建议吊销 |
| `expires` | 过期时间戳，`null` 表示长期有效 |

## POST /api/keys

创建一把 Key。**明文只在此次响应里出现一次**。

请求体：

```json
{ "name": "备份脚本", "scopes": ["messages.read", "messages.send"], "rateLimit": 30, "expiresDays": 90 }
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | ✅ | 备注名，最长 40 |
| `scopes` | ✅ | 至少一项，未知值会被丢弃；全被丢弃则创建失败 |
| `rateLimit` | | 次/分钟，1–6000；不填或非法用默认值 60 |
| `expiresDays` | | 有效天数；不填则长期有效 |

响应：

```json
{
  "ok": true,
  "key": { "id": 3, "name": "备份脚本", "prefix": "1a2b3c4d", "scopes": ["messages.read", "messages.send"], "rateLimit": 30, "created": 1789900000000, "lastUsed": null, "expires": 1789900000000, "revoked": false },
  "plaintext": "cc_1a2b3c4d_xxxx..."
}
```

错误：`400`（`api.key.invalid` 名称为空或 scope 全非法）、`403`（`api.forbidden` 非管理员却要 `admin` scope）。

## POST /api/keys/update

修改名称 / scope / 限速 / 有效期，或吊销。请求体：

```json
{ "id": 3, "name": "新名字", "scopes": ["messages.read"], "rateLimit": 60, "expiresDays": 30, "revoked": true }
```

`id` 必填；其余字段不传表示不改。`revoked: true` 是**吊销**（立即失效，可再改成 `false` 恢复）。
错误：`400`（`api.key.invalid` 参数非法或 Key 不属于你）、`403`（非管理员改出 `admin` scope）。

## POST /api/keys/delete

彻底删除。请求体 `{ "id": 3 }`。错误：`404`（`api.key.notFound`）。

## Scope 一览

| Scope | 覆盖能力 |
| --- | --- |
| `profile.read` | 读自己的资料 / 设置 / 通知 / 处罚 / 申诉 / 公告 |
| `profile.write` | 改资料与设置、标记通知已读 |
| `security` | 改密码、两步验证开关、解绑第三方登录 |
| `users.read` | 用户列表（`/api/users`） |
| `friends.read` | 好友列表 |
| `friends.write` | 好友请求 / 接受 / 拒绝 |
| `messages.read` | 读历史消息、搜索、举报 |
| `messages.send` | 发消息 |
| `groups.read` | 群列表、成员、搜索 |
| `groups.write` | 建群 / 加群 / 退群 / 入群申请 |
| `groups.manage` | 解散、改名、公告、移人、审批、转让等管理动作 |
| `files.upload` | 上传（单次与分片） |
| `admin` | 管理端接口；**只有管理员账号能授予** |

scope 按上表顺序返回，去重后固定排序。未匹配到任何 scope 的接口，兜底按 `profile.read` 校验。

以下接口**不接受 API Key**，只能带会话 Cookie（防提权）：`/api/keys*`。

## 限速

- 每个 Key 一个固定 60 秒窗口，默认 **60 次/分钟**，可在创建时指定（上限 6000）；
- 超限返回 `429`（`api.rateLimited`）并带上 `Retry-After: 60`，超限期间不再累加计数。

## 安全建议

1. **按最小权限给 scope**：只读脚本就别给 `messages.send`；
2. **设有效期**：临时任务用 `expiresDays`，用完自动失效；
3. **定期看 `lastUsed`**：长期没用的直接吊销；
4. **别写进前端代码 / 日志**：Key 等同于你的账号，泄漏即可被冒用；
5. **怀疑泄漏就立刻吊销**（`revoked: true` 或直接删除），不用改密码；
6. 管理操作尽量仍用会话 Cookie，`admin` scope 的 Key 风险最高。

## 相关

- 鉴权分档与状态码见 [API 概览与鉴权](overview#鉴权方式)
- 实时收发走 [WebSocket 协议](websocket)，WebSocket 不支持 API Key，请用会话 Cookie
