# 管理后台

管理相关能力集中在**管理面板** `admin.html`（由 `AppAdmin` 驱动），入口只對 `role=admin` 开放：服务端对 `/admin.html`、`/js/admin.js` 做鉴权（非管理员 302 到聊天页），前端 `main-admin.ts` 再拦一道（`role !== 'admin'` 跳回聊天页）。所有管理操作都受管理员角色限制，并写入审计日志（`audit.add`）。

管理面板分五个页签：**审核 / 用户 / 治理 / 文件 / OAuth / 日志**（实际按源码里的卡片组织：Approvals / Users / Files / Logs / Moderation / OAuth）。

## 一、管理后台总览

管理后台是 CircleChat 中集中处理管理相关能力的位置。原文明确：管理相关能力集中在**管理面板** `admin.html`，由 `AppAdmin` 驱动。入口只對 `role=admin` 开放。

这句话可以拆成几个要点：

1. **管理面板文件是 `admin.html`**。  
   管理相关能力不是散落在普通聊天页面里，而是集中在管理面板中。

2. **由 `AppAdmin` 驱动**。  
   管理面板的运行逻辑与 `AppAdmin` 相关。

3. **入口只對 `role=admin` 开放**。  
   也就是说，只有管理员角色才能进入管理后台。

4. **服务端鉴权**。  
   服务端对 `/admin.html`、`/js/admin.js` 做鉴权。非管理员会被 302 到聊天页。

5. **前端再拦一道**。  
   前端 `main-admin.ts` 再拦一道：`role !== 'admin'` 跳回聊天页。

6. **所有管理操作都受管理员角色限制**。  
   管理操作不是任何人都能执行。

7. **所有管理操作写入审计日志**。  
   管理操作会通过 `audit.add` 写入审计日志。

因此，管理后台的定位可以理解为：面向管理员的管理入口，具备服务端与前端双重拦截，并且管理操作会被审计。

管理面板的页签与卡片组织在原文中这样描述：

> 管理面板分五个页签：**审核 / 用户 / 治理 / 文件 / OAuth / 日志**（实际按源码里的卡片组织：Approvals / Users / Files / Logs / Moderation / OAuth）。

可以整理为：

| 页签 | 源码卡片组织 |
| --- | --- |
| 审核 | Approvals |
| 用户 | Users |
| 治理 | Moderation |
| 文件 | Files |
| OAuth | OAuth |
| 日志 | Logs |

原文说“分五个页签”，但列出的项目是“审核 / 用户 / 治理 / 文件 / OAuth / 日志”，同时实际卡片组织是“Approvals / Users / Files / Logs / Moderation / OAuth”。这里按原文保留，不额外修正。

## 二、入口与双重鉴权

管理后台入口不是仅靠前端隐藏，而是有服务端与前端两道限制。

### 1. 服务端鉴权

服务端对以下路径做鉴权：

- `/admin.html`
- `/js/admin.js`

鉴权规则是：非管理员 302 到聊天页。

这意味着：

- 如果你不是管理员，直接访问 `/admin.html` 或 `/js/admin.js`，服务端会把你重定向到聊天页。
- 管理入口不是只靠“页面上不显示按钮”来限制，而是服务端会拦截。
- 302 表示重定向。

### 2. 前端拦截

前端 `main-admin.ts` 再拦一道：

- `role !== 'admin'` 跳回聊天页。

这意味着：

- 即使前端加载到了某个阶段，只要角色不是管理员，也会被跳回聊天页。
- 服务端与前端都有拦截，形成双重限制。

### 3. 管理操作限制与审计

原文明确：

- 所有管理操作都受管理员角色限制。
- 所有管理操作写入审计日志（`audit.add`）。

这意味着，管理操作不是匿名或普通用户可执行的。并且，执行管理操作会留下审计记录。

### 4. 入口与鉴权检查清单

- [ ] 管理面板是否是 `admin.html`？
- [ ] 管理面板是否由 `AppAdmin` 驱动？
- [ ] 入口是否只對 `role=admin` 开放？
- [ ] 服务端是否对 `/admin.html`、`/js/admin.js` 做鉴权？
- [ ] 非管理员是否会被 302 到聊天页？
- [ ] 前端 `main-admin.ts` 是否再拦一道？
- [ ] `role !== 'admin'` 是否跳回聊天页？
- [ ] 所有管理操作是否受管理员角色限制？
- [ ] 所有管理操作是否写入审计日志（`audit.add`）？

## 三、用户管理

用户管理是管理后台的重要部分。原文列出以下能力：

- **用户列表**（`GET /api/admin/users`）：查看全部用户及状态——激活（active）/ 待审（pending）/ 封禁（banned）等。
- **新增用户**（`POST /api/admin/user/add`）：在面板里直接建账号设密码；也可以走命令行 `npm run adduser -- <用户名> [新密码]`（省略密码则交互式隐藏输入）。
- **删除用户**（`POST /api/admin/user/del`）：移除用户。删除会清掉其消息、私聊、回应、群组、好友里的引用（在 `auth.renameUser` 同类的清理逻辑里做事务处理）。
- **重命名**（`POST /api/admin/user/rename`）：改用户名，会在一个事务里同步 users / messages / dm / reactions / groups / friends 的全部引用。
- **改头像**（`POST /api/admin/user/image`）：设用户头像（`/uploads/...`）。
- **重置密码**（`POST /api/admin/user/pass`）：为用户设新密码，不需要旧密码。

