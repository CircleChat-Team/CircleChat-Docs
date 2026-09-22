# 架构说明

CircleChat 的设计目标是**单进程**运行：前端静态资源由后端内部静态服务托管，后端一个 Node.js 进程同时承载 HTTP API、WebSocket 与文件上传。运行时**零第三方依赖**——除 Node 内建模块（含 `node:sqlite`）外不引入任何第三方运行时 npm 包，所有网络 / 协议能力都是自研。

## 总体分层

```
浏览器 (Vue 3 SPA，多页：login / chat / group / admin)
   │  HTTP /api/*                 WebSocket /ws
   ▼
Nitro 外壳 (node-server 预设)
   │  server/routes/[...].ts 全量兜底路由
   ▼
runtime.ts (核心运行时，原 server.js 1:1 迁移)
   ├── handleHttp      HTTP 路由调度（handleApi）
   ├── handleWsText    WebSocket 业务
   ├── 上传（单次 + 分片断点）落盘
   └── serveStatic     静态资源托管
   ▼
server/lib/*  领域模块（auth / store / groups / friends / ws / moderate / ...）
   ▼
SQLite (node:sqlite) / 文件系统 (data/、public/uploads/)
```

## 后端模块

| 模块 | 职责 |
| --- | --- |
| `server/lib/runtime.ts` | **主运行时**：HTTP 路由调度（`handleApi`）、WebSocket 业务（`handleWsText`）、上传（单次 / 分片断点）落盘、静态服务、审计调用 |
| `server/lib/auth.ts` | 注册、登录、会话（Cookie token）、TOTP 两步验证、登录限速、内置管理员、用户重命名（事务级引用同步） |
| `server/lib/store.ts` | 消息存储（SQLite）：`add` / `recall` / `toggleReaction`、每房间保留最近 `MAX_MESSAGES` 条、过期文件清理、上传去重 |
| `server/lib/groups.ts` | 群组 CRUD、成员资格、入群申请、群公告 / 头像 / 日志、群主转让 |
| `server/lib/friends.ts` | 好友关系、`pairKey`（私聊配对键）、请求 / 接受 / 拒绝 |
| `server/lib/moderate.ts` | 处罚判定：禁言 / 封禁 / IP 封禁（`blockFor`），举报处理 |
| `server/lib/mailbox.ts` | 站内信箱：公告表 + 通知表（按用户分发） |
| `server/lib/audit.ts` | 审计日志表（`MAX_LOGS` / `MAX_DETAIL` 上限，结构化 detail） |
| `server/lib/log.ts` | 访问日志（写 `data/access.log`，应用层网络监控） |
| `server/lib/migrate.ts` | 数据库结构校验与自动迁移（兼容旧库，`SCHEMA_VERSION = 9`） |
| `server/lib/ws.ts` | WebSocket 协议实现（RFC6455）：握手、帧编解码、掩码、Ping/Pong、Close，单帧上限 `MAX_FRAME` |
| `server/lib/filetypes.ts` | 上传类型展示分类（与安全无关） |
| `server/lib/github.ts` | GitHub 仓库信息代理（消息里仓库卡片用），令牌仅服务端 |
| `server/lib/appconfig.ts` | 全局配置表 `app_config`（OAuth 凭据等，secret 不下发前端） |

## 启动流程

入口是 Nitro 启动插件 `server/plugins/bootstrap.ts`，按顺序做：

1. `migrate.run()` —— 校验库结构、按 `SCHEMA` 逐表 `CREATE IF NOT EXISTS` + 逐列 `ALTER TABLE ADD COLUMN` 补齐旧库。
2. `auth.init(false)` —— 初始化用户表、补建内置管理员 `admin`。
3. `store.load()` —— 加载消息等内存索引。
4. `audit.load()` —— 加载审计日志。
5. `mkdir(uploads)` —— 创建上传目录。
6. `purgeUploadTmp()` —— 清理上次残留的分片临时数据。
7. 启动过期文件清理定时器（`FILE_CLEANUP_INTERVAL`，默认 6 小时）。

