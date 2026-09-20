# 生产部署

本节介绍如何把 CircleChat 部署到生产服务器，支持 Nginx 反向代理、容器化运行，并说明更新服务器的步骤。

## 反向代理（Nginx）

生产环境建议经 Nginx 反向代理并启用 HTTPS。

```
server {
    listen 443 ssl;
    server_name chat.example.com;

    # 将请求转发到 Node 服务（默认端口 8090）
    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;

        # WebSocket 升级必须透传以下两个头
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

> **关键点**：WebSocket 需要透传 `Upgrade` / `Connection` 两个头，否则实时消息无法推送。

如果希望部署为「反代子路径」（例如 `https://chat.example.com/chat`），将 `location /chat` 转发到后端，并在 [配置](configuration.md#显示--请求地址分离) 中把 `apiBase` 设为 `/chat`。

## 端口配置

生产端口可通过环境变量覆盖：

```bash
PORT=8080 npm start
```

容器部署时，容器端口映射到宿主机端口（详见下方「容器化」）。

## 容器化运行（示例）

项目使用 Nitro 的 `node-server` 预设构建，产物为纯 Node.js 进程，可直接封装进容器。

| 项 | 值 |
| --- | --- |
| 基础镜像 | Node.js（满足 ≥ 22.5，如 Node 25.9.0） |
| 运行命令 | `node .output/server/index.mjs` |
| 容器端口 | `8080`（须与 `.env` 中 `PORT=8080` 一致） |
| 端口映射 | 宿主端口 `5191 → 8080` |
| 工作目录 | `/home/CircleChat` |
| 裸仓库 | `/home/CircleChat.git`（用于拉取 / 部署 `main` 分支） |

> 提示：容器内 `PORT` 必须与容器监听的端口一致，再把宿主端口映射到对外端口。

## 部署分支约定

| 分支 | 用途 |
| --- | --- |
| `main` | **默认 / 稳定分支**，用于发布；生产服务器从 `main` 拉取部署 |
| `dev` | 日常开发分支，功能完成后再合并回 `main` |

```bash
git checkout dev            # 日常在 dev 上开发、提交
git push                    # 推送 dev

# 发布：把 dev 合入 main 并推送（服务器据此部署）
git checkout main && git merge dev && git push
```

> 远端名一般为 `CircleChat`（可用 `git remote -v` 查看）。

## 更新服务器

推送到 `main` 后，在部署机上按顺序执行：

```bash
git pull            # 同步源码
npm install         # 仅当 package.json / package-lock.json 有变动时需要
npm run build       # 构建前端（Vite）与后端（Nitro）
# 重启服务进程 / 容器
```

也可以用远端仓库的 `post-receive` 钩子把上面几步自动化——钩子同步源码后可继续执行 `npm install`（依赖有变动时）、`npm run build` 并重启服务。

## 两个容易踩的坑

1. **构建与运行版本一致**：构建请用与服务运行时相同（或更高）的 Node 版本，`vite build` 需要 Node ≥ 20.19。
2. **依赖锁文件**：旧版 npm（如 9.x）会在 `npm install` 时改写 `package-lock.json`（例如删掉 `libc` 字段），使部署机的 `git pull` 因工作区不干净而中止。建议升级 npm，或让部署目录只做 `git fetch` + `git reset --hard`（部署目录不应存在本地改动）。

## 配置

部署相关的环境变量与前端配置见[配置说明](configuration.md)。