下面逐项展开。

### 1. 用户列表

接口：

```text
GET /api/admin/users
```

作用：

- 查看全部用户及状态。
- 状态包括：激活（active）/ 待审（pending）/ 封禁（banned）等。

这意味着，管理员可以通过该接口查看用户列表，并了解每个用户当前处于什么状态。原文列出三种状态示例：

- active：激活；
- pending：待审；
- banned：封禁。

“等”表示可能还有其他状态，但原文只列出这些示例。

### 2. 新增用户

接口：

```text
POST /api/admin/user/add
```

作用：

- 在面板里直接建账号设密码。
- 也可以走命令行：

```bash
npm run adduser -- <用户名> [新密码]
```

命令行说明：

- 省略密码则交互式隐藏输入。

这意味着，新增用户有两种方式：

1. 在管理面板里直接建账号设密码；
2. 使用命令行 `npm run adduser -- <用户名> [新密码]`。

命令行适合无界面时批量建号。原文在“依赖命令行”中进一步说明：

| 命令 | 作用 |
| --- | --- |
| `npm run adduser -- <用户名> [新密码]` | 新增 / 重置用户密码（服务端命令行，适合无界面时批量建号） |

### 3. 删除用户

接口：

```text
POST /api/admin/user/del
```

作用：

- 移除用户。
- 删除会清掉其消息、私聊、回应、群组、好友里的引用。
- 在 `auth.renameUser` 同类的清理逻辑里做事务处理。

这意味着，删除用户不是只删用户记录，还会清理相关引用：

- 消息；
- 私聊；
- 回应；
- 群组；
- 好友。

并且，这些清理是在 `auth.renameUser` 同类的清理逻辑里做事务处理。也就是说，删除用户与重命名用户有类似的清理逻辑，并且通过事务处理。

### 4. 重命名

接口：

```text
POST /api/admin/user/rename
```

作用：

- 改用户名。
- 会在一个事务里同步 users / messages / dm / reactions / groups / friends 的全部引用。

这意味着，重命名用户时，不只是改 users 表里的名字，还会同步：

- users
- messages
- dm
- reactions
- groups
- friends

并且是在一个事务里同步全部引用。这样做的目的是保持数据一致。

### 5. 改头像

接口：

```text
POST /api/admin/user/image
```

作用：

- 设用户头像（`/uploads/...`）。

这意味着，管理员可以为用户设置头像。头像路径形如 `/uploads/...`。

### 6. 重置密码

接口：

```text
POST /api/admin/user/pass
```

作用：

- 为用户设新密码。
- 不需要旧密码。

这意味着，管理员重置密码时，不需要知道用户旧密码。这与普通用户改密不同。原文没有说明普通用户改密流程，因此本文不补充。

### 7. 用户管理 API 速查

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 用户列表 | GET | `/api/admin/users` |
| 新增用户 | POST | `/api/admin/user/add` |
| 删除用户 | POST | `/api/admin/user/del` |
| 重命名 | POST | `/api/admin/user/rename` |
| 改头像 | POST | `/api/admin/user/image` |
| 重置密码 | POST | `/api/admin/user/pass` |

### 8. 用户管理检查清单

- [ ] 是否使用 `GET /api/admin/users` 查看全部用户及状态？
- [ ] 是否知道状态包括 active / pending / banned 等？
- [ ] 是否使用 `POST /api/admin/user/add` 在面板里建账号设密码？
- [ ] 是否知道也可以走 `npm run adduser -- <用户名> [新密码]`？
- [ ] 是否知道省略密码则交互式隐藏输入？
- [ ] 是否使用 `POST /api/admin/user/del` 移除用户？
- [ ] 是否知道删除会清掉其消息、私聊、回应、群组、好友里的引用？
- [ ] 是否知道删除在 `auth.renameUser` 同类的清理逻辑里做事务处理？
- [ ] 是否使用 `POST /api/admin/user/rename` 改用户名？
- [ ] 是否知道重命名会在一个事务里同步 users / messages / dm / reactions / groups / friends 的全部引用？
- [ ] 是否使用 `POST /api/admin/user/image` 设用户头像？
- [ ] 是否知道头像路径是 `/uploads/...`？
- [ ] 是否使用 `POST /api/admin/user/pass` 为用户设新密码？
- [ ] 是否知道重置密码不需要旧密码？

## 四、注册审核

开放注册产生的账号会进入 `pending`。

原文列出：

- **通过**（`POST /api/admin/review/approve`）：账号激活，用户可登录。
- **拒绝**（`POST /api/admin/review/reject`）：账号被拒，无法登录。
- 待审列表在「审核」页签（`GET /api/admin/approvals`）。
- 未过审的账号登录时返回 403 对应提示。

下面展开。

### 1. 开放注册与 pending

开放注册产生的账号会进入 `pending`。这意味着，注册后账号不是立即激活，而是待审状态。

### 2. 通过

接口：

```text
POST /api/admin/review/approve
```

作用：

