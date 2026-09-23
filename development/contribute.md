# CircleChat 贡献指南

本仓库的行为准则遵循上游 GitHub 上的 `CONTRIBUTING` / `CODE_OF_CONDUCT` / `SECURITY`。本文不替代这些上游文件，只聚焦文档 / 开发流程相关的技术要点：环境要求、常用命令、分支约定、代码入口、后端 / 前端注意事项、审计动作常量、提交与部署、许可以及提交前检查清单。

## 一、环境与依赖

- **Node.js ≥ 22.5**：后端使用 `node:sqlite`；前端 `vite build` 需 Node ≥ 20.19。以整个仓库的更高要求（Node ≥ 22.5）为准。
- **安装依赖**：`npm install`（仅构建期）。
- 首次拉取后、依赖或锁文件变化后需重新 `npm install`；执行构建 / 类型检查前确保依赖已安装。

## 二、常用命令

```bash
npm run dev          # 开发模式：监听 src/ 增量构建 + Nitro dev，改代码即时生效
npm run build        # 构建前端（Vite）+ 后端（Nitro）
npm run typecheck    # 类型检查：vue-tsc + tsc（与 CI 一致）
npm start            # 启动生产服务（默认 0.0.0.0:8090）
npm run adduser -- <用户名> [新密码]   # 用户管理（新增 / 重置密码）
```

- `npm run dev` 只监听 `src/`；改动 `server/`、`public/` 或配置文件时，以实际开发体验和源码为准。
- `npm run build` 同时覆盖前端（Vite）与后端（Nitro）构建，是提交前、部署前、验证生产构建时的必要步骤。
- **CI**：`.github/workflows/lint.yml` 在 push / PR 时执行 `npm run typecheck`。本地提交前跑一遍能提前发现问题、避免 PR 被阻塞。

## 三、分支约定

| 分支 | 用途 |
| --- | --- |
| `dev` | 日常开发分支，功能完成后再合并回 `main` |
| `main` | 稳定 / 发布分支，生产服务器据此部署 |

发布流程：

```bash
git checkout dev
# ...开发、提交...
git push                                  # 推送 dev
git checkout main && git merge dev && git push   # 发布
```

## 四、代码入口

- 后端路由与逻辑：`server/lib/runtime.ts`（HTTP + WebSocket + 上传）。
- 后端领域模块：`server/lib/*.ts`（auth / store / groups / friends / moderate / mailbox / audit / log / migrate / ws / filetypes / github / appconfig）。
- 前端请求层：`src/core/api.ts`；配置：`public/js/config.js`。
- 前端业务核心：`src/core/chat.ts`；UI：`src/components/`。
- 多语言文案：`src/i18n/messages/{zh,en,ja}.ts`。
- 审计动作常量：`src/core/auditActions.ts`。

定位问题时按此顺序：后端先看 `runtime.ts`，领域逻辑看对应 `server/lib/*.ts`；前端请求看 `api.ts`、配置看 `config.js`，业务核心看 `chat.ts`、UI 看 `src/components/`；多语言看 `src/i18n/messages/`；审计动作看 `auditActions.ts`。

## 五、后端改动注意事项

1. **不推荐修改 PCL 源码**：涉及第三方 / 上游资源时避免改动其源码（许可证约束）。
2. **函数声明优先**：模块初始化阶段被依赖的函数用 `function xxx(){}`，避免 `const` 箭头函数的暂时性死区（TDZ）导致启动报错。
3. **全局样式放对位置**：关键布局样式放 `public/css/chat-vue.css`（非 `@layer`，优先级高于组件内 `@layer` 样式），例如上传面板的流式布局。
4. **新增 API 遵循既有模式**：在 `runtime.ts` 的 `handleApi` 中按 `if (pathname === '/api/...' && req.method === 'POST')` 追加；请求体统一读 body + JSON 解析；响应统一 `sendJSON`；关键操作调用 `audit.add` 记录审计；末尾 `logger.write` 写访问日志。
5. **新增表结构**：在对应模块的 `open()` 里用 `CREATE TABLE IF NOT EXISTS` 自维护，并在 `server/lib/migrate.ts` 中处理旧库升级（补列）。
6. **安全默认值**：新增上传 / 文件相关能力时，沿用白名单 + 魔数校验 + `UPLOAD_NAME_RE` 随机名 + `path.basename` 比对的双层路径穿越防护，不要信任前端传来的原始路径。

