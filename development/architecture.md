# 架构说明

CircleChat 以**单进程**运行为设计目标：前端静态资源由后端内部静态服务托管，后端一个进程同时承载 HTTP API、WebSocket 与文件上传。运行时零第三方依赖。

## 总体分层

```
浏览器 (Vue 3 SPA)
   │  HTTP /api/*          WebSocket /ws
   ▼
Nitro 外壳 (node-server 预设)
   │  server/routes/[...].ts 全量兜底路由
   ▼
runtime.ts (核心运行时，原 server.js 1:1 迁移)
   ├── handleHttp     HTTP 路由
   ├── handleWsText   WebSocket 业务
   ├── 上传（单次 + 分片）
   └── serveStatic    静态资源托管
   ▼
server/lib/*  领域模块
   ▼
SQLite (node:sqlite) / 文件系统 (data/)
```

## 后端模块

| 模块 | 职责 |
| --- | --- |
| `server/lib/runtime.ts` | **主运行时**：HTTP 路由调度（`handleApi`）、WebSocket 业务（`handleWsText`）、上传（单次 / 分片断点）落盘、静态服务、审计调用 |
| `server/lib/auth.ts` | 注册、登录、会话（Cookie token）、2FA（TOTP）、登录限速、内置管理员 |
| `server/lib/store.ts` | 消息存储（SQLite），`add` / `recall` / `toggleReaction`，每房间保留最近 `MAX_MESSAGES` 条 |
| `server/lib/groups.ts` | 群组 CRUD、成员资格、入群申请、群日志 |
| `server/lib/friends.ts` | 好友关系、`pairKey`（私聊配对键） |
| `server/lib/moderate.ts` | 处罚判定：禁言 / 封禁 / IP 封禁（`blockFor`） |
| `server/lib/mailbox.ts` | 站内信箱：公告表 + 通知表（按用户分发） |
| `server/lib/audit.ts` | 审计日志表 |
| `server/lib/log.ts` | 访问日志（写 `data/access.log`，应用层网络监控） |
| `server/lib/migrate.ts` | 数据库结构校验与自动迁移（兼容旧库） |
| `server/lib/ws.ts` | WebSocket 协议实现：握手、帧编解码、掩码、Ping/Pong、Close |
| `server/lib/filetypes.ts` | 上传类型白名单、图片魔数嗅探 |

## 启动与路由

- **入口**：`server/plugins/bootstrap.ts`（Nitro 启动插件）：`migrate → auth.init → store.load → audit.load → mkdir(uploads) → 清理临时分片 → 定时清理过期文件`。
- **HTTP 接入**：`server/routes/[...].ts` 是**全量兜底路由**，把原生 `req/res` 转交给 `runtime.handleHttp`。因 node-server 预设的 `fromNodeHandler` 依赖的 `event.runtime.node` 未填充，该路由直接用 `event.node` 的原生 req/res，并等待 `finish/close` 后再 resolve。
- **WS 升级**：`server/plugins/ws.ts` 拦截升级请求，交给 `ws.accept`。

## 前端

- **入口**：`src/main-{login,chat,group,admin}.ts` 分别对应四个应用（登录 / 聊天 / 群管理 / 管理后台）。
- **请求层**：`src/core/api.ts` 统一封装同源 fetch；`src/core/config.ts` 读取 `config.js` 的地址配置。
- **核心**：`src/core/`（如 `chat.ts`、`media.ts`、`format.ts`、`i18n.ts`）承载业务逻辑。
- **组件**：`src/components/` 含 `chat/`、`group/`、`admin/`、`login/`、`common/`。
- **多语言**：`src/i18n/messages/{zh,en,ja}.ts`。
- **构建**：Vite + Tailwind 4；产物 `public/dist/`。样式分两层：`public/css/`（全局，优先级高于 `@layer`）与组件内样式。

## 数据与文件

- **SQLite**：`data/chatplus.db`（`node:sqlite`，Node ≥ 22.5）。用户、消息、群组、处罚、审计、公告、通知。
- **上传**：`public/uploads/`，由 `FILE_TTL_DAYS` 控制保留；单文件上限 100MB。
- **日志**：`data/access.log`（HTTP + WebSocket 全量连接日志）。

## 关键设计

- **零第三方运行时依赖**：后端仅用 Node 内建模块 + `node:sqlite`，无任何第三方运行时 npm 包。
- **显示 / 请求地址分离**：前端 `config.js` 的 `apiBase` / `displayBase` 解耦页面展示地址与真实请求地址。
- **静态服务在进程内**（`serveStatic:false`，由内部 `serveStatic` 处理），因此无需额外静态服务器即可访问前端资源。