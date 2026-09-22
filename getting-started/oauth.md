# GitHub 登录与仓库卡片

CircleChat 内置了 GitHub 相关的两块能力：一是**用 GitHub 账号登录 / 绑定**（OAuth），二是**消息里贴 GitHub 仓库链接自动生成仓库卡片**。两者都依赖服务端保留的 GitHub 凭据，令牌**只在服务端使用，永不下发前端**。

## 一、GitHub OAuth 登录

OAuth 凭据存在全局配置表 `app_config` 里（密钥字段 `github.apiToken` / OAuth 的 `client_secret` 不下发前端）。开关由是否配置了 `client_id` / `client_secret` 决定——没配置时登录页不显示 GitHub 入口。

### 在 GitHub 创建 OAuth App

1. 打开 GitHub → Settings → Developer settings → OAuth Apps → New OAuth App。
2. **Homepage URL** 填你的站点地址（如 `https://chat.example.com`）。
3. **Authorization callback URL** 填 `https://chat.example.com/api/oauth/github/callback`（注意路径必须是 `/api/oauth/github/callback`，与服务端 `github/callback` 路由一致）。
4. 创建后拿到 `Client ID` 和 `Client Secret`。

### 在管理后台配置

管理员进管理面板「OAuth」页签（对应 `GET/POST /api/admin/oauth`），填入：

- `clientId`：GitHub 的 Client ID。
- `clientSecret`：GitHub 的 Client Secret（仅服务端保存，接口不会回传明文 secret）。

保存后，登录页会出现 GitHub 登录入口。

### 用户侧流程

| 步骤 | 接口 | 说明 |
| --- | --- | --- |
| 看可用方式 | `GET /api/oauth/providers` | 返回当前启用了哪些第三方登录 |
| 发起授权 | `GET /api/oauth/github/start` | 302 跳转到 GitHub 授权页 |
| 回跳绑定 | `GET /api/oauth/github/callback` | GitHub 回跳，服务端换 token 并绑定当前账号 |
| 查绑定状态 | `GET /api/oauth/me` | 返回当前用户是否已绑定 GitHub |
| 解绑 | `POST /api/oauth/github/unbind` | 解除绑定 |

绑定后用户可用 GitHub 身份登录；解绑不影响原账号密码登录。

## 二、仓库卡片（消息内 GitHub 链接）

在聊天里贴 GitHub 仓库链接（如 `https://github.com/owner/repo`），前端识别后拉取并渲染仓库卡片：

- **基础卡片**：仓库主信息 + 最近一次提交。
- **详情**：贡献者 / 语言分布 / Release / 提交记录（单块失败互不影响，缺哪块显示缺哪块）。

服务端实现要点（见 `server/lib/github.ts`）：

- `owner/name` 经 `FULL_RE` 正则校验，防路径穿越注入。
- 访问令牌优先级：`GH_TOKEN` / `GITHUB_TOKEN` 环境变量，或 `app_config.github.apiToken`。令牌只在服务端，前端拿不到。
- 结果缓存 10 分钟；请求失败时缓存 1 分钟；遇到 GitHub 限流返回上次缓存（stale），保证可用性。

## 通过环境变量提供令牌

如果不想走管理面板，也可以直接给服务进程注入令牌环境变量（效果等同 `app_config.github.apiToken`）：

```bash
GH_TOKEN=ghp_xxx FILE_TTL_DAYS=15 npm start
```

这主要影响仓库卡片的信息拉取（更高限流额度），与 OAuth 登录的 `client_id` / `client_secret` 是两回事——OAuth 凭据仍需在管理面板配置。