- 账号激活。
- 用户可登录。

### 3. 拒绝

接口：

```text
POST /api/admin/review/reject
```

作用：

- 账号被拒。
- 无法登录。

### 4. 待审列表

接口：

```text
GET /api/admin/approvals
```

位置：

- 「审核」页签。

### 5. 未过审登录

未过审的账号登录时返回 403 对应提示。

这意味着，待审或被拒账号尝试登录时，会得到 403 以及对应提示。

### 6. 注册审核 API 速查

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 待审列表 | GET | `/api/admin/approvals` |
| 通过 | POST | `/api/admin/review/approve` |
| 拒绝 | POST | `/api/admin/review/reject` |

### 7. 注册审核检查清单

- [ ] 是否知道开放注册产生的账号会进入 `pending`？
- [ ] 是否使用 `GET /api/admin/approvals` 查看待审列表？
- [ ] 待审列表是否在「审核」页签？
- [ ] 是否使用 `POST /api/admin/review/approve` 通过？
- [ ] 是否知道通过后账号激活、用户可登录？
- [ ] 是否使用 `POST /api/admin/review/reject` 拒绝？
- [ ] 是否知道拒绝后账号被拒、无法登录？
- [ ] 是否知道未过审的账号登录时返回 403 对应提示？

## 五、举报与处罚

举报与处罚是治理页签的重要内容。原文列出：

- **举报处理**（`GET /api/admin/reports`）：查看用户上报的举报，每条记录举报者 IP 与消息快照。可以**驳回**（`POST /api/admin/reports/dismiss`）或**从举报执行处罚**（`POST /api/admin/reports/punish`，带上 `user` / `action` / `duration`）。
- **处罚类型**：`warning`（警告）/ `mute`（禁言）/ `ban`（封禁）/ `ipban`（IP 封禁）。时长上限 `MAX_DAYS = 3650` 天；永久处罚 `expires = null`。
- **处罚记录**（`GET /api/admin/penalties`）：查看全部处罚，可**撤销**（`POST /api/admin/penalties/revoke`）。新增处罚走 `POST /api/admin/penalties/add`（`user` / `action` / `duration`）。
- **自动通知**：执行账号类处罚后，系统自动向被处罚用户写一条站内「通知」，并实时推 `penalty` WebSocket 消息，前端据此禁用输入框。`moderate.blockFor` 计算 muted / banned / ipBanned 状态，发消息或建连时都会被拦。
- 处罚状态是服务端算出来的，不是前端自己判断，所以被封的人绕不过前端限制。

下面逐项展开。

### 1. 举报处理

接口：

```text
GET /api/admin/reports
```

作用：

- 查看用户上报的举报。
- 每条记录举报者 IP 与消息快照。

可以执行：

- 驳回：`POST /api/admin/reports/dismiss`
- 从举报执行处罚：`POST /api/admin/reports/punish`，带上 `user` / `action` / `duration`

### 2. 处罚类型

处罚类型包括：

- `warning`：警告；
- `mute`：禁言；
- `ban`：封禁；
- `ipban`：IP 封禁。

时长上限：

```text
MAX_DAYS = 3650
```

天。

永久处罚：

```text
expires = null
```

### 3. 处罚记录

接口：

```text
GET /api/admin/penalties
```

作用：

- 查看全部处罚。
- 可撤销：`POST /api/admin/penalties/revoke`。
- 新增处罚：`POST /api/admin/penalties/add`，带 `user` / `action` / `duration`。

### 4. 自动通知

执行账号类处罚后：

- 系统自动向被处罚用户写一条站内「通知」；
- 并实时推 `penalty` WebSocket 消息；
- 前端据此禁用输入框。

`moderate.blockFor` 计算：

- muted；
- banned；
- ipBanned 状态。

发消息或建连时都会被拦。

### 5. 处罚状态由服务端计算

原文明确：处罚状态是服务端算出来的，不是前端自己判断，所以被封的人绕不过前端限制。

这意味着，前端限制只是展示与交互层，真正拦截在服务端。被封的人不能通过绕过前端来继续发消息或建连。

### 6. 举报与处罚 API 速查

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 举报处理 | GET | `/api/admin/reports` |
| 驳回 | POST | `/api/admin/reports/dismiss` |
| 从举报执行处罚 | POST | `/api/admin/reports/punish` |
| 处罚记录 | GET | `/api/admin/penalties` |
| 撤销处罚 | POST | `/api/admin/penalties/revoke` |
| 新增处罚 | POST | `/api/admin/penalties/add` |

### 7. 举报与处罚检查清单

