# 快速开始

本页带你以最短路径在本机跑起 CircleChat。

## 1. 环境要求

- **Node.js ≥ 22.5**（使用内建 `node:sqlite`，过低版本启动即崩溃；`vite build` 需 Node ≥ 20.19）
- npm（建议 ≥ 10，避免旧版 npm 改写 `package-lock.json`）

## 2. 安装依赖

在项目根目录执行：

```bash
npm install
```

依赖仅用于**构建期**（前端打包 + 后端打包），服务运行时无第三方依赖。

## 3. 构建

```bash
npm run build
```

- 前端经 Vite 构建到 `public/dist/`
- 后端经 Nitro 构建到 `.output/`（产物入口 `.output/server/index.mjs`）

## 4. 启动

```bash
npm start
```

默认监听 `0.0.0.0:8090`。浏览器访问 `http://localhost:8090`，根路径 `/` 自动跳转登录页。

## 5. 首次登录

首次启动若用户表为空，会自动创建管理员：

- 用户名：`admin`
- 密码：`Admin1234`

**生产部署后请尽快修改默认密码。**

## 常用命令一览

| 命令 | 作用 |
| --- | --- |
| `npm install` | 安装依赖（首次，或依赖变更后） |
| `npm run build` | 构建前端（Vite）与后端（Nitro） |
| `npm start` | 启动生产服务（默认 `0.0.0.0:8090`） |
| `npm run dev` | 开发模式：监听 `src/` 增量构建 + 启动 Nitro dev，改代码即时生效 |
| `npm run typecheck` | 类型检查（前端 `vue-tsc` + 后端 `tsc`，与 CI 一致） |
| `npm run adduser -- <用户名> [新密码]` | 用户管理：新增用户或重置密码 |

## 下一步

- 查看[生产部署](installation.md)以接入 Nginx / 反向代理 / 容器。
- 查看[配置说明](configuration.md)了解端口、上传保留与地址分离。