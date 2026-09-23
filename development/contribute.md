# CircleChat 贡献指南

欢迎为 CircleChat 贡献。本仓库的行为准则遵循上游 GitHub 上的 `CONTRIBUTING.md` / `CODE_OF_CONDUCT.md` / `SECURITY.md`。本文不替代这些上游文件，而是聚焦在文档 / 开发流程相关的要点，帮助贡献者快速理解环境要求、常用命令、分支约定、代码入口、后端注意事项、前端注意事项、审计动作常量、提交与部署方式以及许可要求。

如果你准备提交代码、文档、翻译、修复或任何其他贡献，建议先通读本文，再按本文末尾的检查清单逐项确认。这样可以减少因为环境版本、分支选择、类型检查、构建、缓存、国际化、WebSocket 协议不一致、审计动作命名、部署目录不干净等问题造成的返工。

## 一、开发前置

原文第一条是：

- **Node.js ≥ 22.5**（后端 `node:sqlite`；前端 `vite build` 需 Node ≥ 20.19）。
- 安装依赖：`npm install`（仅构建期）。

这两条看起来简单，但实际贡献时非常关键。下面逐条展开说明。

### 1. Node.js 版本要求

贡献 CircleChat 时，Node.js 版本要求是 **≥ 22.5**。原文同时说明了两个背景：

1. 后端使用 `node:sqlite`；
2. 前端 `vite build` 需要 Node ≥ 20.19。

因此，虽然前端构建本身的要求是 Node ≥ 20.19，但整个项目给出的开发前置是 Node.js ≥ 22.5。也就是说，贡献者应优先满足整个仓库给出的更高要求，而不是只满足前端构建的最低要求。使用 Node.js ≥ 22.5 可以同时覆盖后端 `node:sqlite` 和前端 `vite build` 的需要。

在操作层面，这意味着：

- 在开始开发之前，先确认本机 Node.js 版本。
- 如果本机版本低于 22.5，应先升级 Node.js。
- 不要只因为前端 `vite build` 要求 Node ≥ 20.19，就认为 Node 20.19 已经足够；原文明确给出的开发前置是 Node.js ≥ 22.5。
- 如果团队或部署环境使用容器、版本管理器或 CI，也应确保实际执行 `npm run dev`、`npm run build`、`npm run typecheck`、`npm start` 等命令的 Node.js 版本满足要求。

原文没有要求具体的 Node.js 发行版、包管理器或操作系统。因此本文不补充这些内容。贡献者只需以原文为准：Node.js ≥ 22.5，后端涉及 `node:sqlite`，前端 `vite build` 需 Node ≥ 20.19。

### 2. 安装依赖：`npm install`（仅构建期）

原文要求安装依赖使用：

```bash
npm install
```

并特别标注“仅构建期”。这意味着在贡献和构建流程中，`npm install` 是必要的准备步骤，用于安装构建期依赖。原文没有说它是运行时依赖安装方式，也没有说生产运行必须依赖开发依赖。因此，贡献者应把 `npm install` 理解为开发 / 构建流程中的一步，而不是对生产部署方式的额外说明。

操作建议可以这样理解：

- 第一次拉取仓库后，运行 `npm install`。
- 在依赖或锁文件变化后，按需重新运行 `npm install`。
- 在执行 `npm run build`、`npm run typecheck` 等命令前，确保依赖已安装。
- 原文标注“仅构建期”，所以不要把 `npm install` 误解为生产服务的启动命令。生产启动命令在原文中是 `npm start`。

原文没有列出 `npm ci`、`pnpm`、`yarn` 等替代命令。因此，本文不引入这些替代方案。贡献者应遵循原文给出的 `npm install`。

## 二、常用命令

原文列出了以下常用命令：

```bash
npm run dev          # 开发模式：监听 src/ 增量构建 + Nitro dev，改代码即时生效
npm run build        # 构建前端（Vite）+ 后端（Nitro）
npm run typecheck    # 类型检查：vue-tsc + tsc（与 CI 一致）
npm start            # 启动生产服务（默认 0.0.0.0:8090）
npm run adduser -- <用户名> [新密码]   # 用户管理（新增 / 重置密码）
```

下面逐条展开。

### 1. `npm run dev`

`npm run dev` 是开发模式。原文说明它包含：

- 监听 `src/` 增量构建；
- Nitro dev；
- 改代码即时生效。

这意味着在开发过程中，使用 `npm run dev` 可以获得更快的反馈。它监听 `src/` 并进行增量构建，同时运行 Nitro dev。对于前端业务代码、组件、i18n 文案等位于 `src/` 下的改动，原文说明改代码即时生效。

需要注意，原文只明确写了“监听 `src/`”。因此，贡献者不应把这句话扩展为“监听所有目录”。如果改动涉及后端 `server/`、`public/`、配置文件或其他位置，是否需要重新启动或重新构建，原文没有在常用命令中逐一说明。稳妥做法是：以实际开发体验和源码 / 文档为准。本文不编造额外监听范围。

