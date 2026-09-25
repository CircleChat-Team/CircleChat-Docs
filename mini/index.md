# 小程序概览

小程序（MiniApp）是给聊天室扩展功能的一种**纯前端程序**：一个静态页面 + 索引清单里的一条 manifest。

它不是插件、不是服务端程序：

- 没有独立进程、不占用端口、没有文件系统权限；
- 由平台放进一个沙箱 `iframe` 里运行（固定 `sandbox="allow-scripts"`）；
- 所有数据经平台提供的 API 读写，所有交互通过 `postMessage` 与宿主页面通信。

## 它长什么样

对使用者来说，一个小程序有两种存在方式：

| 方式 | 安装位置 | 怎么用 |
| --- | --- | --- |
| **个人安装**（好友式） | 侧边栏「小程序」分区 | 像好友一样点开即用。它只是出现在列表里，**不是真实好友关系**，也没有私聊窗口 |
| **群安装** | 某个群 | 在群里输入 `#指令` 调用，例如 `#roll 2d6` |

同一个小程序可以只装在个人、只装在某几个群，或两者都有；两边的数据互不干扰。

## 运行模型

```
宿主页面（同源，带会话 Cookie）
   │
   ├─ 1. 握手：iframe 发 hello → 宿主下发 context（appId / userId / chatId / 已授权权限）+ 短时令牌
   │
   ├─ 2. 主通道：postMessage RPC
   │       小程序 → 宿主 → 平台 API（Cookie 鉴权）→ 结果回传
   │
   └─ 3. 可选直连：小程序自己 fetch('/api/mini/*')，带 X-Mini-Token
```

### 为什么有两套通道

`sandbox="allow-scripts"` 不含 `allow-same-origin`，因此 iframe 是**不透明源**：

- 它拿不到宿主页面的 Cookie，也没法碰宿主的 DOM；
- 反过来，如果补上 `allow-same-origin`，同源内容就等于解除沙箱（可以直接操作父页面），不能接受。

于是数据读写默认走 **postMessage RPC**：由宿主代持 Cookie 发起同源请求，鉴权就是标准的会话 Cookie。
为了让小程序也能自己 `fetch`，平台额外签发一枚**由会话派生的短时令牌**（`X-Mini-Token`）：

- TTL 1 小时，绑定「用户 + 小程序 + 作用域 + 已授权权限」；
- 用户看不到、也创建不了，它**不是 API Key**；
- 只对 `/api/mini/*` 生效，拿它调其它接口一律按未登录处理；
- 令牌里写死了 appId，请求里带别的 appId 会被拒绝——A 小程序不能拿自己的令牌去读写 B 小程序的数据。

### 上下文怎么“注入”

不用 URL 参数：那会泄漏到第三方服务器的访问日志里，也能被小程序自己篡改。
真实做法是**握手**：iframe 加载后发一个 `hello`，宿主（可信方）把上下文与令牌回传。小程序用 `CircleChat.ready()` 拿到。

```js
const ctx = await CircleChat.ready();
// ctx: { appId, userId, username, scope, scopeId, chatId, name, command, permissions }
```

## 能力一览

| 能力 | 需要的权限 | 说明 |
| --- | --- | --- |
| 读取调用者自己的资料 | `profile.read` | 用户名与头像 |
| 读取当前会话 | `chat.read` | 成员列表 + 最近消息（上限 100 条） |
| 代发消息 | `message.send` | 以调用者名义发文本到当前会话，每分钟最多 10 条 |
| 读写自己的存储 | `kv.read` / `kv.write` | 平台代管的 KV，按「小程序 + 会话」隔离 |

小程序**不能**做的事：读取别人的私聊、读取未授权的会话、发文件/图片、修改群成员、拿到其它小程序的数据、绕过自己的权限。

## 名词表

| 名词 | 含义 |
| --- | --- |
| 索引（index.json） | 一个源提供的清单文件，`apps` 数组里每项就是一个 manifest |
| 源（source） | 一个可拉取索引的地址；平台支持官方源 + 任意第三方源 |
| manifest | 小程序的元数据：id、名称、入口、权限、指令名等 |
| 安装记录 | 某小程序在「个人」或「某群」的一次安装，含当次授权的权限集合 |
| 作用域（scope） | `user`（个人，scopeId 为用户名）或 `group`（群，scopeId 为 gid） |
| 命名空间（ns） | KV 的隔离单位：`u:<用户名>` 或 `g:<群 id>`，再叠加 appId |
| 令牌（mini_token） | 会话派生的短时凭证，仅用于沙箱内直连 `/api/mini/*` |

## 下一步

- [五分钟写第一个小程序](./quickstart.md)
- [索引与 manifest 规格](./manifest.md)
- [SDK 参考](./sdk.md)
- [权限与安全模型](./permissions.md)