- [ ] 是否使用 `GET /api/admin/reports` 查看举报？
- [ ] 是否知道每条记录举报者 IP 与消息快照？
- [ ] 是否使用 `POST /api/admin/reports/dismiss` 驳回？
- [ ] 是否使用 `POST /api/admin/reports/punish` 从举报执行处罚？
- [ ] 是否知道从举报执行处罚要带 `user` / `action` / `duration`？
- [ ] 是否知道处罚类型是 `warning` / `mute` / `ban` / `ipban`？
- [ ] 是否知道时长上限 `MAX_DAYS = 3650` 天？
- [ ] 是否知道永久处罚 `expires = null`？
- [ ] 是否使用 `GET /api/admin/penalties` 查看全部处罚？
- [ ] 是否使用 `POST /api/admin/penalties/revoke` 撤销？
- [ ] 是否使用 `POST /api/admin/penalties/add` 新增处罚？
- [ ] 是否知道新增处罚要带 `user` / `action` / `duration`？
- [ ] 是否知道执行账号类处罚后系统自动写站内「通知」？
- [ ] 是否知道会实时推 `penalty` WebSocket 消息？
- [ ] 是否知道前端据此禁用输入框？
- [ ] 是否知道 `moderate.blockFor` 计算 muted / banned / ipBanned 状态？
- [ ] 是否知道发消息或建连时都会被拦？
- [ ] 是否知道处罚状态是服务端算出来的？
- [ ] 是否知道被封的人绕不过前端限制？

## 六、公告发布

原文列出：

- **发布**（`POST /api/admin/announcements`）：系统级公告，标题 + 内容，全员可见，出现在每用户信箱「公告」标签。返回新建 `id`。
- **删除**（`DELETE /api/admin/announcements`）：删已有公告（带 `id`）。

下面展开。

### 1. 发布公告

接口：

```text
POST /api/admin/announcements
```

内容：

- 系统级公告；
- 标题 + 内容；
- 全员可见；
- 出现在每用户信箱「公告」标签；
- 返回新建 `id`。

### 2. 删除公告

接口：

```text
DELETE /api/admin/announcements
```

内容：

- 删已有公告；
- 带 `id`。

### 3. 公告 API 速查

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 发布公告 | POST | `/api/admin/announcements` |
| 删除公告 | DELETE | `/api/admin/announcements` |

### 4. 公告检查清单

- [ ] 是否使用 `POST /api/admin/announcements` 发布公告？
- [ ] 是否知道公告是系统级公告？
- [ ] 是否知道公告包含标题 + 内容？
- [ ] 是否知道公告全员可见？
- [ ] 是否知道公告出现在每用户信箱「公告」标签？
- [ ] 是否知道发布返回新建 `id`？
- [ ] 是否使用 `DELETE /api/admin/announcements` 删除公告？
- [ ] 是否知道删除要带 `id`？

## 七、文件管理

原文列出：

- **查看**（`GET /api/admin/files`）：已上传文件列表，和 `FILE_TTL_DAYS` 保留策略配合看哪些快过期。
- **删除单个**（`POST /api/admin/file/del`）：删指定文件（带 `url`，`path.basename` 比对防穿越）。
- **批量删除**（`POST /api/admin/files/del-batch`）：一次清多个。

下面展开。

### 1. 查看文件

接口：

```text
GET /api/admin/files
```

作用：

- 已上传文件列表；
- 和 `FILE_TTL_DAYS` 保留策略配合看哪些快过期。

### 2. 删除单个文件

接口：

```text
POST /api/admin/file/del
```

作用：

- 删指定文件；
- 带 `url`；
- `path.basename` 比对防穿越。

### 3. 批量删除

接口：

```text
POST /api/admin/files/del-batch
```

作用：

- 一次清多个。

### 4. 文件管理 API 速查

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 查看文件 | GET | `/api/admin/files` |
| 删除单个 | POST | `/api/admin/file/del` |
| 批量删除 | POST | `/api/admin/files/del-batch` |

### 5. 文件管理检查清单

- [ ] 是否使用 `GET /api/admin/files` 查看已上传文件列表？
- [ ] 是否知道要和 `FILE_TTL_DAYS` 保留策略配合看哪些快过期？
- [ ] 是否使用 `POST /api/admin/file/del` 删指定文件？
- [ ] 是否知道删除单个要带 `url`？
- [ ] 是否知道用 `path.basename` 比对防穿越？
- [ ] 是否使用 `POST /api/admin/files/del-batch` 一次清多个？

## 八、操作日志

原文列出：

- **审计日志**（`GET /api/admin/logs`）：分页查看审计 / 操作日志——登录、登出、发消息、上传、处罚、举报等活动，以及来源 IP。`audit.list` 支持按 actor / action / target / actionPrefix / excludeActions 过滤。`detail` 以结构化 `{k: i18n键, v: 占位变量}` 存储，前端按语言翻译；单条详情上限 300 字符，总容量 5000 条。
- **访问日志**：另外，所有 HTTP 请求与 WebSocket 连接还会以 JSON 行写入 `data/access.log`（应用层网络监控），可配合外部日志系统（ELK / Loki 等）做更细的监控，不在管理面板内。

下面展开。

### 1. 审计日志

接口：

```text
GET /api/admin/logs
```

作用：

- 分页查看审计 / 操作日志；
- 包括登录、登出、发消息、上传、处罚、举报等活动；
- 以及来源 IP。

`audit.list` 支持按以下条件过滤：

- actor；
- action；
- target；
- actionPrefix；
- excludeActions。

`detail`：

- 以结构化 `{k: i18n键, v: 占位变量}` 存储；
- 前端按语言翻译；
- 单条详情上限 300 字符；
- 总容量 5000 条。

### 2. 访问日志

所有 HTTP 请求与 WebSocket 连接还会以 JSON 行写入：

```text
data/access.log
```

