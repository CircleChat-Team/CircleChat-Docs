# KV 存储

小程序没有文件系统，持久化数据用平台代管的 **KV 存储**：只有 `get/set/del/list`，没有查询语言、没有 SQL、看不到任何表结构。

## 命名空间

一份数据由 **(appId, 命名空间)** 唯一确定，命名空间是：

| 作用域 | 命名空间 | 谁能看到 |
| --- | --- | --- |
| 个人安装 | `u:<用户名>` | 只有这个用户 |
| 群安装 | `g:<群 id>` | 同一个群里、同一个小程序的所有使用者共享 |

也就是说：

- 同一个小程序装在 A 群和 B 群 → 两份互不可见的数据；
- 不同小程序即使装在同一个群 → 也**互相读不到**；
- 小程序的作者（第三方）看不到任何数据，数据只存在部署者的库里。

## API

```js
await CircleChat.kv.set('note', '明天下午三点开会');
const v = await CircleChat.kv.get('note');        // '明天下午三点开会' | null
const items = await CircleChat.kv.list();         // [{ k, v, updated }, ...]
await CircleChat.kv.del('note');
```

需要 `kv.read`（get/list）与 `kv.write`（set/del）。详见 [SDK 参考](./sdk.md#kv-存储)。

## 值的类型

存储层只存字符串。SDK 的 `set` 会对非字符串自动 `JSON.stringify`，但**读出来不会自动解析**：

```js
await CircleChat.kv.set('cfg', { theme: 'dark', size: 20 });
const raw = await CircleChat.kv.get('cfg');            // '{"theme":"dark","size":20}'
const cfg = JSON.parse(raw || '{}');
```

建议：简单值直接存字符串，结构化数据自己在业务层 `JSON.parse`，并始终对 `null` 做兜底。

## 配额

| 限制 | 值 |
| --- | --- |
| 键长 | ≤ 256 字节 |
| 单值大小 | ≤ 64 KB |
| 每个命名空间的键数 | ≤ 500 |
| 每个命名空间的总容量 | ≤ 1 MB |

超过限制时写入会被拒绝，并返回对应的错误码：

| 错误码 | 含义 |
| --- | --- |
| `api.mini.kv.invalid` | 键名为空 |
| `api.mini.kv.keyTooLong` | 键名超长 |
| `api.mini.kv.valueTooLarge` | 单值超过 64 KB |
| `api.mini.kv.tooManyKeys` | 键数达到 500 |
| `api.mini.kv.quotaExceeded` | 总容量超过 1 MB |

写入前服务端会用 `COUNT(*)` + `SUM(LENGTH(v))` 做一次轻量核算（命中主键，不做全表扫描）。

## 生命周期

- **卸载小程序会清空该命名空间的数据**。这是刻意的：避免卸载后还留着一堆没人看的数据。
- 群解散后，该群的命名空间数据会随卸载/清理消失。
- 数据在部署者自己的 SQLite 库里（`mini_kv` 表），随平台备份一起走。

## 实践建议

1. **别当数据库用**：没有索引、没有条件查询，`list()` 是全量且最多 500 条。要存列表就自己序列化成一个键。
2. **键名加前缀**：`note:xxx`、`cfg:xxx`，方便 `list()` 之后自己归类。
3. **写入要节流**：文本编辑器类场景别每个按键都 `set`，用防抖。
4. **读不到就当没有**：`get` 返回 `null` 是常态，渲染时给空态。
5. **不要存敏感信息**：命名空间只隔离到「群」这一层，群里的每个人（通过该小程序）都能读到同一份数据。

## 示例：一个共享待办

```js
async function load() {
  const raw = await CircleChat.kv.get('todo');
  return raw ? JSON.parse(raw) : [];
}
async function save(list) {
  await CircleChat.kv.set('todo', JSON.stringify(list));
}

// 勾选第 i 项
async function toggle(i) {
  const list = await load();
  list[i].done = !list[i].done;
  await save(list);
}
```

并发写入是「后写覆盖」：多人同时编辑同一份待办会互相覆盖。真要协作，得自己在业务层做版本或分片（例如每人一个键：`todo:<用户名>`）。