进程收到 `SIGTERM` / `SIGINT` 时，会 `broadcastLogout('server-restart')` 优雅通知在线客户端，再退出。

## 请求接入

- **HTTP**：`server/routes/[...].ts` 是**全量兜底路由**，把所有 method / path 的原生 `req/res` 转交给 `runtime.handleHttp`。之所以不用 Nitro 的 `fromNodeHandler`，是因为 node-server 预设下它依赖的 `event.runtime.node` 未填充；该路由直接用 `event.node` 的原生 req/res，并等响应 `finish/close` 后才 resolve，避免 h3 在异步路由上重复发响应。
- **路由分发**：`handleHttp` 内部：`/api/*` → `handleApi`（按 `pathname` + `method` 分发各接口）；`/admin.html`、`/js/admin.js` 做管理员鉴权（非管理员 302 到 `/chat.html` / `/login.html`）；其余走 `serveStatic`。
- **WS 升级**：`server/plugins/ws.ts` 把 WebSocket 升级挂到 `http.Server` 的 `upgrade` 事件——它通过覆写 `Server.prototype.on`，在第一次 `request` 监听注册时挂一个 `upgrade` 监听，交给 `handleWsUpgrade`（握手固定在 `/ws`，cookie 鉴权后 `ws.accept` 完成 RFC6455 握手）。

## 前端

- **多页构建**：`vite.config.mts` 以 `public/` 下的手写 HTML 壳为页面（`/admin.html` 等 URL 保持不变，因为服务端对其鉴权），`src/` 产物输出到 `public/dist/assets/`，文件名固定便于 HTML 直接引用。
- **入口**：`src/main-{login,chat,group,admin}.ts` 分别对应四个应用，都走 `createApp(...).use(i18n).mount('#app')`，先 `initTheme()` 防闪白。
- **请求层**：`src/core/api.ts` 统一封装同源 fetch（`credentials: 'same-origin'`）；`src/core/config.ts` 读取 `config.js` 的地址配置。
- **核心**：`src/core/chat.ts`（约 66KB）是聊天核心组合式单例，承载 WS 连接、REST、消息收发、会话状态、分片上传（`CHUNK_SIZE = 5MB`）、未读、通知音、合并转发；所有组件共享同一实例。
- **组件**：`src/components/` 含 `chat/`、`group/`、`admin/`、`login/`、`common/`。
- **多语言**：`src/i18n/messages/{zh,en,ja}.ts`，`detectLocale()` 顺序为 `localStorage` → `navigator.languages` 前缀 → 默认 `zh`。
- **样式**：Tailwind 4；全局样式放 `public/css/`（优先级高于组件内 `@layer`）。

## 数据与文件

- **SQLite**：`data/chatplus.db`（`node:sqlite`，Node ≥ 22.5）。用户、消息、群组、好友、处罚、审计、公告、通知。可用 `DB_FILE` 环境变量改路径。
- **上传**：`public/uploads/`，由 `FILE_TTL_DAYS` 控制保留；单文件上限 100MB；按内容 sha256 去重。
- **日志**：`data/access.log`（HTTP + WebSocket 全量连接日志，JSON 行）。

## 关键设计

- **零第三方运行时依赖**：后端仅用 Node 内建模块 + `node:sqlite`，无任何第三方运行时 npm 包，便于审计与自托管。
- **自研 WebSocket 协议**：握手、帧编解码、粘包处理、分片重组、掩码解码、Ping/Pong、Close 全部自实现，零依赖。
- **显示 / 请求地址分离**：前端 `config.js` 的 `apiBase` / `displayBase` 解耦页面展示地址与真实请求地址，支持同源 / 子路径 / 跨域三种部署。
- **静态服务在进程内**（`serveStatic:false`，由内部 `serveStatic` 处理），无需额外静态服务器即可访问前端资源。
- **客户端身份由握手决定**：WS 连接建立时的 cookie 决定 `client.user`，连接建立后载荷里不再携带身份，防伪造。