说明：

- 应用层网络监控；
- 可配合外部日志系统（ELK / Loki 等）做更细的监控；
- 不在管理面板内。

### 3. 操作日志检查清单

- [ ] 是否使用 `GET /api/admin/logs` 分页查看审计 / 操作日志？
- [ ] 是否知道日志包括登录、登出、发消息、上传、处罚、举报等活动？
- [ ] 是否知道日志包括来源 IP？
- [ ] 是否知道 `audit.list` 支持按 actor / action / target / actionPrefix / excludeActions 过滤？
- [ ] 是否知道 `detail` 以结构化 `{k: i18n键, v: 占位变量}` 存储？
- [ ] 是否知道前端按语言翻译？
- [ ] 是否知道单条详情上限 300 字符？
- [ ] 是否知道总容量 5000 条？
- [ ] 是否知道所有 HTTP 请求与 WebSocket 连接还会以 JSON 行写入 `data/access.log`？
- [ ] 是否知道访问日志可配合外部日志系统（ELK / Loki 等）做更细监控？
- [ ] 是否知道访问日志不在管理面板内？

## 九、OAuth 配置

原文列出：

- 管理面板「OAuth」页签管理 GitHub 登录：`GET/POST /api/admin/oauth` 读写 GitHub 的 `client_id` / `client_secret`（secret 存 `app_config`，永不下发前端）。
- 普通用户侧流程：`GET /api/oauth/providers` 看有哪些、`<start>` 跳转授权、`<callback>` 回跳绑定、`/api/oauth/me` 看绑定状态、`/api/oauth/github/unbind` 解绑。

下面展开。

### 1. 管理面板 OAuth 页签

管理面板「OAuth」页签管理 GitHub 登录。

接口：

```text
GET/POST /api/admin/oauth
```

作用：

- 读写 GitHub 的 `client_id` / `client_secret`；
- secret 存 `app_config`；
- 永不下发前端。

### 2. 普通用户侧流程

原文列出：

- `GET /api/oauth/providers` 看有哪些；
- `<start>` 跳转授权；
- `<callback>` 回跳绑定；
- `/api/oauth/me` 看绑定状态；
- `/api/oauth/github/unbind` 解绑。

### 3. OAuth 检查清单

- [ ] 是否知道管理面板「OAuth」页签管理 GitHub 登录？
- [ ] 是否使用 `GET/POST /api/admin/oauth` 读写 GitHub 的 `client_id` / `client_secret`？
- [ ] 是否知道 secret 存 `app_config`？
- [ ] 是否知道 secret 永不下发前端？
- [ ] 是否知道普通用户侧 `GET /api/oauth/providers` 看有哪些？
- [ ] 是否知道 `<start>` 跳转授权？
- [ ] 是否知道 `<callback>` 回跳绑定？
- [ ] 是否知道 `/api/oauth/me` 看绑定状态？
- [ ] 是否知道 `/api/oauth/github/unbind` 解绑？

## 十、依赖命令行

原文列出：

| 命令 | 作用 |
| --- | --- |
| `npm run adduser -- <用户名> [新密码]` | 新增 / 重置用户密码（服务端命令行，适合无界面时批量建号） |

这说明：

- 命令行命令是 `npm run adduser -- <用户名> [新密码]`；
- 作用是新增 / 重置用户密码；
- 属于服务端命令行；
- 适合无界面时批量建号。

## 十一、API 速查总表

### 用户管理

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 用户列表 | GET | `/api/admin/users` |
| 新增用户 | POST | `/api/admin/user/add` |
| 删除用户 | POST | `/api/admin/user/del` |
| 重命名 | POST | `/api/admin/user/rename` |
| 改头像 | POST | `/api/admin/user/image` |
| 重置密码 | POST | `/api/admin/user/pass` |

### 注册审核

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 待审列表 | GET | `/api/admin/approvals` |
| 通过 | POST | `/api/admin/review/approve` |
| 拒绝 | POST | `/api/admin/review/reject` |

### 举报与处罚

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 举报处理 | GET | `/api/admin/reports` |
| 驳回 | POST | `/api/admin/reports/dismiss` |
| 从举报执行处罚 | POST | `/api/admin/reports/punish` |
| 处罚记录 | GET | `/api/admin/penalties` |
| 撤销处罚 | POST | `/api/admin/penalties/revoke` |
| 新增处罚 | POST | `/api/admin/penalties/add` |

### 公告

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 发布公告 | POST | `/api/admin/announcements` |
| 删除公告 | DELETE | `/api/admin/announcements` |

### 文件

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 查看文件 | GET | `/api/admin/files` |
| 删除单个 | POST | `/api/admin/file/del` |
| 批量删除 | POST | `/api/admin/files/del-batch` |

### 日志

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 审计日志 | GET | `/api/admin/logs` |

### OAuth

| 能力 | 方法 | 路径 |
| --- | --- | --- |
| 管理 OAuth | GET/POST | `/api/admin/oauth` |
| 用户侧 providers | GET | `/api/oauth/providers` |
| 用户侧 me | GET | `/api/oauth/me` |
| 用户侧 unbind | POST | `/api/oauth/github/unbind` |

> 说明：`<start>`、`<callback>` 是原文中的占位表示，本文不补充具体路径。