## 六、前端改动注意事项

- 改动后构建：`npm run build`（或开发模式 `npm run dev`）。
- 测试时浏览器需**硬刷新**（`Ctrl+Shift+R`），清理缓存的静态资源。
- 新增 i18n 文案时，zh / en / ja 三种语言都要补齐（文案键以扁平 `'a.b.c'` 形式写，构建期 `nest()` 转成嵌套结构）。
- 实时能力改完需对照 [WebSocket 协议](../api/websocket)，服务端与 `src/core/chat.ts` 的 `onmessage` 分发要一致，不能只改一端。

## 七、审计动作常量

- 管理端日志接口 `GET /api/admin/logs` 按 `action` 过滤，动作字符串集中在 `src/core/auditActions.ts`。
- 动作以「命名空间」组织，可用 `actionPrefix` 做前缀匹配（如只看治理类传 `actionPrefix=penalty`）。
- 常见动作分布（权威列表以源码 `auditActions.ts` 为准）：
  - **账号类**：`login` / `logout` / `register` / `pass`（改密）/ `profile`（改资料）。
  - **社交类**：`message`（发消息）/ `upload`（上传）/ `react`（回应）/ `recall`（撤回）/ `friend`（好友操作）。
  - **治理类**：`penalty`（处罚）/ `report`（举报）/ `review.approve` / `review.reject`（注册审核）。
  - **群组类**：`group.create` / `group.rename` / `group.dissolve` / `group.transfer` / `group.member`（成员变更）等 `group.*`。
  - **管理类**：`admin.user.add` / `admin.user.del` / `admin.announce`（公告）/ `admin.file.del`（删文件）。
- 审计详情 `detail` 以结构化 `{k: i18n键, v: 占位变量}` 的 JSON 字符串存储，单条上限 `MAX_DETAIL = 300` 字符，便于多语言前端直接翻译。

## 八、提交与部署

- 推送到 `main` 后，生产服务器可通过 `git pull` 更新并重新 `npm run build` + 重启进程 / 容器（详见[生产部署](../getting-started/installation)）。
- 部署目录须保持干净（无未提交改动，如 `package-lock.json`），否则 `git pull` 会中止；建议部署目录只做 `git fetch` + `git reset --hard`。
- 也可以用远端仓库的 `post-receive` 钩子把「拉取 → 构建 → 重启」自动化。

## 九、许可

- 本项目以 GNU GPL v3.0 开源。
- 贡献即表示同意以 GPL-3.0 条款许可所贡献的内容。
- 完整第三方资源与许可见 CREDITS。

## 十、提交前检查清单

- [ ] Node.js 版本 ≥ 22.5；已运行 `npm install`
- [ ] 在 `dev` 分支开发；提交前运行 `npm run typecheck`
- [ ] 改动在后端：新增 API 遵循 `handleApi` 模式（读 body + JSON、`sendJSON`、`audit.add`、`logger.write`）；新增表结构用 `CREATE TABLE IF NOT EXISTS` 并处理 `migrate.ts`；函数声明优先；不修改 PCL 源码；上传 / 文件沿用双层路径穿越防护
- [ ] 改动在前端：运行 `npm run build` 或 `npm run dev`；测试硬刷新 `Ctrl+Shift+R`；关键布局样式放 `public/css/chat-vue.css`
- [ ] 新增 i18n 文案时 zh / en / ja 都补齐，键用扁平 `'a.b.c'` 形式
- [ ] 改实时能力时对照 WebSocket 协议，服务端与 `src/core/chat.ts` 的 `onmessage` 分发一致
- [ ] 审计动作集中在 `src/core/auditActions.ts`；`detail` 为 `{k: i18n键, v: 占位变量}` JSON 且不超过 `MAX_DETAIL = 300`
- [ ] 发布时切到 `main` 合并 `dev` 并推送；部署目录干净，按需 `git fetch` + `git reset --hard`
- [ ] 理解贡献以 GPL-3.0 许可；查阅 CREDITS 了解第三方资源与许可