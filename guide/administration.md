# 管理后台

管理能力集中在管理面板 `admin.html`（由 `AppAdmin` 驱动），仅对 `role=admin` 开放，所有管理操作都受管理员角色限制，并写入审计日志（`audit.add`）。入口有服务端与前端两层限制：

- **服务端鉴权**：对 `/admin.html` 与 `/js/admin.js` 做鉴权，非管理员被 302 重定向到聊天页。
- **前端拦截**：`main-admin.ts` 再拦一道，`role !== 'admin'` 跳回聊天页。

管理面板分五个业务页签：**审核 / 用户 / 治理 / 文件 / OAuth / 日志**（对应源码卡片 Approvals / Users / Files / Logs / Moderation / OAuth）。

## 用户管理

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 用户列表 | GET | `/api/admin/users` |
| 新增用户 | POST | `/api/admin/user/add` |
| 删除用户 | POST | `/api/admin/user/del` |
| 重命名 | POST | `/api/admin/user/rename` |
| 改头像 | POST | `/api/admin/user/image` |
| 重置密码 | POST | `/api/admin/user/pass` |

- **用户列表**（`GET /api/admin/users`）：查看全部用户及状态——激活（active）/ 待审（pending）/ 封禁（banned）等。
- **新增用户**（`POST /api/admin/user/add`）：在面板直接建账号设密码；也可走命令行 `npm run adduser -- <用户名> [新密码]`，省略密码则交互式隐藏输入。
- **删除用户**（`POST /api/admin/user/del`）：移除用户，并清掉其消息、私聊、回应、群组、好友里的引用（在 `auth.renameUser` 同类的清理逻辑里做事务处理）。
- **重命名**（`POST /api/admin/user/rename`）：改用户名，在一个事务里同步 users / messages / dm / reactions / groups / friends 的全部引用。
- **改头像**（`POST /api/admin/user/image`）：设置用户头像（`/uploads/...`）。
- **重置密码**（`POST /api/admin/user/pass`）：为用户设置新密码，无需旧密码。

## 注册审核

开放注册产生的账号先进入 `pending`，审核通过前无法登录。未过审（待审或被拒）的账号登录时返回 403 对应提示。

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 待审列表 | GET | `/api/admin/approvals` |
| 通过 | POST | `/api/admin/review/approve` |
| 拒绝 | POST | `/api/admin/review/reject` |

- 待审列表在「审核」页签。
- **通过**（`POST /api/admin/review/approve`）：账号激活，用户可登录。
- **拒绝**（`POST /api/admin/review/reject`）：账号被拒，无法登录。

## 举报与处罚

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 举报处理 | GET | `/api/admin/reports` |
| 驳回 | POST | `/api/admin/reports/dismiss` |
| 从举报执行处罚 | POST | `/api/admin/reports/punish` |
| 处罚记录 | GET | `/api/admin/penalties` |
| 撤销处罚 | POST | `/api/admin/penalties/revoke` |
| 新增处罚 | POST | `/api/admin/penalties/add` |

- **举报处理**（`GET /api/admin/reports`）：查看用户上报的举报，每条记录举报者 IP 与消息快照。可**驳回**（`POST /api/admin/reports/dismiss`）或**从举报执行处罚**（`POST /api/admin/reports/punish`，带 `user` / `action` / `duration`）。
- **处罚类型**：`warning`（警告）/ `mute`（禁言）/ `ban`（封禁）/ `ipban`（IP 封禁）。时长上限 `MAX_DAYS = 3650` 天；永久处罚 `expires = null`。
- **处罚记录**（`GET /api/admin/penalties`）：查看全部处罚，可**撤销**（`POST /api/admin/penalties/revoke`）；新增处罚走 `POST /api/admin/penalties/add`（`user` / `action` / `duration`）。
- **自动通知**：执行账号类处罚后，系统自动向被处罚用户写一条站内「通知」，并实时推 `penalty` WebSocket 消息，前端据此禁用输入框。
- **服务端拦截**：`moderate.blockFor` 计算 muted / banned / ipBanned 状态，发消息或建连时都会被拦。处罚状态由服务端计算，不是前端自判，无法绕过限制。

## 公告

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 发布公告 | POST | `/api/admin/announcements` |
| 删除公告 | DELETE | `/api/admin/announcements` |

- **发布**（`POST /api/admin/announcements`）：系统级公告，标题 + 内容，全员可见，出现在每用户信箱「公告」标签，返回新建 `id`。
- **删除**（`DELETE /api/admin/announcements`）：删已有公告，需带 `id`。

## 文件管理

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 查看文件 | GET | `/api/admin/files` |
| 删除单个 | POST | `/api/admin/file/del` |
| 批量删除 | POST | `/api/admin/files/del-batch` |

- **查看**（`GET /api/admin/files`）：已上传文件列表，可与 `FILE_TTL_DAYS` 保留策略配合查看哪些快过期。
- **删除单个**（`POST /api/admin/file/del`）：删指定文件，带 `url`，用 `path.basename` 比对防穿越。
- **批量删除**（`POST /api/admin/files/del-batch`）：一次清多个。

## 操作日志

- **审计日志**（`GET /api/admin/logs`）：分页查看审计 / 操作日志——登录、登出、发消息、上传、处罚、举报等活动，以及来源 IP。`audit.list` 支持按 actor / action / target / actionPrefix / excludeActions 过滤。`detail` 以结构化 `{k: i18n键, v: 占位变量}` 存储，前端按语言翻译；单条详情上限 300 字符，总容量 5000 条。
- **访问日志**：所有 HTTP 请求与 WebSocket 连接以 JSON 行写入 `data/access.log`，可配合外部日志系统（ELK / Loki 等）做更细的监控，不在管理面板内。

## OAuth 配置

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 管理 OAuth | GET/POST | `/api/admin/oauth` |
| 用户侧 providers | GET | `/api/oauth/providers` |
| 用户侧 me | GET | `/api/oauth/me` |
| 用户侧 unbind | POST | `/api/oauth/github/unbind` |

- **管理侧**：管理面板「OAuth」页签管理 GitHub 登录账号，`GET/POST /api/admin/oauth` 读写 GitHub 的 `client_id` / `client_secret`，secret 存 `app_config`，永不下发前端。
- **用户侧流程**：`GET /api/oauth/providers` 查看可用 Provider、`<start>` 跳转授权、`<callback>` 回跳绑定、`GET /api/oauth/me` 查看绑定状态、`POST /api/oauth/github/unbind` 解绑（`<start>` / `<callback>` 为占位表示）。

## 依赖命令行

| 命令 | 作用 |
| --- | --- |
| `npm run adduser -- <用户名> [新密码]` | 新增 / 重置用户密码（服务端命令行，适合无界面时批量建号） |

## 相关文档

- 更多安全与数据细节见[配置说明 · 内置安全限制](../getting-started/configuration#内置安全限制)。
- 接口字段与请求体见 [API 参考 · 管理端 API](../api/admin)。