## 十二、管理操作检查清单

- [ ] 是否通过 `admin.html` 进入管理面板？
- [ ] 是否知道管理面板由 `AppAdmin` 驱动？
- [ ] 是否只对 `role=admin` 开放？
- [ ] 服务端是否对 `/admin.html`、`/js/admin.js` 做鉴权？
- [ ] 非管理员是否会被 302 到聊天页？
- [ ] 前端 `main-admin.ts` 是否再拦一道？
- [ ] `role !== 'admin'` 是否跳回聊天页？
- [ ] 所有管理操作是否受管理员角色限制？
- [ ] 所有管理操作是否写入审计日志（`audit.add`）？
- [ ] 是否知道页签是审核 / 用户 / 治理 / 文件 / OAuth / 日志？
- [ ] 是否知道源码卡片组织是 Approvals / Users / Files / Logs / Moderation / OAuth？
- [ ] 是否知道用户列表接口 `GET /api/admin/users`？
- [ ] 是否知道用户状态包括 active / pending / banned 等？
- [ ] 是否知道新增用户接口 `POST /api/admin/user/add`？
- [ ] 是否知道也可用 `npm run adduser -- <用户名> [新密码]`？
- [ ] 是否知道省略密码则交互式隐藏输入？
- [ ] 是否知道删除用户接口 `POST /api/admin/user/del`？
- [ ] 是否知道删除会清掉消息、私聊、回应、群组、好友里的引用？
- [ ] 是否知道删除在 `auth.renameUser` 同类的清理逻辑里做事务处理？
- [ ] 是否知道重命名接口 `POST /api/admin/user/rename`？
- [ ] 是否知道重命名会在一个事务里同步 users / messages / dm / reactions / groups / friends 的全部引用？
- [ ] 是否知道改头像接口 `POST /api/admin/user/image`？
- [ ] 是否知道头像路径是 `/uploads/...`？
- [ ] 是否知道重置密码接口 `POST /api/admin/user/pass`？
- [ ] 是否知道重置密码不需要旧密码？
- [ ] 是否知道开放注册产生的账号会进入 `pending`？
- [ ] 是否知道通过接口 `POST /api/admin/review/approve`？
- [ ] 是否知道通过后账号激活、用户可登录？
- [ ] 是否知道拒绝接口 `POST /api/admin/review/reject`？
- [ ] 是否知道拒绝后账号被拒、无法登录？
- [ ] 是否知道待审列表在「审核」页签 `GET /api/admin/approvals`？
- [ ] 是否知道未过审的账号登录时返回 403 对应提示？
- [ ] 是否知道举报处理接口 `GET /api/admin/reports`？
- [ ] 是否知道每条记录举报者 IP 与消息快照？
- [ ] 是否知道驳回接口 `POST /api/admin/reports/dismiss`？
- [ ] 是否知道从举报执行处罚接口 `POST /api/admin/reports/punish`？
- [ ] 是否知道从举报执行处罚要带 `user` / `action` / `duration`？
- [ ] 是否知道处罚类型 warning / mute / ban / ipban？
- [ ] 是否知道时长上限 `MAX_DAYS = 3650` 天？
- [ ] 是否知道永久处罚 `expires = null`？
- [ ] 是否知道处罚记录接口 `GET /api/admin/penalties`？
- [ ] 是否知道撤销接口 `POST /api/admin/penalties/revoke`？
- [ ] 是否知道新增处罚接口 `POST /api/admin/penalties/add`？
- [ ] 是否知道新增处罚要带 `user` / `action` / `duration`？
- [ ] 是否知道执行账号类处罚后系统自动写站内「通知」？
- [ ] 是否知道会实时推 `penalty` WebSocket 消息？
- [ ] 是否知道前端据此禁用输入框？
- [ ] 是否知道 `moderate.blockFor` 计算 muted / banned / ipBanned 状态？
- [ ] 是否知道发消息或建连时都会被拦？
- [ ] 是否知道处罚状态是服务端算出来的？
- [ ] 是否知道被封的人绕不过前端限制？
- [ ] 是否知道发布公告接口 `POST /api/admin/announcements`？
- [ ] 是否知道公告是系统级公告，标题 + 内容，全员可见？
- [ ] 是否知道公告出现在每用户信箱「公告」标签？
- [ ] 是否知道发布返回新建 `id`？
- [ ] 是否知道删除公告接口 `DELETE /api/admin/announcements`？
- [ ] 是否知道删除要带 `id`？
- [ ] 是否知道查看文件接口 `GET /api/admin/files`？
- [ ] 是否知道要和 `FILE_TTL_DAYS` 保留策略配合看哪些快过期？
- [ ] 是否知道删除单个接口 `POST /api/admin/file/del`？
- [ ] 是否知道删除单个要带 `url`，`path.basename` 比对防穿越？
- [ ] 是否知道批量删除接口 `POST /api/admin/files/del-batch`？
- [ ] 是否知道批量删除一次清多个？
- [ ] 是否知道审计日志接口 `GET /api/admin/logs`？
- [ ] 是否知道审计日志可分页查看？
- [ ] 是否知道日志包括登录、登出、发消息、上传、处罚、举报等活动？
- [ ] 是否知道日志包括来源 IP？
- [ ] 是否知道 `audit.list` 支持按 actor / action / target / actionPrefix / excludeActions 过滤？
- [ ] 是否知道 `detail` 以结构化 `{k: i18n键, v: 占位变量}` 存储？
- [ ] 是否知道前端按语言翻译？
- [ ] 是否知道单条详情上限 300 字符？
- [ ] 是否知道总容量 5000 条？
- [ ] 是否知道所有 HTTP 请求与 WebSocket 连接还会以 JSON 行写入 `data/access.log`？
- [ ] 是否知道访问日志可配合外部日志系统（ELK / Loki 等）做更细监控？
- [ ] 是否知道访问日志不在管理面板内？
- [ ] 是否知道管理面板「OAuth」页签管理 GitHub 登录？
- [ ] 是否知道 `GET/POST /api/admin/oauth` 读写 GitHub 的 `client_id` / `client_secret`？
- [ ] 是否知道 secret 存 `app_config`，永不下发前端？
- [ ] 是否知道普通用户侧 `GET /api/oauth/providers` 看有哪些？
- [ ] 是否知道 `<start>` 跳转授权？
- [ ] 是否知道 `<callback>` 回跳绑定？
- [ ] 是否知道 `/api/oauth/me` 看绑定状态？
- [ ] 是否知道 `/api/oauth/github/unbind` 解绑？
- [ ] 是否知道命令行 `npm run adduser -- <用户名> [新密码]`？
- [ ] 是否知道该命令用于新增 / 重置用户密码？
- [ ] 是否知道该命令适合无界面时批量建号？