### 2. `npm run build`

`npm run build` 是构建命令。原文说明它构建：

- 前端：Vite；
- 后端：Nitro。

也就是说，这个命令同时覆盖前端和后端的构建流程。在提交前、部署前，或验证生产构建是否通过时，应使用该命令。原文在“前端改动注意事项”中也再次强调：改动后构建 `npm run build`，或开发模式 `npm run dev`。

因此，`npm run build` 既是构建命令，也是贡献流程中的重要验证步骤。对于前端改动，尤其需要执行它，以确认 Vite 构建通过；对于后端改动，也需要通过 Nitro 构建确认没有构建期问题。

### 3. `npm run typecheck`

`npm run typecheck` 是类型检查命令。原文说明它包含：

- `vue-tsc`；
- `tsc`；
- 与 CI 一致。

这意味着本地运行 `npm run typecheck` 与 CI 中执行的类型检查保持一致。原文在 CI 说明中进一步指出：`.github/workflows/lint.yml` 在 push / PR 时执行 `npm run typecheck`。本地提交前跑一遍能提前发现问题。

因此，贡献者应在提交前运行：

```bash
npm run typecheck
```

如果类型检查失败，应修复后再提交。因为 CI 也会执行同样的检查，本地提前运行可以减少 PR 被阻塞或 push 后失败的概率。

### 4. `npm start`

`npm start` 是启动生产服务的命令。原文说明：

- 默认 `0.0.0.0:8090`。

这意味着生产服务默认监听 `0.0.0.0:8090`。贡献者在本地验证生产启动行为或部署后重启服务时，可以依据该默认值理解服务地址和端口。原文没有列出其他端口配置方式，因此本文不补充。若需要修改，应以源码、配置或部署文档为准。

### 5. `npm run adduser -- <用户名> [新密码]`

`npm run adduser -- <用户名> [新密码]` 是用户管理命令。原文说明其用途是：

- 用户管理；
- 新增；
- 重置密码。

命令格式中，`--` 后面跟 `<用户名>`，可选跟 `[新密码]`。因此可以理解为：

- 新增用户时使用该命令；
- 重置密码时也使用该命令；
- 用户名是必要参数；
- 新密码是可选参数。

原文没有说明密码省略时的具体行为、输出格式、权限要求或数据库影响。因此本文不编造这些细节。贡献者使用时应以实际命令行为和源码为准。

### 6. CI 说明

原文在常用命令后给出：

> CI：`.github/workflows/lint.yml` 在 push / PR 时执行 `npm run typecheck`。本地提交前跑一遍能提前发现问题。

这说明：

- CI 工作流文件是 `.github/workflows/lint.yml`；
- 触发条件是 push / PR；
- 执行内容是 `npm run typecheck`；
- 本地提交前运行同样的命令，可以提前发现问题。

因此，推荐在每次准备 push 或发起 PR 前运行 `npm run typecheck`。这不是额外规则，而是对原文“本地提交前跑一遍能提前发现问题”的落实。

## 三、分支约定

原文给出分支表：

| 分支 | 用途 |
| --- | --- |
| `dev` | 日常开发分支，功能完成后再合并回 `main` |
| `main` | 稳定 / 发布分支，生产服务器据此部署 |

并给出示例：

```bash
git checkout dev
# ...开发、提交...
git push                                  # 推送 dev
git checkout main && git merge dev && git push   # 发布
```

下面展开说明。

### 1. `dev` 分支

`dev` 是日常开发分支。原文说明：

- 日常开发在 `dev`；
- 功能完成后再合并回 `main`。

因此，贡献者进行功能开发、修复、文档调整等日常工作时，应使用 `dev` 分支。功能完成后，再将其合并回 `main`。原文没有要求每个功能都开单独分支，也没有描述 Git Flow 的完整模型。本文只复述原文：`dev` 是日常开发分支。

### 2. `main` 分支

`main` 是稳定 / 发布分支。原文说明：

- 生产服务器据此部署。

这意味着 `main` 不应被当作日常随意开发的分支。它对应稳定 / 发布状态，生产服务器根据 `main` 部署。因此，发布流程通常是把 `dev` 合并到 `main`，再推送 `main`。

### 3. 示例流程

原文示例流程为：

```bash
git checkout dev
# ...开发、提交...
git push                                  # 推送 dev
git checkout main && git merge dev && git push   # 发布
```

这可以拆解为：

1. 切换到 `dev`：
   ```bash
   git checkout dev
   ```
2. 在 `dev` 上进行开发、提交。
3. 推送 `dev`：
   ```bash
   git push
   ```
4. 切换到 `main` 并合并 `dev`，然后推送：
   ```bash
   git checkout main && git merge dev && git push
   ```

