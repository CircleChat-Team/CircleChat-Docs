# 安全模型与加固建议

CircleChat 将安全能力内建于服务端，不依赖前端自判。部署加固要点见下文。所有运行期常量见 [配置说明 · 内置安全限制](../getting-started/configuration#内置安全限制)。

## 身份与凭证

- **密码存储**：SHA256 加盐，格式为 `盐$SHA256(盐+密码)`，盐是 16 字节 hex。明文密码不在任何地方落盘。
- **会话**：登录后下发 HttpOnly Cookie `circlechat_token`，有效期 `SESSION_TTL = 7` 天。Cookie 是 HttpOnly，前端 JS 读不到，能挡住大部分 XSS 偷 token 的路径。会话状态在内存里，进程重启即失效，已登录用户需要重新登录。
- **登录限速**：同 IP 连续失败 **5 次**锁 **10 分钟**（`MAX_FAILS` / `LOCK_MS`），期间返回 `429`。这是按 IP 记的内存计数器，重启清空。
- **两步验证（TOTP）**：账号可开启基于 HMAC-SHA1、6 位、30 秒步长、±1 步偏移的 TOTP。开启后登录分两步（拿挑战码 → 校验动态码），挑战码 5 分钟有效。

## 上传与文件

- **类型白名单 + 图片魔数嗅探**（`sniffImage`）：上传不限类型，但图片按字节特征校验；伪装成图片的非图片内容会被降级存成 `.bin`。
- **路径穿越防护（双层）**：静态服务用 `path.normalize` + `startsWith(PUB)` 校验；消息 / 文件管理只认 `UPLOAD_NAME_RE`（`^[a-zA-Z0-9]+\.[a-z0-9]{1,8}$`）随机名，管理员删文件再比对 `path.basename`。
- **存储型 XSS 防护**：`uploads/` 下非图片 / 视频 / 音频的文件强制 `application/octet-stream` + `attachment`，浏览器不会当成 HTML 执行；WebSocket 的 `file` / `image` 内容必须是 `/uploads/<hex>.<ext>` 合法路径，挡掉 `javascript:` 等伪造链接。
- **体积限制**：单文件 100MB、分片 5MB、单条文本 4096 字符，超了直接 `413`。
- **去重**：相同内容按 sha256 去重，只落盘一次，减少滥用空间。

## 治理与可追溯

- **处罚**：禁言 / 封禁 / IP 封禁由服务端 `moderate.blockFor` 计算，发消息 / 建连时拦截并推 `penalty` 帧，前端禁用输入——不是前端自判，绕不过。
- **审计日志**：登录、发消息、上传、处罚、举报等操作写入审计表（容量 5000 条，单条详情 300 字符），管理后台可按动作 / 操作人 / 目标过滤（见 [管理后台 · 操作日志](../guide/administration#操作日志)）。
- **访问日志**：所有 HTTP 请求与 WebSocket 连接以 JSON 行写入 `data/access.log`，附带来源 IP，便于外部监控。

## 部署加固建议

1. **务必上 HTTPS**：生产环境放在 Nginx 等反代后启用 TLS，不要在公网裸跑 HTTP。Cookie 走 HTTPS 才不会被中间人截。
2. **改掉默认管理员密码**：首次启动的 `admin / Admin1234` 仅用于初始化服务，上线前必须改掉（个人中心改密，或 `npm run adduser -- admin <新密码>`）。
3. **WebSocket 头透传**：反代务必透传 `Upgrade` / `Connection`，否则实时能力失效（见 [生产部署](../getting-started/installation#反向代理nginx--https)）。
4. **限制数据库与上传目录权限**：`data/` 和 `public/uploads/` 只给运行进程读写，定期备份 `data/chatplus.db`（单文件，停服或静止时拷）。
5. **及时更新 Node**：`node:sqlite` 等内建能力随 Node 版本修复，保持 ≥ 22.5 并跟进安全更新。
6. **GitHub 令牌别泄露**：GitHub OAuth / 仓库卡片用的令牌只在服务端（`GH_TOKEN` / `app_config.github.apiToken`），`secret` 永不下发前端。
7. **按需关闭开放注册**：如果不希望陌生人注册，关掉开放注册、由管理员用 `adduser` 建号，能显著降低治理压力。