## 十三、常见问题

### 1. 管理后台在哪里？

管理相关能力集中在管理面板 `admin.html`。

### 2. 管理面板由什么驱动？

由 `AppAdmin` 驱动。

### 3. 管理后台入口对谁开放？

只對 `role=admin` 开放。

### 4. 服务端对哪些路径做鉴权？

服务端对 `/admin.html`、`/js/admin.js` 做鉴权。

### 5. 非管理员访问管理后台会怎样？

非管理员会被 302 到聊天页。

### 6. 前端还有拦截吗？

有。前端 `main-admin.ts` 再拦一道。

### 7. 前端拦截条件是什么？

`role !== 'admin'` 跳回聊天页。

### 8. 管理操作受什么限制？

所有管理操作都受管理员角色限制。

### 9. 管理操作会写审计日志吗？

会。所有管理操作都写入审计日志（`audit.add`）。

### 10. 管理面板分几个页签？

原文说分五个页签：审核 / 用户 / 治理 / 文件 / OAuth / 日志。

### 11. 源码里的卡片组织是什么？

Approvals / Users / Files / Logs / Moderation / OAuth。

### 12. 用户列表接口是什么？

`GET /api/admin/users`。

### 13. 用户列表能看到什么？

查看全部用户及状态。

### 14. 用户状态有哪些？

激活（active）/ 待审（pending）/ 封禁（banned）等。

### 15. 新增用户接口是什么？

`POST /api/admin/user/add`。

### 16. 新增用户可以在面板里做吗？

可以。在面板里直接建账号设密码。

### 17. 新增用户也可以走命令行吗？

可以。`npm run adduser -- <用户名> [新密码]`。

### 18. 命令行省略密码会怎样？

省略密码则交互式隐藏输入。

### 19. 删除用户接口是什么？

`POST /api/admin/user/del`。

### 20. 删除用户会清掉什么？

会清掉其消息、私聊、回应、群组、好友里的引用。

### 21. 删除用户的清理逻辑在哪里做？

在 `auth.renameUser` 同类的清理逻辑里做事务处理。

### 22. 重命名接口是什么？

`POST /api/admin/user/rename`。

### 23. 重命名会同步哪些引用？

会在一个事务里同步 users / messages / dm / reactions / groups / friends 的全部引用。

### 24. 改头像接口是什么？

`POST /api/admin/user/image`。

### 25. 头像路径是什么形式？

`/uploads/...`。

### 26. 重置密码接口是什么？

`POST /api/admin/user/pass`。

### 27. 重置密码需要旧密码吗？

不需要旧密码。

### 28. 开放注册产生的账号会进入什么状态？

进入 `pending`。

### 29. 审核通过接口是什么？

`POST /api/admin/review/approve`。

### 30. 审核通过后怎样？

账号激活，用户可登录。

### 31. 审核拒绝接口是什么？

`POST /api/admin/review/reject`。

### 32. 审核拒绝后怎样？

账号被拒，无法登录。

### 33. 待审列表在哪里？

在「审核」页签。

### 34. 待审列表接口是什么？

`GET /api/admin/approvals`。

### 35. 未过审的账号登录时返回什么？

返回 403 对应提示。

### 36. 举报处理接口是什么？

`GET /api/admin/reports`。

### 37. 举报记录包含什么？

每条记录举报者 IP 与消息快照。

### 38. 驳回举报接口是什么？

`POST /api/admin/reports/dismiss`。

### 39. 从举报执行处罚接口是什么？

`POST /api/admin/reports/punish`。

### 40. 从举报执行处罚要带什么？

带上 `user` / `action` / `duration`。