原文把这个过程标注为“发布”。因此，发布动作至少包括：切到 `main`、合并 `dev`、推送 `main`。生产服务器再据此部署。

### 4. 分支操作检查清单

在分支相关操作中，可以检查：

- 日常开发是否在 `dev` 分支？
- 功能完成后是否合并回 `main`？
- `main` 是否保持稳定 / 发布用途？
- 生产服务器是否依据 `main` 部署？
- 推送前是否运行了 `npm run typecheck`？
- 发布时是否按示例执行 `git checkout main && git merge dev && git push`？

原文没有要求其他分支命名，也没有描述 PR 目标分支。因此本文不补充。

## 四、代码入口速查

原文给出代码入口：

- 后端路由与逻辑：`server/lib/runtime.ts`（HTTP + WebSocket + 上传）。
- 后端领域模块：`server/lib/*.ts`（auth / store / groups / friends / moderate / mailbox / audit / log / migrate / ws / filetypes / github / appconfig）。
- 前端请求层：`src/core/api.ts`；配置：`public/js/config.js`。
- 前端业务核心：`src/core/chat.ts`；UI：`src/components/`。
- 多语言文案：`src/i18n/messages/{zh,en,ja}.ts`。
- 审计动作常量：`src/core/auditActions.ts`（见下方）。

下面逐项展开。

### 1. 后端路由与逻辑：`server/lib/runtime.ts`

原文说明 `server/lib/runtime.ts` 负责：

- HTTP；
- WebSocket；
- 上传。

因此，当你需要查找后端路由与逻辑时，`server/lib/runtime.ts` 是首要入口。尤其是新增 API、处理 HTTP 请求、WebSocket 相关逻辑、上传相关能力时，应优先查看该文件。原文在后端改动注意事项中进一步说明：新增 API 遵循既有模式，在 `runtime.ts` 的 `handleApi` 中按 `if (pathname === '/api/...' && req.method === 'POST')` 追加。这说明 `runtime.ts` 是新增 API 的关键位置。

### 2. 后端领域模块：`server/lib/*.ts`

原文列出后端领域模块包括：

- `auth`
- `store`
- `groups`
- `friends`
- `moderate`
- `mailbox`
- `audit`
- `log`
- `migrate`
- `ws`
- `filetypes`
- `github`
- `appconfig`

这些模块位于 `server/lib/*.ts`。原文没有逐个解释每个模块的职责，因此本文只按原文列出，不编造具体功能。贡献者可以根据模块名称和源码定位相关领域逻辑。例如，审计相关会涉及 `audit`，迁移相关会涉及 `migrate`，WebSocket 相关会涉及 `ws`，文件类型相关会涉及 `filetypes`。但具体实现和边界应以源码为准。

### 3. 前端请求层：`src/core/api.ts`；配置：`public/js/config.js`

前端请求层入口是 `src/core/api.ts`。配置入口是 `public/js/config.js`。因此，前端与后端交互、请求封装、配置读取等，应优先查看这两个位置。原文没有列出更多前端请求层文件或配置项，因此本文不补充。

### 4. 前端业务核心：`src/core/chat.ts`；UI：`src/components/`

前端业务核心是 `src/core/chat.ts`。UI 位于 `src/components/`。这意味着：

- 聊天业务逻辑、消息分发等核心行为，优先看 `src/core/chat.ts`；
- 界面组件优先看 `src/components/`。

原文在“前端改动注意事项”中特别提到：实时能力改完记得对照 WebSocket 协议，服务端与 `src/core/chat.ts` 的 `onmessage` 分发要一致。这说明 `src/core/chat.ts` 在实时能力中非常关键。

### 5. 多语言文案：`src/i18n/messages/{zh,en,ja}.ts`

多语言文案位于：

