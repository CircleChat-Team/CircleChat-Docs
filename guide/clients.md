# 客户端

CircleChat 是 Web 优先的应用，所有功能都通过网页提供。除了浏览器，还提供独立的桌面客户端；移动端则直接用手机浏览器访问（网页自带响应式布局）。下面按访问方式说明。

## 一、总览：Web 优先，多种访问方式

CircleChat 的客户端形态可以分成三类：

1. **网页（浏览器）**：这是主入口。直接在浏览器打开站点地址即可，无需安装。聊天、群组、管理后台全部在网页内完成。
2. **桌面客户端（CircleChat-Client）**：独立仓库，是一个用 Rust 写的 WebView 外壳，把 CircleChat 网页端承载在一个原生窗口里。
3. **移动端**：目前没有独立的移动 App。在手机浏览器里直接访问站点地址即可，网页本身就是响应式的。

这三类形态的共同点是：核心功能都通过网页提供。桌面客户端并不是另起一套业务逻辑，而是把网页端放进原生窗口；移动端也不是独立 App，而是使用手机浏览器访问同一套网页。

因此，理解 CircleChat 客户端的关键在于：

- 网页是主入口，全功能；
- 桌面客户端是 WebView 外壳，提供桌面能力；
- 移动端是响应式网页，提供与桌面端一致的功能；
- 服务端升级后，浏览器务必硬刷新；
- 桌面客户端首次配置需要服务地址和 `APP_SECRET`；
- 桌面客户端通过 `/api/app-manifest` 做站点身份校验；
- 桌面客户端暴露 `__CIRCLECHAT_CLIENT__` 与 `notify` 接口；
- 桌面客户端的其他标记不能做信任判定。

下面按访问方式逐项展开。

## 二、网页（浏览器）

### 1. 直接在浏览器打开站点地址

网页端的使用方式最简单：直接在浏览器打开站点地址即可，无需安装。

这意味着：

- 你不需要下载安装包；
- 你不需要配置本地客户端；
- 你不需要额外运行程序；
- 你只需要一个浏览器和站点地址；
- 聊天、群组、管理后台全部在网页内完成。

对于大多数用户来说，网页端就是最直接的入口。无论你使用的是桌面浏览器还是手机浏览器，只要打开站点地址，就可以进入 CircleChat。

### 2. 全功能在网页内完成

原文明确：聊天、群组、管理后台全部在网页内完成。

这句话说明网页端不是“简化版”，而是完整入口。你可以在网页里：

- 聊天；
- 使用群组；
- 进入管理后台；
- 完成与这些功能相关的操作。

因此，如果你只需要使用 CircleChat，网页端已经足够。桌面客户端和移动端并不是必须的；它们只是不同的访问方式。

### 3. 响应式布局

网页自带响应式布局。在窄屏 / 手机上：

- 左侧会话栏变成抽屉；
- 设置收进侧栏面板；
- 消息上下文菜单在触摸设备上改为「长按」触发。

原文还特别说明：`MessageItem.vue` 用 `matchMedia('(pointer: coarse)')` 判定触摸设备。

这意味着，CircleChat 网页会根据屏幕宽度和输入设备类型调整界面：

- 屏幕较窄时，原本的左侧会话栏不会一直占位，而是变成抽屉；
- 设置不会一直展开，而是收进侧栏面板；
- 在触摸设备上，消息上下文菜单不再依赖鼠标右键，而是通过长按触发。

这样做的目的是让手机浏览器访问时也能有合适的布局和交互。你不需要安装移动 App，也能使用与桌面端一致的功能。

### 4. 消息上下文菜单与触摸设备

在桌面浏览器上，消息上下文菜单通常可以通过右键触发。在触摸设备上，网页会改为「长按」触发。

原文说明判定方式是：

```text
MessageItem.vue 用 matchMedia('(pointer: coarse)') 判定触摸设备
```

这意味着，网页会检测当前设备是否属于“粗指针”设备，也就是触摸输入为主的设备。如果是，就采用长按触发上下文菜单；如果不是，则保持常规交互。

对于用户来说：

- 在手机上，长按消息可以弹出上下文菜单；
- 在桌面浏览器上，右键 / 长按的交互按浏览器和网页实现为准；
- 响应式布局会让窄屏下的会话栏和设置面板更适配手机。

### 5. 多语言

网页支持多语言：zh / en / ja。

原文说明：选择记到 `localStorage`。

这意味着：

- 你可以在网页中切换中文、英文、日文；
- 你的语言选择会保存在 `localStorage`；
- 下次访问时，网页可以读取该选择；
- 多语言选择是浏览器本地记录，不依赖安装客户端。

对于普通用户来说，切换语言后，界面文案会按所选语言展示。对于贡献者来说，新增 i18n 文案时，zh / en / ja 三种语言都要补齐。

### 6. 服务端升级后的硬刷新

