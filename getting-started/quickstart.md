# 快速开始

这一页用最短的路径在本地把 CircleChat 跑起来。只要装好 Node.js，几条命令就能起一个可登录、可聊天的服务。

## 1. 环境要求

- **Node.js ≥ 22.5**：后端直接用内建的 `node:sqlite`，版本不够会在启动时崩溃。前端打包（`vite build`）则要求 Node ≥ 20.19。
- **npm**：建议 ≥ 10。旧版 npm（比如 9.x）会在 `npm install` 时改写 `package-lock.json`（常见是把 `libc` 字段删掉），部署机上 `git pull` 会因此因为工作区不干净而中止。
- 操作系统无特殊要求，Linux / macOS / Windows 均可；本机只是开发体验，真正部署见[生产部署](installation.md)。

## 2. 获取源码

```bash
git clone https://github.com/CircleChat-Team/CircleChat.git
cd CircleChat
```

如果你已经把仓库克隆到本地，直接进入目录即可。

## 3. 安装依赖

在项目根目录执行：

```bash
npm install
```

这一步只装**构建期**依赖（Vite 打包前端、Nitro 打包后端）。服务真正跑起来以后，`node .output/server/index.mjs` 不依赖任何第三方运行时 npm 包——这正是「服务端零第三方运行时依赖」的含义。`npm install` 只在首次或依赖变更后需要。

## 4. 构建

```bash
npm run build
```

构建做两件事：

- 前端经 Vite 打包进 `public/dist/`。
- 后端经 Nitro（`node-server` 预设）打包进 `.output/`，入口是 `.output/server/index.mjs`。

构建出的前端是手写 HTML 壳（`public/` 下 `login.html` / `chat.html` / `group.html` / `admin.html` / `index.html`），Nitro 之下由内部静态服务直接托管，不需要额外 Nginx 之类就能打开页面。

## 5. 启动

```bash
npm start
```

默认监听 `0.0.0.0:8090`。浏览器访问 `http://localhost:8090`（或 `http://<服务器IP>:8090`），根路径 `/` 会自动跳到登录页。

服务首次启动会在当前工作目录生成两个运行时目录：`data/`（数据库与访问日志）和 `public/uploads/`（上传文件），无需手动创建。

## 6. 首次登录

首次启动、用户表为空时，会自动创建管理员账号：

- 用户名：`admin`
- 密码：`Admin1234`

登录后建议立刻改密码（个人中心 → 修改密码，或用 `npm run adduser`）。如果老库里已经有用户，启动只会**补建** `admin`，不会覆盖任何已有密码。

## 7. 开发模式

日常改代码不想每次都完整构建，用开发模式：

```bash
npm run dev
```

它会一边监听 `src/` 做增量构建，一边以 Nitro dev 启动后端。改前端或后端源码后通常能即时生效，省去 `npm run build` + 重启。开发模式的数据同样落在 `data/`，和构建产物共用一套库。

## 8. 常用命令一览

| 命令 | 作用 |
| --- | --- |
| `npm install` | 安装依赖（首次，或 `package.json` / `package-lock.json` 变动后） |
| `npm run build` | 构建前端（Vite）与后端（Nitro） |
| `npm start` | 启动生产服务（默认 `0.0.0.0:8090`） |
| `npm run dev` | 开发模式：监听 `src/` 增量构建 + 启动 Nitro dev，改代码即时生效 |
| `npm run typecheck` | 类型检查（前端 `vue-tsc` + 后端 `tsc`），与 CI 一致 |
| `npm run adduser -- <用户名> [新密码]` | 用户管理：新增用户或重置其密码（省略密码则交互式隐藏输入） |

CI 在 `.github/workflows/lint.yml` 里于 push / PR 时跑 `npm run typecheck`，本地提交前跑一遍能提前发现问题。

## 9. 端口与环境变量

`npm start` 实际执行的是 `PORT=${PORT:-8090} node .output/server/index.mjs`，所以：

```bash
PORT=8080 npm start      # 监听 8080
```

其它运行时配置（上传保留天数、数据库文件路径等）也通过环境变量控制，见[配置说明](configuration.md)。

## 10. 目录结构速览

克隆下来的源码大致是这样：

```
CircleChat/
├── nitro.config.ts        # Nitro 配置（node-server 预设；serveStatic:false）
├── vite.config.mts        # 前端多页构建（以 public/ 下 HTML 壳为页面）
├── server/
│   ├── lib/               # 后端领域模块（auth/store/groups/friends/ws/moderate/...）
│   ├── routes/[...].ts    # 全量兜底路由，把请求转交 runtime.handleHttp
│   └── plugins/           # bootstrap（启动初始化）、ws（WebSocket 升级）
├── tools/                 # adduser.ts、hljs-entry.mjs、security-test.js
├── src/                   # 前端源码（Vue3 + TS）
├── public/                # 页面壳、js/config.js、dist/ 构建产物、css/、vendor/
└── data/                  # 运行时生成：chatplus.db、access.log、uploads/
```

## 下一步

- 想接 Nginx / 反向代理 / 容器，看[生产部署](installation.md)。
- 想调端口、上传保留天数、显示与请求地址分离，看[配置说明](configuration.md)。
- 普通用户怎么用，看[用户指南](../guide/usage.md)；管理员怎么治理，看[管理后台](../guide/administration.md)。
