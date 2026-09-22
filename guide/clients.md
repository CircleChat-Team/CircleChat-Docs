# 客户端

CircleChat 是 Web 优先的应用，所有功能都通过网页提供。除了浏览器，还提供独立的桌面客户端；移动端则直接用手机浏览器访问（网页自带响应式布局）。下面按访问方式说明，相关鉴权与地址配置见 [配置说明](../getting-started/configuration.md)。

## 网页（浏览器）

直接在浏览器打开站点地址即可，无需安装。聊天、群组、管理后台全部在网页内完成。

- **响应式布局**：窄屏 / 手机上，左侧会话栏变成抽屉、设置收进侧栏面板；消息上下文菜单在触摸设备上改为「长按」触发（`MessageItem.vue` 用 `matchMedia('(pointer: coarse)')` 判定触摸设备）。
- **多语言**：zh / en / ja，选择记到 `localStorage`。
- **提示**：服务端升级后，浏览器务必硬刷新（`Ctrl+Shift+R`）清理缓存的静态资源。

## 桌面客户端

独立的桌面应用仓库：[CircleChat-Client](https://github.com/CircleChat-Team/CircleChat-Client/)。它基于 Electron / Tauri（或类似本地客户端壳）把网页包了一层，提供原生窗口、系统通知等体验。

### 怎么识别桌面客户端

桌面客户端的内置浏览器会在 **User-Agent** 里带上标识：

```
Mozilla/5.0 ... CircleChatDesktop/0.1.0
```

服务端（`server/lib/runtime.ts`）与前端（`src/utils/client.ts`）都按 UA 正则 `/CircleChatDesktop\/([\d.]+)/` 提取版本号。前端判断**优先用客户端注入的全局变量** `window.__CIRCLECHAT_CLIENT__`（含 `version` / `platform`），取不到才退化到 UA 正则——全局变量更可靠，不怕 UA 被改或伪造。平台（linux / macos / windows）由 UA 推断。

### 下载入口

登录页底部有一个「下载桌面客户端」横幅（`DownloadClient.vue`），链接指向上面的仓库发布页。注意：这个横幅**只在非桌面客户端环境显示**——已经在桌面客户端里打开了，自然不会再提示下载（组件内 `getDesktopClient() === null` 才渲染）。

### 桌面客户端如何对接你的服务器

桌面客户端本质是把网站加载进原生窗口，所以它连接的还是你部署的 CircleChat 服务，地址解析沿用 [配置说明 · 显示 / 请求地址分离](../getting-started/configuration.md#显示--请求地址分离) 的 `apiBase` / `displayBase`。

### 应用清单接口（/api/app-manifest）

桌面客户端（以及任何本地客户端）没有同源概念，因此服务端提供一个**对来源放开**的公开接口 `/api/app-manifest`：

- 跨域头 `Access-Control-Allow-Origin: *`，仅放行 `GET` / `OPTIONS`；**不下发凭据、不认 Cookie**，放在鉴权门槛之前（桌面客户端不带本站会话 Cookie，走不了登录态），放开来源不会扩大攻击面。
- 返回内容：

```json
{
  "app_id": "circlechat",
  "version": "1.2.3",
  "timestamp": 1789900000,
  "signature": "<sha256 hex>"
}
```

- 标识与版本来自 `readAppInfo()`：环境变量 `CIRCLECHAT_APP_ID` / `APP_ID` 优先，缺省读 `package.json` 的 `name` / `version`（版本随发布自动更新，不必在代码维护过期常量）。
- `timestamp` 是 Unix 秒级时间戳；`signature = SHA256(app_id + version + timestamp + APP_SECRET)`。签名密钥 `APP_SECRET` **只用于计算签名、绝不下发**，客户端可用它校验自己连的是预期的服务端，并对比版本（例如提示更新）。

给服务进程注入这几个环境变量即可自定义客户端标识：

```bash
CIRCLECHAT_APP_ID=mychat APP_VERSION=1.2.3 APP_SECRET=随机值 npm start
```

`APP_SECRET` 不设置时签名仍会计算（用空密钥兜底），但生产环境建议设一个随机值，避免清单被伪造。

## 移动端

目前没有独立的移动 App。在手机浏览器里直接访问站点地址即可，网页本身就是响应式的：会话列表收成抽屉、设置收进面板、长按消息弹出上下文菜单，功能与桌面端完全一致。

## 小结

| 客户端 | 形态 | 安装 | 备注 |
| --- | --- | --- | --- |
| 网页 | 浏览器 | 无需安装 | 主入口，全功能 |
| 桌面客户端 | Electron / Tauri 壳 | 从 CircleChat-Client 仓库下载 | UA 带 `CircleChatDesktop/<version>`；用 `/api/app-manifest` 做身份 / 版本校验 |
| 移动端 | 手机浏览器（响应式） | 无需安装 | 抽屉布局 + 长按菜单 |

更多客户端相关的安全考量见 [安全模型与加固](../guide/security.md)。
