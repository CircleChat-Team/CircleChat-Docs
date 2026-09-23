# 配置说明

CircleChat 的配置分两块：一块是**服务端环境变量**（端口、上传保留、数据库路径等），另一块是**前端静态配置** `public/js/config.js`（把「页面展示地址」和「真实请求地址」分开）。后端没有集中的配置文件——多数运行期常量直接写在源码里（见文末常量表），刻意不在代码里硬编码任何密钥。

## 服务端环境变量

启动服务（`npm start`，即 `node .output/server/index.mjs`）时通过环境变量注入。所有变量都有合理默认值，不设置也能直接跑。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `8090` | 监听端口。由 `package.json` 的 `start` 脚本注入，Nitro node-server 读取。容器内须设为容器实际监听的端口（如 `8080`），再用宿主端口映射出去 |
| `FILE_TTL_DAYS` | `15` | 上传文件在硬盘上的保留天数，到期清理。至少 1 天（`Math.max(1, ...)`） |
| `DB_FILE` | `data/chatplus.db` | SQLite 数据库文件路径（相对工作目录，或绝对路径） |
| `GITHUB_API_BASE` | `https://api.github.com` | GitHub API 基地址（消息里贴仓库卡片时用） |
| `GITHUB_BASE` | `https://github.com` | GitHub 网页基地址 |
| `GH_TOKEN` / `GITHUB_TOKEN` | 空 | GitHub 访问令牌，仅在服务端使用，用于拉取仓库信息（限流更高）。也可存在 `app_config.github.apiToken`，secret 永不下发前端 |

示例——把端口改成 8080、上传保留 30 天：

```bash
PORT=8080 FILE_TTL_DAYS=30 npm start
```

或写进 `.env` 由 shell 加载（部署脚本里常见）：

```bash
export PORT=8080
export FILE_TTL_DAYS=30
npm start
```

`CIRCLECHAT_APP_ID` / `APP_ID`、`APP_VERSION` 也会被读取（缺省回退到 `package.json` 的 name/version），主要用于桌面客户端的 `app-manifest`，一般不用动。

## 显示 / 请求地址分离

前端所有请求和 WebSocket 连接都拼 `apiBase` 前缀，页面上展示 / 复制分享的地址用 `displayBase`。两者在 `public/js/config.js` 里设置，**改完刷新页面即可生效，不需要重新构建**：

```js
window.CHAT_CONFIG = {
  apiBase: '',     // 请求地址：所有 API 与 WebSocket 连接使用的前缀
  displayBase: ''  // 展示地址：页面展示 / 复制分享用的服务器地址
};
```

这个文件由运维在部署时编辑，支撑三种部署形态：

| 形态 | `apiBase` | `displayBase` | 适用场景 |
| --- | --- | --- | --- |
| 同源 | 留空 `''` | 留空 `''`（自动取当前页面地址） | 最常见：前端与后端同一域名 / 端口 |
| 反代子路径 | `'/chat'` | 留空 | 后端挂在 Nginx 子路径下，前端也走该子路径 |
| 跨域（前后端分离） | `'https://api.example.com'` | `'https://api.example.com'` 或实际展示域名 | 前端静态资源与 API 服务不在同一域 |

WebSocket 地址固定同源 `/ws`（由 `chat.ts` 的 `wsUrl()` 拼 `apiBase` + `/ws`），所以跨域部署时浏览器仍按 `apiBase` 连 WS，务必在反代 / CORS 上放行。

## 内置账号

- 首次启动、用户表为空时，自动创建管理员 `admin` / `Admin1234`。
- 老库升级时只会**补建** `admin`，且**不会覆盖任何已有密码**；若用户已经改过默认密码，补建会跳过。
- 登录页会通过 `GET /api/setup` 探测内置管理员是否还在用默认密码，并给出提示。

生产环境不论用不用默认账号，都建议尽快改掉 `admin` 的密码（个人中心改密，或 `npm run adduser -- admin <新密码>`）。

## 运行时自动生成的数据

| 路径 | 说明 |
| --- | --- |
| `data/` | 运行期数据根目录，首次启动自动创建 |
| `data/chatplus.db` | SQLite 数据库：用户、消息、群组、好友、处罚、审计、公告、通知 |
| `data/access.log` | 应用层网络监控日志：所有 HTTP 请求与 WebSocket 连接，按 JSON 行追加并同步打印控制台 |
| `public/uploads/` | 上传的文件落盘目录，受 `FILE_TTL_DAYS` 控制保留；按内容 sha256 去重，同名内容只落盘一次 |