原文提示：服务端升级后，浏览器务必硬刷新（`Ctrl+Shift+R`）清理缓存的静态资源。

这意味着：

- 服务端升级后，浏览器可能仍然缓存了旧的静态资源；
- 普通刷新可能不足以清理这些缓存；
- 硬刷新可以清理缓存；
- Windows / Linux 常用快捷键是 `Ctrl+Shift+R`；
- macOS 上通常使用 `Cmd+Shift+R`。

如果你在服务端升级后发现页面行为异常、样式不对、功能没有更新，第一步可以尝试硬刷新。这样可以避免因为旧缓存导致的显示问题。

### 7. 网页端使用检查清单

使用网页端时，可以检查：

- 是否直接打开了站点地址？
- 是否无需安装即可使用？
- 聊天、群组、管理后台是否都在网页内完成？
- 窄屏 / 手机上，左侧会话栏是否变成抽屉？
- 设置是否收进侧栏面板？
- 触摸设备上，消息上下文菜单是否用长按触发？
- 多语言是否支持 zh / en / ja？
- 语言选择是否记到 `localStorage`？
- 服务端升级后，是否硬刷新清理缓存？
- 是否知道 `Ctrl+Shift+R` 的作用？

## 三、桌面客户端（CircleChat-Client）

桌面客户端是独立仓库：

