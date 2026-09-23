# 客户端

CircleChat 是 Web 优先的应用，所有功能都通过网页提供。除了浏览器，还提供独立的桌面客户端；移动端则直接用手机浏览器访问（网页自带响应式布局）。下面按访问方式说明。

## 网页（浏览器）

直接在浏览器打开站点地址即可，无需安装。聊天、群组、管理后台全部在网页内完成。

- **响应式布局**：窄屏 / 手机上，左侧会话栏变成抽屉、设置收进侧栏面板；消息上下文菜单在触摸设备上改为「长按」触发（`MessageItem.vue` 用 `matchMedia('(pointer: coarse)')` 判定触摸设备）。
- **多语言**：zh / en / ja，选择记到 `localStorage`。
- **提示**：服务端升级后，浏览器务必硬刷新（`Ctrl+Shift+R`）清理缓存的静态资源。

## 桌面客户端（CircleChat-Client）

独立仓库：[CircleChat-Client](https://github.com/CircleChat-Team/CircleChat-Client/)。它是一个用 Rust 写的 WebView 外壳，把 CircleChat 网页端承载在一个原生窗口里。

### 架构与定位

- **纯 WebView 外壳，不捆绑浏览器引擎**：底层用 [wry](https://github.com/tauri-apps/wry) 承载系统原生 WebView——Linux 用 WebKitGTK、macOS 用 WKWebView、Windows 用 WebView2（`Cargo.toml` 里只引了 `wry` + `tao` 窗口层，没有引入 Tauri 整套框架）。因此安装包小、内存占用低。
- **原生配置窗口**：首次配置用 [iced](https://github.com/iced-rs/iced) 写的原生控件（非内嵌网页），关闭 wgpu、改用 `tiny-skia` 软件渲染，编译更快、兼容性更好。
- **桌面能力**：系统通知、文件下载落盘、站内外链接自动分流到系统默认程序。
- 当前客户端版本见 `Cargo.toml`（`version = "0.1.5"`），对外实际报的版本号会带上构建号：`0.1.5+<git short sha>`。

### 下载与安装

推荐从 [Releases](https://github.com/CircleChat-Team/CircleChat-Client/releases) 下载预编译安装包：

| 平台 | 安装包 | 安装方式 |
| --- | --- | --- |
| Linux | `.deb` | `sudo apt install ./circlechat-client_<版本>_amd64.deb` |
| Linux | `.rpm` | `sudo dnf install ./circlechat-client-<版本>-1.x86_64.rpm` |
| Linux | `.AppImage` | `chmod +x CircleChat-<版本>-x86_64.AppImage && ./CircleChat-<版本>-x86_64.AppImage` |
| macOS | `.dmg` | 挂载后把 `CircleChat.app` 拖进「应用程序」 |
| Windows | `.zip` | 解压后运行 `circlechat-client.exe` |

> 当前发布包**未签名**：macOS 首次打开会被 Gatekeeper 拦截（右键 → 打开）；Windows 可能弹 SmartScreen。正式分发前需在 CI 里加证书签名 / 公证。

### 配置与启动流程

客户端本质是把你的站点地址加载进原生窗口，所以第一次需要填入 CircleChat 服务地址，以及用于身份校验的共享密钥 `APP_SECRET`：

```bash
# 预编译二进制（路径按安装方式调整）
APP_SECRET='你的密钥' ./circlechat-client

# 或从源码运行
APP_SECRET='你的密钥' cargo run
```

启动流程（`src/main.rs` 编排，`src/site.rs` 负责校验）：

```
读本地配置 → 有地址？── 是 ──→ 打开 WebView
                    │
                    否
                    ↓
              弹出配置窗口（填地址）
                    ↓
              GET {地址}/api/app-manifest 校验站点身份
                    ↓
              通过 → 保存地址并进入 WebView
              失败 → 窗口提示「无效的站点」，不保存、不进入
```

- **首次启动**（配置里还没有地址）：弹出「CircleChat 配置」窗口 → 填地址、点「保存并进入」→ 客户端去拉 `{地址}/api/app-manifest` 校验身份，通过才写配置并打开 WebView，失败则提示「无效的站点」。
- **之后再启动**：配置里已有地址，直接打开 WebView，不再弹配置窗口。这种情况**可以不用传 `APP_SECRET`**（校验只发生在保存地址那一刻）。
- **回到配置窗口**：在 WebView 里按 `Ctrl+Shift+R`（macOS 为 `Cmd+Shift+R`）会清掉配置并重启客户端；或直接删掉配置文件再启动。

配置文件与数据目录：

| 平台 | 配置 | 数据目录 |
| --- | --- | --- |
| Linux | `~/.config/circlechat/config.json` | `~/.local/share/circlechat/` |
| macOS | `~/Library/Application Support/com.CircleChat.CircleChat/config.json` | 同上标准目录 |
| Windows | `%APPDATA%\CircleChat\CircleChat\config\config.json` | 同上标准目录 |

日志（配置路径、缓存目录、UA、下载、通知）打到 stdout，需要留档可 `2>&1 | tee run.log`。

### 站点身份校验（/api/app-manifest）

保存地址前，客户端会 `GET {地址}/api/app-manifest`，期望：

```json
{
  "app_id": "circlechat",
  "version": "1.0.0",
  "timestamp": 1700000000,
  "signature": "sha256(app_id+version+timestamp+SECRET)"
}
```

**服务端侧**（`server/lib/runtime.ts`）：该接口对来源放开（`Access-Control-Allow-Origin: *`，仅 `GET` / `OPTIONS`），不下发凭据、不认 Cookie，放在鉴权门槛之前。签名 `signature = SHA256(app_id + version + timestamp + APP_SECRET)`，`APP_SECRET` 只用于签名、绝不下发。标识与版本来自 `readAppInfo()`：环境变量 `CIRCLECHAT_APP_ID` / `APP_ID` 优先，缺省读 `package.json` 的 `name` / `version`。**`APP_SECRET` 未配置时接口直接返回 503，不下发任何可被伪造的清单。**

**客户端侧**三项全部通过才允许保存（`src/site.rs`）：

1. `app_id` 默认要求为 `circlechat`，可用环境变量 `CIRCLECHAT_APP_ID` 覆盖——**客户端与服务端必须配置成同一个值**，签名才对得上。
2. `signature == sha256(app_id + version + timestamp + SECRET)` 的小写 hex（大小写不敏感，允许 `sha256=` / `sha256:` 前缀）。
3. `|本地时间 - timestamp| <= 300` 秒（防重放）。

> `SECRET` 即环境变量 `APP_SECRET`：**客户端与服务端必须设为同一个值**，服务端用它签名、客户端用它验签。校验结果缓存在内存里（成功和失败都缓存），所以服务端修好之后需要让用户重启客户端才能重新校验。

### 客户端暴露给网页的接口

**判断自己跑在客户端里**（`src/identity.rs` 注入，先于页面脚本、所有路由/刷新都在，**只在主 frame**，iframe 无）：

```ts
const isDesktop = !!window.__CIRCLECHAT_CLIENT__
// { name: 'circlechat-desktop', version: '0.1.5+abc1234', platform: 'linux' | 'macos' | 'windows' }
```

这也对应服务端/前端对客户端的其他识别方式：登录页「下载桌面客户端」横幅（`DownloadClient.vue`）只在 `getDesktopClient() === null` 时显示；`src/utils/client.ts` 优先读这个全局变量，取不到才退化到 UA 正则 `/CircleChatDesktop\/([\d.]+)/`。

**发系统通知**（`src/notification.rs`，经 `window.__CIRCLECHAT__.notify`）：

```ts
const result = await window.__CIRCLECHAT__.notify({ title: '新消息', body: '张三：在吗？' })
// { ok: true, error: null } 或 { ok: false, error: '<原因>' }
```

`error` 可能是系统通知服务的报错（Linux 无通知守护进程、macOS 权限被拒…），也可能是 `ipc-unavailable`（不在客户端里，如浏览器调试）或 `timeout`（10 秒内没结果）。标题上限 120 字符、正文 500 字符，超出截断。

**另外两个标记**（只用于功能分支，**不能做信任判定**，普通浏览器可原样伪造）：

| 机制 | 覆盖 | 范围 |
| --- | --- | --- |
| User-Agent 里的 `CircleChatDesktop/<版本>` | 服务端 + 前端 | **所有请求**（子资源 / XHR / WebSocket 握手） |
| `X-CircleChat-Client: <版本>` 请求头 | 服务端 | **仅入口文档那一次请求** |

后续接口请求要带标记，前端自己在拦截器里加即可：

```ts
axios.interceptors.request.use(cfg => {
  if (window.__CIRCLECHAT_CLIENT__) cfg.headers['X-CircleChat-Client'] = window.__CIRCLECHAT_CLIENT__.version
  return cfg
})
```

要服务端能信任，得用 `APP_SECRET` 签名换 token，而不是这几个标记。

### 缓存与其它行为

- **入口文档每次都重新请求**（带 `Cache-Control: no-cache, no-store`），前端发版立刻生效。
- **其它资源**（图片、字体、媒体、附件）按服务端响应头走 WebView 的磁盘缓存。wry 默认是临时上下文、什么都不留，客户端显式指定了一个持久化目录。
- **下载**落到系统下载目录，重名自动加 ` (1)`、` (2)`。
- **站外链接**（origin 不同，含子域、换协议）交给系统默认程序打开，不在 WebView 里开；`window.open` / `target="_blank"` 的站内链接在当前 WebView 打开，不弹新窗。
- 清缓存：删掉数据目录里的 `webview/` 即可。

### 从源码构建

需要 Rust **1.89+**。

```bash
cargo build --release
```

Linux 还需系统库：`libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libdbus-1-dev libxkbcommon-dev`。macOS / Windows 走系统原生 WebView，无需额外依赖。

相关环境变量：

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `APP_SECRET` | **是**（首次配置时） | 站点身份校验共享密钥，客户端与服务端必须一致 |
| `CIRCLECHAT_USER_AGENT` | 否 | 整体覆盖 UA（内置 UA 写死了浏览器版本号，将来变旧时用它兜底） |
| `CIRCLECHAT_URL` | 否 | 直接指定要加载的地址，跳过配置窗口（调试用） |
| `CIRCLECHAT_BUILD` | 否 | 把 git short sha 编进二进制，本地构建时 `build.rs` 会自己去问 git |

## 移动端

目前没有独立的移动 App。在手机浏览器里直接访问站点地址即可，网页本身就是响应式的：会话列表收成抽屉、设置收进面板、长按消息弹出上下文菜单，功能与桌面端完全一致。

## 小结

| 客户端 | 形态 | 安装 | 备注 |
| --- | --- | --- | --- |
| 网页 | 浏览器 | 无需安装 | 主入口，全功能 |
| 桌面客户端 | Rust + wry WebView 外壳（CircleChat-Client） | 从 Releases 下载 | 不绑 Chromium；用 `APP_SECRET` 签名 + `/api/app-manifest` 做站点身份校验；暴露 `__CIRCLECHAT_CLIENT__` 与 `notify` 接口 |
| 移动端 | 手机浏览器（响应式） | 无需安装 | 抽屉布局 + 长按菜单 |

服务端侧的 `APP_SECRET` / `CIRCLECHAT_APP_ID` / `APP_VERSION` 配置见 [配置说明](../getting-started/configuration.md)；更多安全相关说明见 [安全模型与加固](../guide/security.md)。