- `src/i18n/messages/zh.ts`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/ja.ts`

原文说明新增 i18n 文案时，zh / en / ja 三种语言都要补齐。文案键以扁平 `'a.b.c'` 形式写，构建期 `nest()` 转成嵌套结构。

### 6. 审计动作常量：`src/core/auditActions.ts`

审计动作常量集中在 `src/core/auditActions.ts`。原文在下方“审计动作常量”中详细说明。管理端日志接口 `GET /api/admin/logs` 按 `action` 过滤，动作字符串集中在 `src/core/auditActions.ts`。

### 7. 如何利用入口速查

贡献者可以按以下顺序定位问题：

1. 先判断是后端、前端、i18n、审计还是配置问题。
2. 后端路由与逻辑先看 `server/lib/runtime.ts`。
3. 后端领域逻辑看 `server/lib/*.ts` 对应模块。
4. 前端请求看 `src/core/api.ts`，配置看 `public/js/config.js`。
5. 前端业务核心看 `src/core/chat.ts`，UI 看 `src/components/`。
6. 多语言看 `src/i18n/messages/{zh,en,ja}.ts`。
7. 审计动作看 `src/core/auditActions.ts`。

原文没有列出其他入口，因此本文不补充其他文件路径。

## 五、后端改动注意事项

原文列出六条后端改动注意事项：

1. **不推荐修改 PCL 源码**：若涉及第三方 / 上游资源，请避免改动其源码（许可证约束）。
2. **函数声明优先**：模块初始化阶段被依赖的函数请用 `function xxx(){}`，避免 `const` 箭头函数的暂时性死区（TDZ）导致启动报错。
3. **全局样式放对位置**：关键布局样式放 `public/css/chat-vue.css`（非 `@layer`，优先级高于组件内 `@layer` 样式），例如上传面板的流式布局。
4. **新增 API 遵循既有模式**：在 `runtime.ts` 的 `handleApi` 中按 `if (pathname === '/api/...' && req.method === 'POST')` 追加；请求体统一读 body + JSON 解析；响应统一 `sendJSON`；关键操作调用 `audit.add` 记录审计；末尾 `logger.write` 写访问日志。
5. **新增表结构**：在对应模块的 `open()` 里用 `CREATE TABLE IF NOT EXISTS` 自维护，并在 `server/lib/migrate.ts` 中处理旧库升级（补列）。
6. **安全默认值**：新增上传 / 文件相关能力时，沿用白名单 + 魔数校验 + `UPLOAD_NAME_RE` 随机名 + `path.basename` 比对的双层路径穿越防护，不要信任前端传来的原始路径。

下面逐条展开。

### 1. 不推荐修改 PCL 源码

原文明确：“不推荐修改 PCL 源码”。理由是：若涉及第三方 / 上游资源，请避免改动其源码（许可证约束）。

这意味着：

- 当改动涉及第三方或上游资源时，应避免直接修改其源码。
- 许可证约束是重要原因。
- 如果确实需要调整，应优先考虑以不修改上游源码的方式进行，或遵循许可证要求处理。
- 贡献者不应把修改第三方 / 上游资源源码当作常规手段。

原文没有解释 PCL 具体指什么，也没有列出许可证名称。因此本文不补充。贡献者应以仓库中的许可证、CREDITS、上游文件为准。

### 2. 函数声明优先

原文要求：“模块初始化阶段被依赖的函数请用 `function xxx(){}`，避免 `const` 箭头函数的暂时性死区（TDZ）导致启动报错。”

这条非常具体。含义是：

- 如果一个函数会在模块初始化阶段被依赖，应使用函数声明：
  ```js
  function xxx() {}
  ```
- 避免使用 `const` 箭头函数，例如：
  ```js
  const xxx = () => {}
  ```
- 原因是 `const` 箭头函数可能存在暂时性死区（TDZ），导致启动时报错。
- 目标是在模块初始化阶段避免依赖顺序问题。

在后端改动中，如果新增或调整模块初始化逻辑，应特别注意这一点。函数声明会被提升，更适合在初始化阶段被依赖；`const` 箭头函数则可能因为声明顺序导致 TDZ 问题。原文没有要求所有函数都必须使用函数声明，而是特指“模块初始化阶段被依赖的函数”。因此，贡献者应重点关注初始化路径。

### 3. 全局样式放对位置

原文要求：“关键布局样式放 `public/css/chat-vue.css`（非 `@layer`，优先级高于组件内 `@layer` 样式），例如上传面板的流式布局。”

这意味着：

- 关键布局样式应放在 `public/css/chat-vue.css`；
- 该文件中的样式不是 `@layer`；
- 非 `@layer` 样式的优先级高于组件内 `@layer` 样式；
- 例如上传面板的流式布局应放在这里。

如果在前端改动中遇到样式优先级问题，尤其是关键布局样式被组件内 `@layer` 样式覆盖，应检查是否应放到 `public/css/chat-vue.css`。原文给出了上传面板流式布局这个例子，说明这类布局样式需要放在正确位置。

### 4. 新增 API 遵循既有模式

原文对新增 API 给出了明确模式：

- 在 `runtime.ts` 的 `handleApi` 中按：
  ```js
  if (pathname === '/api/...' && req.method === 'POST')
  ```
  追加；
- 请求体统一读 body + JSON 解析；
- 响应统一 `sendJSON`；
- 关键操作调用 `audit.add` 记录审计；
- 末尾 `logger.write` 写访问日志。

这说明新增 API 时不应另起一套风格，而应遵循既有模式。具体要点包括：

1. 路由判断写在 `runtime.ts` 的 `handleApi` 中。
2. 判断条件形如 `pathname === '/api/...' && req.method === 'POST'`。
3. 请求体读取和 JSON 解析要统一。
4. 响应使用 `sendJSON`。
5. 关键操作要用 `audit.add` 记录审计。
6. 末尾用 `logger.write` 写访问日志。

贡献者新增 API 时，可以按这个检查清单核对。原文没有列出所有 API 的完整实现，也没有说明非 POST 请求的处理模式，因此本文只复述原文给出的 POST 示例和统一模式。

### 5. 新增表结构

原文要求：“在对应模块的 `open()` 里用 `CREATE TABLE IF NOT EXISTS` 自维护，并在 `server/lib/migrate.ts` 中处理旧库升级（补列）。”

这意味着：

- 新增表结构时，在对应模块的 `open()` 中自维护；
- 使用 `CREATE TABLE IF NOT EXISTS`；
- 旧库升级在 `server/lib/migrate.ts` 中处理；
- 升级方式包括补列。

因此，新增表结构不是只改一个地方。对应模块的 `open()` 负责创建表；`server/lib/migrate.ts` 负责旧库升级。贡献者需要同时考虑新库和旧库场景。原文特别提到“补列”，说明旧库升级可能涉及为已有表增加列。

### 6. 安全默认值

原文要求：“新增上传 / 文件相关能力时，沿用白名单 + 魔数校验 + `UPLOAD_NAME_RE` 随机名 + `path.basename` 比对的双层路径穿越防护，不要信任前端传来的原始路径。”

这条是上传 / 文件相关能力的安全底线。要点包括：

- 白名单；
- 魔数校验；
- `UPLOAD_NAME_RE` 随机名；
- `path.basename` 比对；
- 双层路径穿越防护；
- 不要信任前端传来的原始路径。

贡献者新增上传 / 文件相关能力时，应沿用这些既有防护，而不是只依赖前端校验。前端传来的原始路径不可信。原文没有列出白名单具体内容、魔数具体格式、`UPLOAD_NAME_RE` 具体正则，因此本文不补充。贡献者应以源码为准。

## 六、前端改动注意事项

原文列出前端改动注意事项：

- 改动后构建：`npm run build`（或开发模式 `npm run dev`）。
- 测试时浏览器需**硬刷新**（`Ctrl+Shift+R`），以清理缓存的静态资源。
- 新增 i18n 文案时，zh / en / ja 三种语言都要补齐（文案键以扁平 `'a.b.c'` 形式写，构建期 `nest()` 转成嵌套结构）。
- 实时能力改完记得对照 [WebSocket 协议](../api/websocket.md)，服务端与 `src/core/chat.ts` 的 `onmessage` 分发要一致。

下面逐条展开。

### 1. 改动后构建

前端改动后，应执行：

```bash
npm run build
```

或使用开发模式：

```bash
npm run dev
```

原文说明 `npm run build` 构建前端（Vite）+ 后端（Nitro）。因此，前端改动后构建不仅验证前端，也可能涉及后端构建。开发模式下则使用 `npm run dev`，监听 `src/` 增量构建 + Nitro dev，改代码即时生效。

### 2. 测试时硬刷新

原文要求：测试时浏览器需硬刷新，快捷键是 `Ctrl+Shift+R`。目的是清理缓存的静态资源。

这意味着前端改动后，普通刷新可能仍然使用缓存资源，导致看到旧界面或旧逻辑。硬刷新可以清理缓存静态资源。贡献者在测试前端改动时，应使用硬刷新确认实际效果。

### 3. 新增 i18n 文案

原文要求：

- zh / en / ja 三种语言都要补齐；
- 文案键以扁平 `'a.b.c'` 形式写；
- 构建期 `nest()` 转成嵌套结构。

因此，新增文案时不能只加中文或只加英文。需要同时处理：

- `src/i18n/messages/zh.ts`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/ja.ts`

文案键写法是扁平形式，例如 `'a.b.c'`。构建期会通过 `nest()` 转成嵌套结构。贡献者应遵循这种写法，而不是直接写嵌套对象。原文没有列出所有文案键，也没有说明翻译风格，因此本文不补充。

### 4. 实时能力与 WebSocket 协议

原文要求：实时能力改完记得对照 [WebSocket 协议](../api/websocket.md)，服务端与 `src/core/chat.ts` 的 `onmessage` 分发要一致。

这意味着：

- 修改实时能力后，要查看 WebSocket 协议文档；
- 服务端实现与前端 `src/core/chat.ts` 的 `onmessage` 分发必须一致；
- 不能只改一端。

贡献者在改 WebSocket 相关能力时，应同时检查服务端和前端分发逻辑，确保协议一致。

## 七、审计动作常量

原文对审计动作常量给出详细说明：

- 管理端日志接口（`GET /api/admin/logs`）按 `action` 过滤，动作字符串集中在 `src/core/auditActions.ts`。
- 约定上动作以「命名空间」组织，可用 `actionPrefix` 做前缀匹配（例如只看治理类就传 `actionPrefix=penalty`）。
- 常见动作分布在以下几类（权威列表以源码 `auditActions.ts` 为准）：
  - **账号类**：`login` / `logout` / `register` / `pass`（改密）/ `profile`（改资料）。
  - **社交类**：`message`（发消息）/ `upload`（上传）/ `react`（回应）/ `recall`（撤回）/ `friend`（好友操作）。
  - **治理类**：`penalty`（处罚）/ `report`（举报）/ `review.approve` / `review.reject`（注册审核）。
  - **群组类**：`group.create` / `group.rename` / `group.dissolve` / `group.transfer` / `group.member`（成员变更）等 `group.*`。
  - **管理类**：`admin.user.add` / `admin.user.del` / `admin.announce`（公告）/ `admin.file.del`（删文件）。
- 审计详情 `detail` 以结构化 `{k: i18n键, v: 占位变量}` 的 JSON 字符串存储，单条上限 `MAX_DETAIL = 300` 字符，便于多语言前端直接翻译。

下面逐条展开。

### 1. 管理端日志接口与 action 过滤

管理端日志接口是：

```text
GET /api/admin/logs
```

该接口按 `action` 过滤。动作字符串集中在：

```text
src/core/auditActions.ts
```

因此，新增或调整审计动作时，应关注 `src/core/auditActions.ts`。管理端日志查询时，`action` 是过滤依据。

### 2. 命名空间与 actionPrefix

原文说明：约定上动作以「命名空间」组织，可用 `actionPrefix` 做前缀匹配。例如只看治理类就传：

```text
actionPrefix=penalty
```

这意味着：

- 动作字符串不是随意散落的；
- 它们按命名空间组织；
- 可以用前缀匹配筛选某一类动作；
- 治理类示例前缀是 `penalty`。

### 3. 常见动作分类

原文列出常见动作，但强调权威列表以源码 `auditActions.ts` 为准。因此，以下只是常见分布，不是完整列表。

#### 账号类

- `login`
- `logout`
- `register`
- `pass`（改密）
- `profile`（改资料）

#### 社交类

- `message`（发消息）
- `upload`（上传）
- `react`（回应）
- `recall`（撤回）
- `friend`（好友操作）

#### 治理类

- `penalty`（处罚）
- `report`（举报）
- `review.approve`
- `review.reject`（注册审核）

#### 群组类

- `group.create`
- `group.rename`
- `group.dissolve`
- `group.transfer`
- `group.member`（成员变更）
- 等 `group.*`

#### 管理类

- `admin.user.add`
- `admin.user.del`
- `admin.announce`（公告）
- `admin.file.del`（删文件）

### 4. 审计详情 detail

原文说明：

- 审计详情 `detail` 以结构化 `{k: i18n键, v: 占位变量}` 的 JSON 字符串存储；
- 单条上限 `MAX_DETAIL = 300` 字符；
- 便于多语言前端直接翻译。

因此，`detail` 不是随意字符串，而是结构化 JSON 字符串。键 `k` 是 i18n 键，值 `v` 是占位变量。单条上限是 300 字符。这样设计便于多语言前端直接翻译。

贡献者新增审计时，应遵循这种结构，并注意 300 字符上限。权威动作列表以 `src/core/auditActions.ts` 为准。

## 八、提交与部署

原文列出提交与部署要点：

- 推送到 `main` 后，生产服务器可通过 `git pull` 更新并重新 `npm run build` + 重启进程 / 容器（详见[生产部署](../getting-started/installation.md)）。
- 部署目录须保持干净（无未提交改动，如 `package-lock.json`），否则 `git pull` 会中止；建议部署目录只做 `git fetch` + `git reset --hard`。
- 也可以用远端仓库的 `post-receive` 钩子把「拉取 → 构建 → 重启」自动化。

下面展开。

### 1. 推送到 main 后的部署

推送到 `main` 后，生产服务器可通过 `git pull` 更新，并重新：

```bash
npm run build
```

然后重启进程 / 容器。原文指出详见[生产部署](../getting-started/installation.md)。因此，部署流程至少包括：

1. 推送到 `main`；
2. 生产服务器 `git pull`；
3. `npm run build`；
4. 重启进程 / 容器。

### 2. 部署目录须保持干净

原文要求：部署目录须保持干净，无未提交改动，如 `package-lock.json`。否则 `git pull` 会中止。建议部署目录只做：

```bash
git fetch
git reset --hard
```

这意味着：

- 部署目录不要有未提交改动；
- `package-lock.json` 这类文件如果被改动，可能导致 `git pull` 中止；
- 为避免 `git pull` 因本地改动失败，建议使用 `git fetch` + `git reset --hard`。

### 3. post-receive 钩子自动化

原文说明：也可以用远端仓库的 `post-receive` 钩子把「拉取 → 构建 → 重启」自动化。

这表示自动化部署的可能方式包括：

- 远端仓库 `post-receive` 钩子；
- 自动化执行拉取；
- 自动化执行构建；
- 自动化执行重启。

原文没有给出钩子脚本内容，因此本文不补充。

## 九、许可

原文说明：

- 本项目以 GNU GPL v3.0 开源。
- 贡献即表示你同意以 GPL-3.0 条款许可你的贡献。
- 完整第三方资源与许可见 CREDITS.md。

因此，贡献者在提交贡献前应理解：

- 项目许可证是 GNU GPL v3.0；
- 你的贡献会以 GPL-3.0 条款许可；
- 第三方资源与许可信息在 `CREDITS.md`。

原文给出了 LICENSE 和 CREDITS.md 的 GitHub 链接。贡献者应遵循这些许可要求。

## 十、贡献流程总览

综合原文，可以将贡献流程整理为：

1. 确认 Node.js ≥ 22.5。
2. 运行 `npm install`（仅构建期）。
3. 切换到 `dev` 分支进行日常开发。
4. 根据改动位置查阅代码入口：
   - 后端：`server/lib/runtime.ts`、`server/lib/*.ts`；
   - 前端：`src/core/api.ts`、`public/js/config.js`、`src/core/chat.ts`、`src/components/`；
   - i18n：`src/i18n/messages/{zh,en,ja}.ts`；
   - 审计：`src/core/auditActions.ts`。
5. 后端改动注意：
   - 不推荐修改 PCL 源码；
   - 初始化阶段被依赖函数用 `function xxx(){}`；
   - 全局样式放 `public/css/chat-vue.css`；
   - 新增 API 按 `handleApi` 模式；
   - 新增表结构用 `CREATE TABLE IF NOT EXISTS` 并处理 `migrate.ts`；
   - 上传 / 文件能力沿用白名单、魔数、`UPLOAD_NAME_RE`、`path.basename` 双层防护。
6. 前端改动注意：
   - 构建 `npm run build` 或开发 `npm run dev`；
   - 测试硬刷新 `Ctrl+Shift+R`；
   - i18n 三语言补齐，扁平键，`nest()`；
   - 实时能力对照 WebSocket 协议与 `src/core/chat.ts` 的 `onmessage`。
7. 提交前运行 `npm run typecheck`。
8. 推送到 `dev`。
9. 发布时切到 `main`，合并 `dev`，推送 `main`。
10. 生产服务器 `git pull`，`npm run build`，重启进程 / 容器。
11. 部署目录保持干净，建议 `git fetch` + `git reset --hard`，可用 `post-receive` 钩子自动化。
12. 贡献以 GPL-3.0 许可，第三方资源见 CREDITS.md。

## 十一、提交前检查清单

以下检查清单完全基于原文要点，提交前可逐项核对：

- [ ] Node.js 版本是否 ≥ 22.5？
- [ ] 是否已运行 `npm install`？
- [ ] 是否在 `dev` 分支进行日常开发？
- [ ] 是否运行了 `npm run typecheck`？
- [ ] 如果改了前端，是否运行 `npm run build` 或 `npm run dev`？
- [ ] 浏览器测试是否硬刷新 `Ctrl+Shift+R`？
- [ ] 如果新增 i18n 文案，zh / en / ja 是否都补齐？
- [ ] i18n 键是否使用扁平 `'a.b.c'` 形式？
- [ ] 如果改实时能力，是否对照 WebSocket 协议？
- [ ] 服务端与 `src/core/chat.ts` 的 `onmessage` 分发是否一致？
- [ ] 如果新增 API，是否在 `runtime.ts` 的 `handleApi` 中按既有模式追加？
- [ ] 请求体是否统一读 body + JSON 解析？
- [ ] 响应是否统一 `sendJSON`？
- [ ] 关键操作是否调用 `audit.add`？
- [ ] 末尾是否 `logger.write` 写访问日志？
- [ ] 如果新增表结构，是否在对应模块 `open()` 中用 `CREATE TABLE IF NOT EXISTS`？
- [ ] 是否在 `server/lib/migrate.ts` 中处理旧库升级（补列）？
- [ ] 如果新增上传 / 文件能力，是否沿用白名单 + 魔数校验 + `UPLOAD_NAME_RE` 随机名 + `path.basename` 比对双层路径穿越防护？
- [ ] 是否避免修改 PCL 源码？
- [ ] 初始化阶段被依赖函数是否用 `function xxx(){}`？
- [ ] 关键布局样式是否放 `public/css/chat-vue.css`（非 `@layer`）？
- [ ] 审计动作是否集中在 `src/core/auditActions.ts`？
- [ ] `detail` 是否为 `{k: i18n键, v: 占位变量}` JSON 字符串且不超过 `MAX_DETAIL = 300`？
- [ ] 发布时是否切到 `main` 合并 `dev` 并推送？
- [ ] 部署目录是否干净？
- [ ] 是否按需使用 `git fetch` + `git reset --hard`？
- [ ] 是否理解贡献以 GPL-3.0 许可？
- [ ] 是否查阅 CREDITS.md 了解第三方资源与许可？

## 十二、常见问题（基于原文可回答的部分）

### Q1：Node.js 要装哪个版本？

原文要求 Node.js ≥ 22.5。后端 `node:sqlite`；前端 `vite build` 需 Node ≥ 20.19。因此应满足 Node.js ≥ 22.5。

### Q2：依赖怎么安装？

使用 `npm install`，原文标注为仅构建期。

### Q3：开发模式命令是什么？

`npm run dev`。监听 `src/` 增量构建 + Nitro dev，改代码即时生效。

### Q4：构建命令是什么？

`npm run build`。构建前端（Vite）+ 后端（Nitro）。

### Q5：类型检查命令是什么？

`npm run typecheck`。包含 `vue-tsc` + `tsc`，与 CI 一致。

### Q6：CI 在哪里执行什么？

`.github/workflows/lint.yml` 在 push / PR 时执行 `npm run typecheck`。

### Q7：生产启动命令是什么？

`npm start`。默认 `0.0.0.0:8090`。

### Q8：用户管理命令是什么？

`npm run adduser -- <用户名> [新密码]`，用于新增 / 重置密码。

### Q9：日常开发用哪个分支？

`dev`。功能完成后再合并回 `main`。

### Q10：生产服务器依据哪个分支部署？

`main`。

### Q11：后端路由与逻辑入口在哪？

`server/lib/runtime.ts`（HTTP + WebSocket + 上传）。

### Q12：后端领域模块有哪些？

`server/lib/*.ts`：auth / store / groups / friends / moderate / mailbox / audit / log / migrate / ws / filetypes / github / appconfig。

### Q13：前端请求层和配置在哪？

请求层：`src/core/api.ts`；配置：`public/js/config.js`。

### Q14：前端业务核心和 UI 在哪？

业务核心：`src/core/chat.ts`；UI：`src/components/`。

### Q15：多语言文案在哪？

`src/i18n/messages/{zh,en,ja}.ts`。

### Q16：审计动作常量在哪？

`src/core/auditActions.ts`。

### Q17：新增 API 怎么做？

在 `runtime.ts` 的 `handleApi` 中按 `if (pathname === '/api/...' && req.method === 'POST')` 追加；请求体统一读 body + JSON 解析；响应统一 `sendJSON`；关键操作调用 `audit.add`；末尾 `logger.write` 写访问日志。

### Q18：新增表结构怎么做？

在对应模块的 `open()` 里用 `CREATE TABLE IF NOT EXISTS` 自维护，并在 `server/lib/migrate.ts` 中处理旧库升级（补列）。

### Q19：上传 / 文件安全怎么做？

沿用白名单 + 魔数校验 + `UPLOAD_NAME_RE` 随机名 + `path.basename` 比对的双层路径穿越防护，不要信任前端传来的原始路径。

### Q20：前端测试为什么要硬刷新？

为了清理缓存的静态资源。快捷键 `Ctrl+Shift+R`。

### Q21：i18n 文案键怎么写？

以扁平 `'a.b.c'` 形式写，构建期 `nest()` 转成嵌套结构。

### Q22：实时能力改完要注意什么？

对照 [WebSocket 协议](../api/websocket.md)，服务端与 `src/core/chat.ts` 的 `onmessage` 分发要一致。

### Q23：审计日志接口是什么？

`GET /api/admin/logs`，按 `action` 过滤。

### Q24：actionPrefix 怎么用？

可用 `actionPrefix` 做前缀匹配，例如只看治理类就传 `actionPrefix=penalty`。

### Q25：审计 detail 格式和上限？

`detail` 以结构化 `{k: i18n键, v: 占位变量}` 的 JSON 字符串存储，单条上限 `MAX_DETAIL = 300` 字符。

### Q26：部署时生产服务器怎么做？

推送到 `main` 后，生产服务器可通过 `git pull` 更新并重新 `npm run build` + 重启进程 / 容器。

### Q27：部署目录要注意什么？

须保持干净，无未提交改动，如 `package-lock.json`，否则 `git pull` 会中止；建议只做 `git fetch` + `git reset --hard`。

### Q28：可以自动化部署吗？

可以用远端仓库的 `post-receive` 钩子把「拉取 → 构建 → 重启」自动化。

### Q29：许可证是什么？

GNU GPL v3.0。贡献即表示同意以 GPL-3.0 条款许可你的贡献。完整第三方资源与许可见 CREDITS.md。

## 十三、结语

欢迎为 CircleChat 贡献。只要遵循 Node.js ≥ 22.5 的环境要求，使用 `npm install` 安装构建期依赖，在 `dev` 分支开发，提交前运行 `npm run typecheck`，按后端 / 前端注意事项改动，补齐 i18n，保持 WebSocket 协议一致，正确使用审计动作常量，保持部署目录干净，并理解 GPL-3.0 许可，就能更顺畅地参与这个项目。