[CircleChat-Client](https://github.com/CircleChat-Team/CircleChat-Client/)

它是一个用 Rust 写的 WebView 外壳，把 CircleChat 网页端承载在一个原生窗口里。

### 1. 架构与定位

#### 纯 WebView 外壳，不捆绑浏览器引擎

原文说明：

- 底层用 [wry](https://github.com/tauri-apps/wry) 承载系统原生 WebView；
- Linux 用 WebKitGTK；
- macOS 用 WKWebView；
- Windows 用 WebView2；
- `Cargo.toml` 里只引了 `wry` + `tao` 窗口层，没有引入 Tauri 整套框架。

因此，桌面客户端的定位是：

- 纯 WebView 外壳；
- 不捆绑浏览器引擎；
- 使用系统原生 WebView；
- 安装包小；
- 内存占用低。

这意味着，桌面客户端不会自带一整个 Chromium。它依赖系统已有的 WebView 组件。这样做的结果是安装包更小、内存占用更低，同时仍然能够承载 CircleChat 网页端。

对于用户来说，你看到的是一个原生窗口，但里面运行的是 CircleChat 网页端。对于开发者来说，桌面客户端主要负责窗口、配置、系统能力和与网页的桥接，而不是重新实现聊天功能。

#### 原生配置窗口

原文说明：

- 首次配置用 [iced](https://github.com/iced-rs/iced) 写的原生控件；
- 非内嵌网页；
- 关闭 wgpu；
- 改用 `tiny-skia` 软件渲染；
- 编译更快；
- 兼容性更好。

这意味着，桌面客户端第一次需要配置时，弹出的配置窗口不是网页，而是原生控件。它使用 iced 编写，并采用 `tiny-skia` 软件渲染，而不是 wgpu。这样做的目标是编译更快、兼容性更好。

对于用户来说，首次启动时看到的配置窗口是一个原生窗口，你可以在里面填写服务地址。对于开发者来说，这部分逻辑是桌面客户端自身的一部分，不依赖网页。

#### 桌面能力

桌面客户端提供：

- 系统通知；
- 文件下载落盘；
- 站内外链接自动分流到系统默认程序。

这些能力是桌面客户端相对于纯网页的补充。例如：

- 系统通知：可以通过 `window.__CIRCLECHAT__.notify` 发送；
- 文件下载落盘：下载文件会落到系统下载目录；
- 站内外链接自动分流：站外链接交给系统默认程序打开，站内链接按规则在当前 WebView 打开。

#### 版本号

当前客户端版本见 `Cargo.toml`：

```text
version = "0.1.5"
```

对外实际报的版本号会带上构建号：

```text
0.1.5+<git short sha>
```

这意味着，客户端对外报出的版本不只是 `0.1.5`，还会带上构建号。例如，如果 git short sha 是 `abc1234`，对外版本可能是 `0.1.5+abc1234`。这有助于区分同一版本号下的不同构建。

### 2. 下载与安装

推荐从 [Releases](https://github.com/CircleChat-Team/CircleChat-Client/releases) 下载预编译安装包。

| 平台 | 安装包 | 安装方式 |
| --- | --- | --- |
| Linux | `.deb` | `sudo apt install ./circlechat-client_<版本>_amd64.deb` |
| Linux | `.rpm` | `sudo dnf install ./circlechat-client-<版本>-1.x86_64.rpm` |
| Linux | `.AppImage` | `chmod +x CircleChat-<版本>-x86_64.AppImage && ./CircleChat-<版本>-x86_64.AppImage` |
| macOS | `.dmg` | 挂载后把 `CircleChat.app` 拖进「应用程序」 |
| Windows | `.zip` | 解压后运行 `circlechat-client.exe` |

#### Linux `.deb`

安装方式：

```bash
sudo apt install ./circlechat-client_<版本>_amd64.deb
```

适合 Debian / Ubuntu 等使用 apt 的系统。

#### Linux `.rpm`

安装方式：

```bash
sudo dnf install ./circlechat-client-<版本>-1.x86_64.rpm
```

适合使用 dnf 的系统。

#### Linux `.AppImage`

使用方式：

```bash
chmod +x CircleChat-<版本>-x86_64.AppImage && ./CircleChat-<版本>-x86_64.AppImage
```

AppImage 不需要安装，赋予可执行权限后直接运行即可。

#### macOS `.dmg`

挂载后把 `CircleChat.app` 拖进「应用程序」。

#### Windows `.zip`

解压后运行：

```text
circlechat-client.exe
```

### 3. 当前发布包未签名

原文说明：

> 当前发布包**未签名**：macOS 首次打开会被 Gatekeeper 拦截（右键 → 打开）；Windows 可能弹 SmartScreen。正式分发前需在 CI 里加证书签名 / 公证。

这意味着：

- 当前发布包没有签名；
- macOS 首次打开可能被 Gatekeeper 拦截；
- macOS 上可以通过右键 → 打开；
- Windows 上可能弹出 SmartScreen；
- 正式分发前需要在 CI 里加证书签名 / 公证。

对于用户来说，遇到这些提示时，应理解这是未签名发布包导致的。对于维护者来说，正式分发前需要处理签名和公证。

### 4. 配置与启动流程

客户端本质是把你的站点地址加载进原生窗口，所以第一次需要填入 CircleChat 服务地址，以及用于身份校验的共享密钥 `APP_SECRET`。

命令示例：

```bash
# 预编译二进制（路径按安装方式调整）
APP_SECRET='你的密钥' ./circlechat-client

# 或从源码运行
APP_SECRET='你的密钥' cargo run
```

#### 启动流程

原文给出流程图：

```text
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

可以拆解为：

1. 读本地配置；
2. 如果已有地址，直接打开 WebView；
3. 如果没有地址，弹出配置窗口，要求填写地址；
4. 填写后，客户端去请求 `{地址}/api/app-manifest` 校验站点身份；
5. 校验通过，保存地址并进入 WebView；
6. 校验失败，窗口提示「无效的站点」，不保存、不进入。

#### 首次启动

首次启动时，配置里还没有地址。流程是：

- 弹出「CircleChat 配置」窗口；
- 填地址；
- 点「保存并进入」；
- 客户端去拉 `{地址}/api/app-manifest` 校验身份；
- 通过才写配置并打开 WebView；
- 失败则提示「无效的站点」。

#### 之后再启动

之后再启动时，配置里已有地址，直接打开 WebView，不再弹配置窗口。

这种情况可以不用传 `APP_SECRET`，因为校验只发生在保存地址那一刻。

#### 回到配置窗口

在 WebView 里按 `Ctrl+Shift+R`（macOS 为 `Cmd+Shift+R`）会清掉配置并重启客户端；或直接删掉配置文件再启动。

#### 配置文件与数据目录

| 平台 | 配置 | 数据目录 |
| --- | --- | --- |
| Linux | `~/.config/circlechat/config.json` | `~/.local/share/circlechat/` |
| macOS | `~/Library/Application Support/com.CircleChat.CircleChat/config.json` | 同上标准目录 |
| Windows | `%APPDATA%\CircleChat\CircleChat\config\config.json` | 同上标准目录 |

#### 日志

日志（配置路径、缓存目录、UA、下载、通知）打到 stdout，需要留档可：

```bash
2>&1 | tee run.log
```

### 5. 站点身份校验（/api/app-manifest）

保存地址前，客户端会：

```text
GET {地址}/api/app-manifest
```

期望返回：

```json
{
  "app_id": "circlechat",
  "version": "1.0.0",
  "timestamp": 1700000000,
  "signature": "sha256(app_id+version+timestamp+SECRET)"
}
```

#### 服务端侧

原文说明：

- 服务端侧在 `server/lib/runtime.ts`；
- 该接口对来源放开；
- `Access-Control-Allow-Origin: *`；
- 仅 `GET` / `OPTIONS`；
- 不下发凭据；
- 不认 Cookie；
- 放在鉴权门槛之前；
- 签名 `signature = SHA256(app_id + version + timestamp + APP_SECRET)`；
- `APP_SECRET` 只用于签名、绝不下发；
- 标识与版本来自 `readAppInfo()`；
- 环境变量 `CIRCLECHAT_APP_ID` / `APP_ID` 优先；
- 缺省读 `package.json` 的 `name` / `version`；
- `APP_SECRET` 未配置时接口直接返回 503，不下发任何可被伪造的清单。

#### 客户端侧三项

客户端侧三项全部通过才允许保存（`src/site.rs`）：

1. `app_id` 默认要求为 `circlechat`，可用环境变量 `CIRCLECHAT_APP_ID` 覆盖——客户端与服务端必须配置成同一个值，签名才对得上。
2. `signature == sha256(app_id + version + timestamp + SECRET)` 的小写 hex（大小写不敏感，允许 `sha256=` / `sha256:` 前缀）。
3. `|本地时间 - timestamp| <= 300` 秒（防重放）。

#### SECRET 与缓存

`SECRET` 即环境变量 `APP_SECRET`：

- 客户端与服务端必须设为同一个值；
- 服务端用它签名；
- 客户端用它验签。

校验结果缓存在内存里（成功和失败都缓存），所以服务端修好之后需要让用户重启客户端才能重新校验。

### 6. 客户端暴露给网页的接口

#### 判断自己跑在客户端里

`src/identity.rs` 注入，先于页面脚本、所有路由 / 刷新都在，只在主 frame，iframe 无：

```ts
const isDesktop = !!window.__CIRCLECHAT_CLIENT__
// { name: 'circlechat-desktop', version: '0.1.5+abc1234', platform: 'linux' | 'macos' | 'windows' }
```

这也对应服务端 / 前端对客户端的其他识别方式：

- 登录页「下载桌面客户端」横幅（`DownloadClient.vue`）只在 `getDesktopClient() === null` 时显示；
- `src/utils/client.ts` 优先读这个全局变量；
- 取不到才退化到 UA 正则 `/CircleChatDesktop\/([\d.]+)/`。

#### 发系统通知

`src/notification.rs`，经 `window.__CIRCLECHAT__.notify`：

```ts
const result = await window.__CIRCLECHAT__.notify({ title: '新消息', body: '张三：在吗？' })
// { ok: true, error: null } 或 { ok: false, error: '<原因>' }
```

`error` 可能是：

- 系统通知服务的报错（Linux 无通知守护进程、macOS 权限被拒…）；
- `ipc-unavailable`（不在客户端里，如浏览器调试）；
- `timeout`（10 秒内没结果）。

标题上限 120 字符、正文 500 字符，超出截断。

#### 另外两个标记

另外两个标记只用于功能分支，**不能做信任判定**，普通浏览器可原样伪造：

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

### 7. 缓存与其它行为

- **入口文档每次都重新请求**（带 `Cache-Control: no-cache, no-store`），前端发版立刻生效。
- **其它资源**（图片、字体、媒体、附件）按服务端响应头走 WebView 的磁盘缓存。
- wry 默认是临时上下文、什么都不留，客户端显式指定了一个持久化目录。
- **下载**落到系统下载目录，重名自动加 ` (1)`、` (2)`。
- **站外链接**（origin 不同，含子域、换协议）交给系统默认程序打开，不在 WebView 里开。
- `window.open` / `target="_blank"` 的站内链接在当前 WebView 打开，不弹新窗。
- 清缓存：删掉数据目录里的 `webview/` 即可。

### 8. 从源码构建

需要 Rust **1.89+**。

```bash
cargo build --release
```

Linux 还需系统库：

```text
libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libdbus-1-dev libxkbcommon-dev
```

macOS / Windows 走系统原生 WebView，无需额外依赖。

相关环境变量：

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `APP_SECRET` | **是**（首次配置时） | 站点身份校验共享密钥，客户端与服务端必须一致 |
| `CIRCLECHAT_USER_AGENT` | 否 | 整体覆盖 UA（内置 UA 写死了浏览器版本号，将来变旧时用它兜底） |
| `CIRCLECHAT_URL` | 否 | 直接指定要加载的地址，跳过配置窗口（调试用） |
| `CIRCLECHAT_BUILD` | 否 | 把 git short sha 编进二进制，本地构建时 `build.rs` 会自己去问 git |

## 四、移动端

目前没有独立的移动 App。在手机浏览器里直接访问站点地址即可。

网页本身就是响应式的：

- 会话列表收成抽屉；
- 设置收进面板；
- 长按消息弹出上下文菜单；
- 功能与桌面端完全一致。

这意味着，你不需要安装移动 App，也不需要单独的移动客户端。只要用手机浏览器打开站点地址，就能使用 CircleChat。响应式布局会自动适配窄屏和触摸交互。

## 五、客户端形态小结

| 客户端 | 形态 | 安装 | 备注 |
| --- | --- | --- | --- |
| 网页 | 浏览器 | 无需安装 | 主入口，全功能 |
| 桌面客户端 | Rust + wry WebView 外壳（CircleChat-Client） | 从 Releases 下载 | 不绑 Chromium；用 `APP_SECRET` 签名 + `/api/app-manifest` 做站点身份校验；暴露 `__CIRCLECHAT_CLIENT__` 与 `notify` 接口 |
| 移动端 | 手机浏览器（响应式） | 无需安装 | 抽屉布局 + 长按菜单 |

服务端侧的 `APP_SECRET` / `CIRCLECHAT_APP_ID` / `APP_VERSION` 配置见 [配置说明](../getting-started/configuration.md)；更多安全相关说明见 [安全模型与加固](../guide/security.md)。

## 六、常见问题

### 1. CircleChat 是 Web 优先的应用吗？

是。CircleChat 是 Web 优先的应用，所有功能都通过网页提供。

### 2. 除了浏览器，还有什么客户端？

还提供独立的桌面客户端。移动端则直接用手机浏览器访问，网页自带响应式布局。

### 3. 网页端需要安装吗？

不需要。直接在浏览器打开站点地址即可。

### 4. 聊天、群组、管理后台在哪里完成？

全部在网页内完成。

### 5. 窄屏 / 手机上，左侧会话栏会怎样？

左侧会话栏变成抽屉。

### 6. 窄屏 / 手机上，设置会怎样？

设置收进侧栏面板。

### 7. 消息上下文菜单在触摸设备上如何触发？

改为「长按」触发。

### 8. 触摸设备判定在哪里？

`MessageItem.vue` 用 `matchMedia('(pointer: coarse)')` 判定触摸设备。

### 9. 网页支持哪些语言？

zh / en / ja。

### 10. 语言选择记在哪里？

记到 `localStorage`。

### 11. 服务端升级后浏览器要做什么？

务必硬刷新（`Ctrl+Shift+R`）清理缓存的静态资源。

### 12. 桌面客户端的仓库是什么？

[CircleChat-Client](https://github.com/CircleChat-Team/CircleChat-Client/)。

### 13. 桌面客户端是什么技术？

它是一个用 Rust 写的 WebView 外壳，把 CircleChat 网页端承载在一个原生窗口里。

### 14. 桌面客户端捆绑浏览器引擎吗？

不捆绑。它是纯 WebView 外壳，不捆绑浏览器引擎。

### 15. 桌面客户端底层用什么？

底层用 [wry](https://github.com/tauri-apps/wry) 承载系统原生 WebView。

### 16. 各平台用什么 WebView？

- Linux 用 WebKitGTK；
- macOS 用 WKWebView；
- Windows 用 WebView2。

### 17. 桌面客户端引入了 Tauri 整套框架吗？

没有。`Cargo.toml` 里只引了 `wry` + `tao` 窗口层，没有引入 Tauri 整套框架。

### 18. 桌面客户端安装包和内存占用如何？

因为不捆绑浏览器引擎，所以安装包小、内存占用低。

### 19. 首次配置窗口是什么？

首次配置用 [iced](https://github.com/iced-rs/iced) 写的原生控件，非内嵌网页。

### 20. 配置窗口为什么关闭 wgpu？

关闭 wgpu、改用 `tiny-skia` 软件渲染，是为了编译更快、兼容性更好。

### 21. 桌面客户端有哪些桌面能力？

系统通知、文件下载落盘、站内外链接自动分流到系统默认程序。

### 22. 当前客户端版本是多少？

当前客户端版本见 `Cargo.toml`（`version = "0.1.5"`）。

### 23. 对外实际报的版本号是什么形式？

`0.1.5+<git short sha>`。

### 24. 推荐从哪里下载桌面客户端？

推荐从 [Releases](https://github.com/CircleChat-Team/CircleChat-Client/releases) 下载预编译安装包。

### 25. Linux `.deb` 怎么安装？

```bash
sudo apt install ./circlechat-client_<版本>_amd64.deb
```

### 26. Linux `.rpm` 怎么安装？

```bash
sudo dnf install ./circlechat-client-<版本>-1.x86_64.rpm
```

### 27. Linux `.AppImage` 怎么运行？

```bash
chmod +x CircleChat-<版本>-x86_64.AppImage && ./CircleChat-<版本>-x86_64.AppImage
```

### 28. macOS `.dmg` 怎么安装？

挂载后把 `CircleChat.app` 拖进「应用程序」。

### 29. Windows `.zip` 怎么使用？

解压后运行 `circlechat-client.exe`。

### 30. 当前发布包签名了吗？

当前发布包**未签名**。

### 31. macOS 首次打开被 Gatekeeper 拦截怎么办？

右键 → 打开。

### 32. Windows 可能弹什么？

可能弹 SmartScreen。

### 33. 正式分发前需要做什么？

需在 CI 里加证书签名 / 公证。

### 34. 客户端第一次需要填什么？

需要填入 CircleChat 服务地址，以及用于身份校验的共享密钥 `APP_SECRET`。

### 35. 预编译二进制怎么传 `APP_SECRET`？

```bash
APP_SECRET='你的密钥' ./circlechat-client
```

### 36. 从源码运行怎么传 `APP_SECRET`？

```bash
APP_SECRET='你的密钥' cargo run
```

### 37. 启动流程是什么？

读本地配置 → 有地址？是 → 打开 WebView；否 → 弹出配置窗口（填地址）→ `GET {地址}/api/app-manifest` 校验站点身份 → 通过 → 保存地址并进入 WebView；失败 → 窗口提示「无效的站点」，不保存、不进入。

### 38. 首次启动流程是什么？

弹出「CircleChat 配置」窗口 → 填地址、点「保存并进入」→ 客户端去拉 `{地址}/api/app-manifest` 校验身份，通过才写配置并打开 WebView，失败则提示「无效的站点」。

### 39. 之后再启动会弹配置窗口吗？

不会。配置里已有地址，直接打开 WebView，不再弹配置窗口。

### 40. 之后再启动可以不传 `APP_SECRET` 吗？

可以。这种情况可以不用传 `APP_SECRET`，校验只发生在保存地址那一刻。

### 41. 怎么回到配置窗口？

在 WebView 里按 `Ctrl+Shift+R`（macOS 为 `Cmd+Shift+R`）会清掉配置并重启客户端；或直接删掉配置文件再启动。

### 42. 配置文件在哪里？

| 平台 | 配置 |
| --- | --- |
| Linux | `~/.config/circlechat/config.json` |
| macOS | `~/Library/Application Support/com.CircleChat.CircleChat/config.json` |
| Windows | `%APPDATA%\CircleChat\CircleChat\config\config.json` |

### 43. 数据目录在哪里？

| 平台 | 数据目录 |
| --- | --- |
| Linux | `~/.local/share/circlechat/` |
| macOS | 同上标准目录 |
| Windows | 同上标准目录 |

### 44. 日志打到哪里？

日志（配置路径、缓存目录、UA、下载、通知）打到 stdout。

### 45. 需要留档日志怎么办？

```bash
2>&1 | tee run.log
```

### 46. 保存地址前客户端会请求什么？

`GET {地址}/api/app-manifest`。

### 47. 期望返回什么 JSON？

```json
{
  "app_id": "circlechat",
  "version": "1.0.0",
  "timestamp": 1700000000,
  "signature": "sha256(app_id+version+timestamp+SECRET)"
}
```

### 48. 服务端侧接口在哪个文件？

`server/lib/runtime.ts`。

### 49. 该接口对来源放开吗？

对来源放开（`Access-Control-Allow-Origin: *`，仅 `GET` / `OPTIONS`）。

### 50. 该接口下发凭据或认 Cookie 吗？

不下发凭据、不认 Cookie，放在鉴权门槛之前。

### 51. 签名怎么算？

`signature = SHA256(app_id + version + timestamp + APP_SECRET)`。

### 52. `APP_SECRET` 会下发吗？

不会。`APP_SECRET` 只用于签名、绝不下发。

### 53. 标识与版本来自哪里？

来自 `readAppInfo()`：环境变量 `CIRCLECHAT_APP_ID` / `APP_ID` 优先，缺省读 `package.json` 的 `name` / `version`。

### 54. `APP_SECRET` 未配置时接口返回什么？

接口直接返回 503，不下发任何可被伪造的清单。

### 55. 客户端侧三项校验是什么？

1. `app_id` 默认要求为 `circlechat`，可用环境变量 `CIRCLECHAT_APP_ID` 覆盖——客户端与服务端必须配置成同一个值，签名才对得上。
2. `signature == sha256(app_id + version + timestamp + SECRET)` 的小写 hex（大小写不敏感，允许 `sha256=` / `sha256:` 前缀）。
3. `|本地时间 - timestamp| <= 300` 秒（防重放）。

### 56. `SECRET` 是什么？

`SECRET` 即环境变量 `APP_SECRET`。客户端与服务端必须设为同一个值，服务端用它签名、客户端用它验签。

### 57. 校验结果缓存吗？

校验结果缓存在内存里（成功和失败都缓存），所以服务端修好之后需要让用户重启客户端才能重新校验。

### 58. 怎么判断自己跑在客户端里？

```ts
const isDesktop = !!window.__CIRCLECHAT_CLIENT__
// { name: 'circlechat-desktop', version: '0.1.5+abc1234', platform: 'linux' | 'macos' | 'windows' }
```

`src/identity.rs` 注入，先于页面脚本、所有路由 / 刷新都在，只在主 frame，iframe 无。

### 59. 登录页「下载桌面客户端」横幅什么时候显示？

`DownloadClient.vue` 只在 `getDesktopClient() === null` 时显示。

### 60. `src/utils/client.ts` 怎么识别？

优先读这个全局变量，取不到才退化到 UA 正则 `/CircleChatDesktop\/([\d.]+)/`。

### 61. 怎么发系统通知？

```ts
const result = await window.__CIRCLECHAT__.notify({ title: '新消息', body: '张三：在吗？' })
// { ok: true, error: null } 或 { ok: false, error: '<原因>' }
```

### 62. `error` 可能是什么？

可能是系统通知服务的报错（Linux 无通知守护进程、macOS 权限被拒…），也可能是 `ipc-unavailable`（不在客户端里，如浏览器调试）或 `timeout`（10 秒内没结果）。

### 63. 通知标题和正文有上限吗？

标题上限 120 字符、正文 500 字符，超出截断。

### 64. 另外两个标记是什么？

| 机制 | 覆盖 | 范围 |
| --- | --- | --- |
| User-Agent 里的 `CircleChatDesktop/<版本>` | 服务端 + 前端 | 所有请求（子资源 / XHR / WebSocket 握手） |
| `X-CircleChat-Client: <版本>` 请求头 | 服务端 | 仅入口文档那一次请求 |

### 65. 这两个标记能做信任判定吗？

不能。它们只用于功能分支，不能做信任判定，普通浏览器可原样伪造。

### 66. 后续接口请求要带标记怎么办？

前端自己在拦截器里加即可：

```ts
axios.interceptors.request.use(cfg => {
  if (window.__CIRCLECHAT_CLIENT__) cfg.headers['X-CircleChat-Client'] = window.__CIRCLECHAT_CLIENT__.version
  return cfg
})
```

### 67. 要服务端能信任，应该用什么？

得用 `APP_SECRET` 签名换 token，而不是这几个标记。

### 68. 入口文档缓存策略是什么？

入口文档每次都重新请求（带 `Cache-Control: no-cache, no-store`），前端发版立刻生效。

### 69. 其它资源缓存策略是什么？

其它资源（图片、字体、媒体、附件）按服务端响应头走 WebView 的磁盘缓存。wry 默认是临时上下文、什么都不留，客户端显式指定了一个持久化目录。

### 70. 下载行为是什么？

下载落到系统下载目录，重名自动加 ` (1)`、` (2)`。

### 71. 站外链接怎么处理？

站外链接（origin 不同，含子域、换协议）交给系统默认程序打开，不在 WebView 里开。

### 72. `window.open` / `target="_blank"` 的站内链接怎么处理？

在当前 WebView 打开，不弹新窗。

### 73. 怎么清缓存？

删掉数据目录里的 `webview/` 即可。

### 74. 从源码构建需要什么？

需要 Rust **1.89+**。

### 75. 构建命令是什么？

```bash
cargo build --release
```

### 76. Linux 需要哪些系统库？

```text
libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libdbus-1-dev libxkbcommon-dev
```

### 77. macOS / Windows 需要额外依赖吗？

macOS / Windows 走系统原生 WebView，无需额外依赖。

### 78. `APP_SECRET` 环境变量必需吗？

必需（首次配置时）。站点身份校验共享密钥，客户端与服务端必须一致。

### 79. `CIRCLECHAT_USER_AGENT` 是什么？

否。整体覆盖 UA（内置 UA 写死了浏览器版本号，将来变旧时用它兜底）。

### 80. `CIRCLECHAT_URL` 是什么？

否。直接指定要加载的地址，跳过配置窗口（调试用）。

### 81. `CIRCLECHAT_BUILD` 是什么？

否。把 git short sha 编进二进制，本地构建时 `build.rs` 会自己去问 git。

### 82. 移动端有独立 App 吗？

目前没有独立的移动 App。

### 83. 移动端怎么使用？

在手机浏览器里直接访问站点地址即可。

### 84. 移动端功能与桌面端一致吗？

功能与桌面端完全一致。

## 七、检查清单

### 网页端

- [ ] 是否直接打开站点地址？
- [ ] 是否无需安装？
- [ ] 聊天、群组、管理后台是否都在网页内完成？
- [ ] 窄屏 / 手机上，左侧会话栏是否变成抽屉？
- [ ] 设置是否收进侧栏面板？
- [ ] 触摸设备上，消息上下文菜单是否改为长按触发？
- [ ] 是否知道 `MessageItem.vue` 用 `matchMedia('(pointer: coarse)')` 判定触摸设备？
- [ ] 多语言是否支持 zh / en / ja？
- [ ] 语言选择是否记到 `localStorage`？
- [ ] 服务端升级后，是否硬刷新 `Ctrl+Shift+R`？

### 桌面客户端

- [ ] 是否知道桌面客户端是独立仓库 CircleChat-Client？
- [ ] 是否知道它是 Rust 写的 WebView 外壳？
- [ ] 是否知道它不捆绑浏览器引擎？
- [ ] 是否知道 Linux 用 WebKitGTK、macOS 用 WKWebView、Windows 用 WebView2？
- [ ] 是否知道 `Cargo.toml` 只引了 `wry` + `tao`，没有引入 Tauri 整套框架？
- [ ] 是否知道首次配置用 iced 写的原生控件？
- [ ] 是否知道配置窗口关闭 wgpu、改用 `tiny-skia` 软件渲染？
- [ ] 是否知道桌面能力包括系统通知、文件下载落盘、站内外链接分流？
- [ ] 是否知道当前版本见 `Cargo.toml`（`version = "0.1.5"`）？
- [ ] 是否知道对外版本号带构建号 `0.1.5+<git short sha>`？
- [ ] 是否从 Releases 下载预编译安装包？
- [ ] 是否知道各平台安装方式？
- [ ] 是否知道当前发布包未签名？
- [ ] macOS 首次打开被拦截时，是否知道右键 → 打开？
- [ ] Windows 弹 SmartScreen 时，是否知道原因？
- [ ] 是否知道正式分发前需在 CI 里加证书签名 / 公证？
- [ ] 首次配置是否填入服务地址和 `APP_SECRET`？
- [ ] 是否知道预编译二进制和源码运行的启动命令？
- [ ] 是否知道启动流程？
- [ ] 是否知道首次启动会弹「CircleChat 配置」窗口？
- [ ] 是否知道之后再启动可以直接打开 WebView？
- [ ] 是否知道之后再启动可以不用传 `APP_SECRET`？
- [ ] 是否知道 `Ctrl+Shift+R`（macOS `Cmd+Shift+R`）会清掉配置并重启客户端？
- [ ] 是否知道可以删配置文件再启动？
- [ ] 是否知道各平台配置和数据目录？
- [ ] 是否知道日志打到 stdout？
- [ ] 是否知道需要留档可 `2>&1 | tee run.log`？
- [ ] 是否知道 `/api/app-manifest` 的期望返回？
- [ ] 是否知道服务端侧接口在 `server/lib/runtime.ts`？
- [ ] 是否知道该接口对来源放开、仅 `GET` / `OPTIONS`？
- [ ] 是否知道该接口不下发凭据、不认 Cookie？
- [ ] 是否知道签名算法？
- [ ] 是否知道 `APP_SECRET` 只用于签名、绝不下发？
- [ ] 是否知道标识与版本来自 `readAppInfo()`？
- [ ] 是否知道 `APP_SECRET` 未配置时返回 503？
- [ ] 是否知道客户端侧三项校验？
- [ ] 是否知道 `SECRET` 即 `APP_SECRET`？
- [ ] 是否知道校验结果缓存在内存里？
- [ ] 是否知道服务端修好后需要重启客户端才能重新校验？
- [ ] 是否知道如何判断自己跑在客户端里？
- [ ] 是否知道 `window.__CIRCLECHAT_CLIENT__` 的结构？
- [ ] 是否知道登录页「下载桌面客户端」横幅显示条件？
- [ ] 是否知道 `src/utils/client.ts` 的识别顺序？
- [ ] 是否知道如何发系统通知？
- [ ] 是否知道通知 `error` 可能是什么？
- [ ] 是否知道通知标题和正文上限？
- [ ] 是否知道另外两个标记不能做信任判定？
- [ ] 是否知道后续接口请求要带标记时应在拦截器里加？
- [ ] 是否知道要服务端能信任，得用 `APP_SECRET` 签名换 token？
- [ ] 是否知道入口文档每次都重新请求？
- [ ] 是否知道其它资源按服务端响应头走 WebView 磁盘缓存？
- [ ] 是否知道 wry 默认是临时上下文？
- [ ] 是否知道客户端显式指定了持久化目录？
- [ ] 是否知道下载落到系统下载目录并重名加 ` (1)`、` (2)`？
- [ ] 是否知道站外链接交给系统默认程序打开？
- [ ] 是否知道 `window.open` / `target="_blank"` 的站内链接在当前 WebView 打开？
- [ ] 是否知道清缓存可删数据目录里的 `webview/`？
- [ ] 是否知道从源码构建需要 Rust 1.89+？
- [ ] 是否知道构建命令 `cargo build --release`？
- [ ] 是否知道 Linux 需要的系统库？
- [ ] 是否知道 macOS / Windows 无需额外依赖？
- [ ] 是否知道四个环境变量的含义？

### 移动端

- [ ] 是否知道目前没有独立移动 App？
- [ ] 是否知道在手机浏览器直接访问站点地址即可？
- [ ] 是否知道网页本身是响应式的？
- [ ] 是否知道会话列表收成抽屉？
- [ ] 是否知道设置收进面板？
- [ ] 是否知道长按消息弹出上下文菜单？
- [ ] 是否知道功能与桌面端完全一致？

## 八、相关文档

- 服务端侧的 `APP_SECRET` / `CIRCLECHAT_APP_ID` / `APP_VERSION` 配置见 [配置说明](../getting-started/configuration.md)。
- 更多安全相关说明见 [安全模型与加固](../guide/security.md)。