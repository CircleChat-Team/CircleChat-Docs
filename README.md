# CircleChat 项目简介

CircleChat 是一款**自托管的轻量多人聊天服务器**。单进程部署，支持群组 / 私聊，内置好友关系、开放注册审核、在线状态、消息撤回、表情回应、举报处罚与审计日志。服务端**零第三方运行时依赖**（仅依赖 Node.js 内建能力与 `node:sqlite`）。基于 [GPL-3.0](https://github.com/CircleChat-Team/CircleChat/blob/main/LICENSE) 开源。

## 定位与特点

- **自托管**：一套服务即可跑起完整聊天站，适合公益 / 私有服务器。
- **零第三方运行时依赖**：后端没有用到任何第三方 npm 运行时依赖，易于审查与审计。
- **性能**：页面加载目标在 1 秒内，单进程设计，内存占用低。
- **多语言**：界面支持 zh / en / ja 三语。
- **可观测**：所有 HTTP 请求与 WebSocket 连接写入 `data/access.log`（应用层网络监控）。
- **轻前端**：Vue 3 + TypeScript + Tailwind 4，构建产物由服务端内部静态服务托管。

## 核心能力一览

| 类别 | 能力 |
| --- | --- |
| 通讯 | 群组聊天、好友私聊、在线状态、正在输入、表情回应、引用回复、消息撤回 |
| 文件 | 单次上传 / 分片断点续传、图片 / 音频 / 视频 / 文件 / 合并转发，图片魔数校验 |
| 治理 | 开放注册 + 管理员审核、举报、禁言 / 封禁 / IP 封禁、处罚通知、审计日志 |
| 账号 | 邮箱注册、会话 Cookie、两步验证（TOTP）、修改密码 |
| 信箱 | 系统公告（全局广播）、个人通知（按用户分发，如处罚结果） |
| 管理 | 用户管理、注册审核、举报处理、处罚、文件管理、操作日志 |

## 技术栈

- **后端**：Node.js（Nitro 运行时），后端逻辑集中在 `server/lib/`（原 `server.js` + `lib/` 的 1:1 迁移）。
- **数据**：SQLite（`node:sqlite`，Node ≥ 22.5 内建），数据库文件 `data/chatplus.db`。
- **前端**：Vue 3 + TypeScript，构建工具 Vite，样式 Tailwind 4。
- **实时**：自研 WebSocket 协议（零第三方依赖，自实现握手 / 帧编解码 / 分片 / 掩码 / Ping-Pong）。

## 依赖要求

- **Node.js ≥ 22.5**（使用内建 `node:sqlite`，低版本启动会崩溃；`vite build` 需 Node ≥ 20.19）

## 文档结构

- [快速开始](getting-started/quickstart.md)：最短路径跑起来。
- [生产部署](getting-started/installation.md)：Nginx / 容器 / 更新服务器。
- [配置说明](getting-started/configuration.md)：端口、上传保留、地址分离与内置账号。
- [GitHub 登录与仓库卡片](getting-started/oauth.md)：OAuth 登录配置与消息内仓库卡片。
- [用户指南](guide/usage.md)：普通用户功能手册。
- [管理后台](guide/administration.md)：管理员功能手册。
- [消息格式与富文本](guide/markdown.md)：Markdown / 代码高亮 / 公式 / Mermaid 速查。
- [安全模型与加固](guide/security.md)：凭证、上传防护与部署加固建议。
- [客户端](guide/clients.md)：网页 / 桌面客户端（CircleChatDesktop）/ 移动端的访问方式与 app-manifest。
- [常见问题与排错](guide/faq.md)：部署与使用的常见问答。
- [API 参考](api/overview.md)：HTTP 接口与 WebSocket 协议全量说明。

## 许可

本项目以 [GNU GPL v3.0](https://github.com/CircleChat-Team/CircleChat/blob/main/LICENSE) 开源。使用、复制、修改与分发请遵守 GPL-3.0 条款；再分发时须附带本许可证并保留许可声明。本项目按「原样」提供，不提供任何担保。