# SDK 参考

平台在同源提供 SDK：`/mini-sdk.js`。小程序页面引入后，全局会多出一个 `CircleChat` 对象。

> 沙箱里拿不到 Cookie，也不需要你处理鉴权：SDK 内部用 `postMessage` 让宿主代持会话，
> 或携带平台下发的短时令牌直连 `/api/mini/*`。

## 生命周期

### `CircleChat.ready(): Promise<context | null>`

握手并返回上下文。宿主 4 秒内没有响应时返回 `null`——此时页面应该仍然可用（比如纯工具型页面）。

```js
const ctx = await CircleChat.ready();
```

`context` 结构：

| 字段 | 说明 |
| --- | --- |
| `appId` | 自己的小程序 id |
| `userId` / `username` | 当前使用者的用户名（两者相同，保留两个名字方便书写） |
| `scope` | `'user'` 或 `'group'` |
| `scopeId` | 个人作用域为用户名，群作用域为群 id |
| `chatId` | `u:<用户名>` 或 `g:<群 id>` |
| `name` / `icon` / `entry` | manifest 里的展示信息 |
| `command` | 指令名（没有则为 `''`） |
| `permissions` | 已授予的权限数组 |

### `CircleChat.context`

同步getter，等于 `ready()` 的结果（握手完成前为 `null`）。

### `CircleChat.close()`

关闭自己（宿主把 iframe 卸掉）。

```js
document.getElementById('close').onclick = () => CircleChat.close();
```

## 消息

### `CircleChat.sendMessage(text, opts?): Promise<result>`

以当前用户名义向当前会话发一条文本消息。需要 `message.send`。

```js
await CircleChat.sendMessage('大家好');
await CircleChat.sendMessage('# 标题', { md: 1 });   // 按 Markdown 渲染
```

| 参数 | 说明 |
| --- | --- |
| `text` | 正文，服务端上限 4096 字符 |
| `opts.md` | 为真时按 Markdown 渲染 |
| `opts.gid` / `opts.pm` | 个人作用域下可指定目标；群作用域只能发到本群 |

限制：每个「用户 + 小程序」每分钟最多 10 条，超限返回 `api.mini.rateLimited`。

## 会话

### `CircleChat.getChat(opts?): Promise<{ chat, members, recent }>`

读取当前会话的信息、成员与最近消息。需要 `chat.read`。

```js
const { chat, members, recent } = await CircleChat.getChat({ limit: 50 });
```

| 返回 | 说明 |
| --- | --- |
| `chat` | `{ kind: 'group' \| 'dm' \| 'public', id, chatId, name, memberCount }` |
| `members` | `[{ name, role: 'member' \| 'admin', nickname }]`（私聊/公共房间为空） |
| `recent` | `[{ idx, from, type, content, ts, recalled, viaApp }]`，最多 `limit` 条（上限 100，默认 50） |

已撤回的消息 `content` 为空、`recalled` 为 1。`viaApp` 标明这条消息是哪个小程序发的。

### `CircleChat.getProfile(): Promise<profile>`

读取调用者自己的资料。需要 `profile.read`。

```js
const me = await CircleChat.getProfile();   // { name, role, image, ... }
```

## KV 存储

命名空间自动按「小程序 + 会话」隔离，接口里不需要传任何标识。详见 [KV 存储](./kv.md)。

### `CircleChat.kv.get(key): Promise<string | null>`

取值，不存在返回 `null`。需要 `kv.read`。

### `CircleChat.kv.set(key, value): Promise<result>`

写入。需要 `kv.write`。非字符串会被 `JSON.stringify`。

```js
await CircleChat.kv.set('note', '明天下午三点开会');
```

### `CircleChat.kv.del(key): Promise<result>`

删除。需要 `kv.write`。

### `CircleChat.kv.list(): Promise<{ k, v, updated }[]>`

列出命名空间下的全部键值。需要 `kv.read`。

## 事件

### `CircleChat.on(event, cb)` / `off(event, cb)`

| 事件 | 触发时机 | 回调参数 |
| --- | --- | --- |
| `invoke` | 被 `#指令` 唤起（握手完成后下发一次） | `{ command, args, chatId }` |
| `context` | 每次收到宿主下发的上下文 | `context` |
| `close` | 宿主关闭了小程序 | — |

```js
CircleChat.on('invoke', (p) => {
  // p.command === 'roll'，p.args === '2d6'
});
```

## 通用通道

### `CircleChat.request(method, params): Promise<data>`

SDK 未封装的能力走这里，宿主实现同名方法。可用方法：

| method | 参数 | 权限 |
| --- | --- | --- |
| `context.get` | — | — |
| `profile.get` | — | `profile.read` |
| `chat.get` | `{ gid?, pm?, limit? }` | `chat.read` |
| `message.send` | `{ text, md?, gid?, pm? }` | `message.send` |
| `kv.get` / `kv.list` | `{ key }` / — | `kv.read` |
| `kv.set` / `kv.del` | `{ key, value }` / `{ key }` | `kv.write` |
| `close` | — | — |

失败时 Promise 以 `Error` reject，`message` 里是平台的错误码（i18n 键，如 `api.mini.noPerm`）。

## 错误处理约定

平台返回的错误码是 **i18n 键**，不是中文：

```js
try {
  await CircleChat.sendMessage('hi');
} catch (e) {
  if (e.message === 'api.mini.noPerm') show('没有发消息权限');
  else if (e.message === 'api.mini.rateLimited') show('发太快了');
  else show('失败：' + e.message);
}
```

常见错误码：`api.mini.noPerm`、`api.mini.notInstalled`、`api.mini.rateLimited`、`api.mini.noTarget`、
`api.msg.empty`、`api.msg.muted`、`api.mini.kv.quotaExceeded`、`api.mini.unknownMethod`。
