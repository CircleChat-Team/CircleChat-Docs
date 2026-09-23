# 生产部署

生产部署方式：Nginx 反代 + HTTPS、systemd 守护、容器化，以及平稳更新。无论哪种方式，服务本体都是同一个 Node.js 进程（`node .output/server/index.mjs`），区别仅在前面怎么接流量、进程怎么被守护。

## 反向代理（Nginx + HTTPS）

生产环境强烈建议放在 Nginx 后面并启用 HTTPS。CircleChat 自己不带 TLS，也不带静态文件 CDN，Nginx 顺手把这两件事做了。

```
server {
    listen 443 ssl;
    server_name chat.example.com;

    ssl_certificate     /etc/letsencrypt/live/chat.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chat.example.com/privkey.pem;

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
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

关键点只有一条：WebSocket 必须透传 `Upgrade` / `Connection` 两个头，否则实时消息推不出去（连接建立后立刻断或收不到推送）。`proxy_http_version 1.1` 也得有，HTTP/1.0 默认不带长连接。

### 反代子路径

如果希望挂在子路径，比如 `https://chat.example.com/chat`：

```
location /chat {
    proxy_pass http://127.0.0.1:8090;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

同时按[配置说明 · 显示 / 请求地址分离](configuration#显示--请求地址分离)把前端 `public/js/config.js` 的 `apiBase` 设为 `/chat`，前端页面也要走该子路径访问。

### 让 Nginx 直接扛静态资源（可选）

如果不想让 Node 进程每次都回静态文件，也可以把 `public/` 交给 Nginx 直接 serve，只把 `/api` 和 `/ws` 反代到后端。但要注意 `public/uploads/` 是运行期写入的，且 `admin.html` / `/js/admin.js` 的后端鉴权依赖落到 Node，这种拆法仅在明确权衡代价后考虑。

## 用 systemd 守护进程

裸跑 `npm start` 一旦终端关掉进程就没了。用 systemd 让它开机自启、崩溃自动拉起：

```ini
# /etc/systemd/system/circlechat.service
[Unit]
Description=CircleChat
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/CircleChat
ExecStart=/usr/bin/env PORT=8090 FILE_TTL_DAYS=15 node /home/CircleChat/.output/server/index.mjs
Environment=NODE_ENV=production
Restart=on-failure
RestartSec=5
User=circlechat
# 防止 OOM 时直接被杀，留点余量
# MemoryMax=512M

[Install]
WantedBy=multi-user.target
```

`WorkingDirectory` 要指向仓库根（数据库 `data/` 和上传 `public/uploads/` 都相对它生成）。环境变量直接写在 `ExecStart` 或 `[Service]` 的 `Environment=` 里。

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now circlechat
sudo systemctl status circlechat      # 看是否起来
sudo journalctl -u circlechat -f      # 跟日志
```

优雅重启：CircleChat 在 `SIGTERM` / `SIGINT` 时会 `broadcastLogout('server-restart')` 通知在线客户端，所以 `systemctl restart circlechat` 不会让前端卡在死连接上。

## 容器化运行

项目用 Nitro 的 `node-server` 预设构建，产物就是个纯 Node 进程，可以直接塞进容器。可直接用的 `Dockerfile`：

```dockerfile
# ---- 构建阶段 ----
FROM node:22-bookworm AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- 运行阶段 ----
FROM node:22-bookworm-slim
WORKDIR /app
ENV PORT=8080 \
    FILE_TTL_DAYS=15 \
    NODE_ENV=production
COPY --from=build /app/.output ./.output
COPY --from=build /app/public ./public
# 仅运行期需要的静态壳与配置
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
```

构建并运行：

```bash
docker build -t circlechat .
docker run -d --name circlechat \
  -p 5191:8080 \
  -v circlechat-data:/app/data \
  -v circlechat-uploads:/app/public/uploads \
  circlechat
```

注意两点：容器里 `PORT` 必须是容器**内部**监听的端口（上面是 `8080`），宿主端口（上面 `5191`）只是映射出去；`data/` 和 `public/uploads/` 用卷挂出来，否则容器一删数据全没。

如果只在前面挡 Nginx，把 Nginx 的 `proxy_pass` 指向 `http://127.0.0.1:5191` 即可（容器端口经宿主映射）。

## 部署分支约定

源码用两个长期分支协作：

| 分支 | 用途 |
| --- | --- |
| `main` | 默认 / 稳定分支，用于发布；生产服务器从 `main` 拉取部署 |
| `dev` | 日常开发分支，功能完成后再合并回 `main` |

日常节奏：

```bash
git checkout dev            # 日常在 dev 上开发、提交
git push                    # 推送 dev

# 发布：把 dev 合入 main 并推送（服务器据此部署）
git checkout main && git merge dev && git push
```

远端名一般是 `CircleChat`（可用 `git remote -v` 查看）。

## 更新服务器

推送到 `main` 后，在部署机上按顺序执行：

```bash
git pull            # 同步源码
npm install         # 仅当 package.json / package-lock.json 有变动时需要
npm run build       # 构建前端（Vite）与后端（Nitro）
# 重启服务进程 / 容器
```

systemd 部署就是 `sudo systemctl restart circlechat`；容器部署就是重新 build / 换镜像后 `docker restart`。

### 用 Git 钩子自动化

也可以让远端裸仓库的 `post-receive` 钩子把上面几步包办。钩子在同步源码后继续跑 `npm install`（依赖有变动时）、`npm run build` 并重启服务。一个简化的钩子骨架：

```sh
#!/bin/sh
GIT_WORK_TREE=/home/CircleChat git checkout -f main
cd /home/CircleChat
[ -n "$(git diff --name-only HEAD@{1} HEAD -- package.json package-lock.json)" ] && npm install
npm run build
sudo systemctl restart circlechat
```

## 两个容易踩的坑

1. **构建与运行版本一致**：构建请用与服务运行时相同（或更高）的 Node 版本，`vite build` 需要 Node ≥ 20.19。用 22.5 跑服务、用 18 构建，前端产物可能在低版本 Node 上跑不起来。
2. **依赖锁文件被改写**：旧版 npm（如 9.x）会在 `npm install` 时改写 `package-lock.json`（例如删掉 `libc` 字段），使部署机的 `git pull` 因为工作区不干净而中止。建议升级 npm，或让部署目录只做 `git fetch` + `git reset --hard`（部署目录不应存在本地改动，所有改动走 `main` 推送）。

更多配置项（端口、上传保留、数据库路径、显示 / 请求地址分离）见[配置说明](configuration)。
