# 配置说明

CircleChat 的配置分为两部分：

1. **服务端环境变量**：监听端口、上传保留天数等。
2. **前端静态配置**：`public/js/config.js`，用于「显示地址」与「请求地址」分离。

## 服务端环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `8090` | 监听端口（`.output/server/index.mjs` 使用；容器内须设为容器端口，如 `8080`） |
| `FILE_TTL_DAYS` | `15` | 上传文件保留天数，到期清理 |
| `DB_FILE` | `data/chatplus.db` | SQLite 数据库文件路径 |

示例：

```bash
PORT=8080 FILE_TTL_DAYS=30 npm start
```

## 显示 / 请求地址分离

编辑 `public/js/config.js`（改后**无需重新构建**，刷新即可）：

```js
window.CHAT_CONFIG = {
  apiBase: '',     // 请求地址：所有 API 与 WebSocket 连接使用的前缀
  displayBase: ''  // 展示地址：页面展示 / 复制分享用的服务器地址
};
```

支持三种部署形态：

| 形态 | `apiBase` | `displayBase` |
| --- | --- | --- |
| 同源 | 留空 `''` | 留空 `''`（自动取当前页面地址） |
| 反代子路径 | `'/chat'` | 留空 |
| 跨域（前后端分离） | `'https://api.example.com'` | `'https://api.example.com'` 或实际展示域名 |

## 内置账号

- 首次启动若用户表为空，自动创建管理员 `admin` / `Admin1234`。
- 老库升级时自动补建 `admin`，且**不会覆盖任何已有密码**。

> 生产环境请尽快修改默认管理员密码。

## 运行时自动生成的数据

| 路径 | 说明 |
| --- | --- |
| `data/` | 运行期数据目录 |
| `data/chatplus.db` | SQLite 数据库（用户、消息、群组、处罚、审计等） |
| `data/access.log` | 应用层网络监控：所有 HTTP 请求与 WebSocket 连接日志 |
| `public/uploads/` | 上传的文件（受 `FILE_TTL_DAYS` 控制保留） |

## 内置安全限制（供参考）

- 密码 SHA256 加盐存储；会话用 HttpOnly Cookie（默认 7 天）。
- 同 IP 登录限速：5 次失败锁定 10 分钟。
- 上传类型白名单 + 图片魔数校验 + 路径穿越防护；单文件上限 **100MB**（服务端 `MAX_UPLOAD`，前端 `MAX_UPLOAD_SIZE`，两处须一致）。
- 分片上传每片 **5MB**；单条文本消息上限 **4096** 字符。
- 每个房间保留最近 **500** 条消息（`store.MAX_MESSAGES`）。

更多安全细节见[用户指南 · 账号安全](../guide/usage.md)。