### 41. 处罚类型有哪些？

`warning`（警告）/ `mute`（禁言）/ `ban`（封禁）/ `ipban`（IP 封禁）。

### 42. 时长上限是多少？

`MAX_DAYS = 3650` 天。

### 43. 永久处罚怎么表示？

`expires = null`。

### 44. 处罚记录接口是什么？

`GET /api/admin/penalties`。

### 45. 撤销处罚接口是什么？

`POST /api/admin/penalties/revoke`。

### 46. 新增处罚接口是什么？

`POST /api/admin/penalties/add`。

### 47. 新增处罚要带什么？

`user` / `action` / `duration`。

### 48. 执行账号类处罚后会自动通知吗？

会。系统自动向被处罚用户写一条站内「通知」。

### 49. 会实时推什么 WebSocket 消息？

推 `penalty` WebSocket 消息。

### 50. 前端据此做什么？

前端据此禁用输入框。

### 51. `moderate.blockFor` 计算什么？

计算 muted / banned / ipBanned 状态。

### 52. 发消息或建连时会被拦吗？

会被拦。

### 53. 处罚状态是谁算出来的？

是服务端算出来的，不是前端自己判断。

### 54. 被封的人能绕过前端限制吗？

不能，被封的人绕不过前端限制。

### 55. 发布公告接口是什么？

`POST /api/admin/announcements`。

### 56. 公告是什么级别？

系统级公告。

### 57. 公告包含什么？

标题 + 内容。

### 58. 公告谁可见？

全员可见。

### 59. 公告出现在哪里？

出现在每用户信箱「公告」标签。

### 60. 发布公告返回什么？

返回新建 `id`。

### 61. 删除公告接口是什么？

`DELETE /api/admin/announcements`。

### 62. 删除公告要带什么？

带 `id`。

### 63. 查看文件接口是什么？

`GET /api/admin/files`。

### 64. 查看文件能看到什么？

已上传文件列表。

### 65. 要和什么保留策略配合看？

和 `FILE_TTL_DAYS` 保留策略配合看哪些快过期。

### 66. 删除单个文件接口是什么？

`POST /api/admin/file/del`。

### 67. 删除单个文件要带什么？

带 `url`。

### 68. 删除单个文件如何防穿越？

`path.basename` 比对防穿越。

### 69. 批量删除接口是什么？

`POST /api/admin/files/del-batch`。

### 70. 批量删除作用是什么？

一次清多个。

### 71. 审计日志接口是什么？

`GET /api/admin/logs`。

### 72. 审计日志能看什么？

分页查看审计 / 操作日志。

### 73. 审计日志包括哪些活动？

登录、登出、发消息、上传、处罚、举报等活动。

### 74. 审计日志包括来源 IP 吗？

包括来源 IP。

### 75. `audit.list` 支持哪些过滤？

按 actor / action / target / actionPrefix / excludeActions 过滤。

### 76. `detail` 以什么形式存储？

以结构化 `{k: i18n键, v: 占位变量}` 存储。

### 77. `detail` 前端如何处理？

前端按语言翻译。

### 78. 单条详情上限是多少？

单条详情上限 300 字符。

### 79. 审计日志总容量是多少？

总容量 5000 条。

### 80. 访问日志写到哪里？

所有 HTTP 请求与 WebSocket 连接还会以 JSON 行写入 `data/access.log`。

### 81. 访问日志有什么用？

应用层网络监控。

### 82. 访问日志可配合什么？

可配合外部日志系统（ELK / Loki 等）做更细的监控。

### 83. 访问日志在管理面板内吗？

不在管理面板内。

### 84. OAuth 页签管理什么？

管理 GitHub 登录。

### 85. OAuth 管理接口是什么？

`GET/POST /api/admin/oauth`。

### 86. OAuth 管理接口读写什么？

读写 GitHub 的 `client_id` / `client_secret`。

### 87. secret 存在哪里？

secret 存 `app_config`。

### 88. secret 会下发前端吗？

永不下发前端。

### 89. 普通用户侧 providers 接口是什么？

`GET /api/oauth/providers` 看有哪些。

### 90. 普通用户侧 start 做什么？

`<start>` 跳转授权。

### 91. 普通用户侧 callback 做什么？

`<callback>` 回跳绑定。

### 92. 普通用户侧 me 接口是什么？

`/api/oauth/me` 看绑定状态。

### 93. 普通用户侧解绑接口是什么？

`/api/oauth/github/unbind` 解绑。

### 94. 依赖命令行是什么？

`npm run adduser -- <用户名> [新密码]`。

### 95. 依赖命令行作用是什么？

新增 / 重置用户密码。

### 96. 依赖命令行适合什么场景？

服务端命令行，适合无界面时批量建号。

### 97. 更多安全与数据细节在哪里看？

见[配置说明 · 内置安全限制](../getting-started/configuration#内置安全限制)。

### 98. 接口字段与请求体在哪里看？

见 [API 参考 · 管理端 API](../api/admin)。

## 十四、相关文档

- 更多安全与数据细节见[配置说明 · 内置安全限制](../getting-started/configuration#内置安全限制)。
- 接口字段与请求体见 [API 参考 · 管理端 API](../api/admin)。