部署时应将 `data/` 和 `public/uploads/` 纳入备份（数据库为单文件，可直接拷贝，但拷贝前宜停服或确保无写入）。

## 运行时常量（供参考）

以下不是环境变量，而是写死在源码里的运行期常量，列出来方便预估容量与排查问题。一般不用改；要改得动源码，并在 `migrate.ts` 之外留意兼容性。

| 常量 | 值 | 位置 | 含义 |
| --- | --- | --- | --- |
| `SESSION_TTL` | 7 天 | `server/lib/auth.ts` | 会话 Cookie 有效期（`Max-Age=7*24*3600`），Cookie 名 `circlechat_token` |
| `MAX_FAILS` / `LOCK_MS` | 5 次 / 锁 10 分钟 | `server/lib/auth.ts` | 同 IP 登录失败限速 |
| `MAX_MESSAGES` | 500 条 / 房间 | `server/lib/store.ts` | 每个房间（群 / 私聊）只保留最近 500 条，`trimRoom` 裁剪 |
| `MAX_LOGS` / `MAX_DETAIL` | 5000 条 / 单条 300 字符 | `server/lib/audit.ts` | 审计日志容量与单条详情上限 |
| `MAX_UPLOAD` | 100 MB | `server/lib/runtime.ts` | 单文件上传上限 |
| `MAX_UPLOAD_BODY` | 100 MB + 1 MB | `server/lib/runtime.ts` | 请求体上限（含分片） |
| `MAX_TEXT_LEN` | 4096 字符 | `server/lib/runtime.ts` | 单条文本消息长度上限 |
| `CHUNK_SIZE` | 5 MB | `server/lib/runtime.ts` / `src/core/chat.ts` | 分片大小，前后端一致 |
| `MAX_CHUNKS` | `ceil(100MB/5MB)+1` | `server/lib/runtime.ts` | 分片数上限 |
| `FILE_CLEANUP_INTERVAL` | 6 小时 | `server/lib/runtime.ts` | 过期文件清理定时器周期 |
| 上传会话 TTL | 24 小时 | `server/lib/runtime.ts` | 分片上传临时数据保留时间（`purgeUploadTmp`） |
| `MAX_DAYS` | 3650 天 | `server/lib/moderate.ts` | 处罚时长上限 |
| `MAX_FRAME` | 2 MB | `server/lib/ws.ts` | WebSocket 单帧上限，防滥用 |
| 心跳 / 节流 | 30s ping / 2s typing 节流 / 5s shake 限频 | `src/core/chat.ts` / `server/lib/runtime.ts` | 实时通道节奏参数 |
| 密码强度 | ≥8 且含 数字 / 小写 / 大写 / 特殊符 | `server/lib/runtime.ts` | 注册与改密校验 |
| 用户名正则 | `[\w\u4e00-\u9fa5\-.]{2,20}` | `server/lib/runtime.ts` | 用户名允许字符与长度 |
| `UPLOAD_NAME_RE` | `^[a-zA-Z0-9]+\.[a-z0-9]{1,8}$` | `server/lib/runtime.ts` | 上传文件名格式（随机名，防路径穿越 / 去重判定用） |
| `SCHEMA_VERSION` | 9 | `server/lib/migrate.ts` | 数据库结构版本，启动时自动迁移补齐 |

## 内置安全限制

- 密码 SHA256 加盐存储（盐为 16 字节 hex：`盐$SHA256(盐+密码)`）；会话用 HttpOnly Cookie，默认 7 天。
- 同 IP 登录限速：连续失败 5 次锁 10 分钟。
- 上传不限文件类型，但图片按魔数嗅探（`sniffImage`），伪装成图片的非图片内容降级为 `.bin`；按内容 sha256 去重。
- 路径穿越双层防护：静态服务用 `path.normalize` + `startsWith(PUB)` 校验；消息 / 文件管理只认 `UPLOAD_NAME_RE` 随机名。
- 存储型 XSS 防护：`uploads/` 下非图片 / 视频 / 音频的文件强制 `application/octet-stream` + `attachment`；WebSocket 的 `file` / `image` 内容必须是 `/uploads/<hex>.<ext>` 合法路径，挡掉 `javascript:` 等伪造链接。
- 单文件上限 100MB（服务端 `MAX_UPLOAD`）；分片每片 5MB；单条文本消息上限 4096 字符；每房间保留最近 500 条消息。

更多安全与数据细节见[用户指南 · 账号安全](../guide/usage#账号安全)。
