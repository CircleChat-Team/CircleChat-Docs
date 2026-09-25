# 内置样例讲解

官方源自带三个小程序，源码在 [CircleChat-MiniProgram](https://github.com/CircleChat-Team/CircleChat-MiniProgram)，
分别演示**发消息**、**读会话**、**KV 读写**三类能力。

## 掷骰子 `com.circlechat.roll`

- 权限：`message.send`
- 指令：`#roll`、`#roll 2d6`、`#roll d20`
- 演示：解析参数 → 计算结果 → 代发消息

关键片段：

```js
function roll(expr) {
  var m = /^(\d*)d(\d+)$/i.exec(String(expr || '').trim());
  var n = m ? Math.max(1, Math.min(20, parseInt(m[1] || '1', 10))) : 1;   // 骰子个数，上限 20
  var face = m ? Math.max(2, Math.min(1000, parseInt(m[2], 10))) : 6;     // 面数，上限 1000
  var parts = [], total = 0;
  for (var i = 0; i < n; i++) { var v = 1 + Math.floor(Math.random() * face); parts.push(v); total += v; }
  // ... 渲染
}

// 被 #roll 唤起：自动掷一次，有权限就顺手发到会话
CircleChat.on('invoke', function (p) {
  roll(String((p && p.args) || '').trim().replace(/^d/, '1d') || '1d6');
  if (canSend()) send();
});
```

两个值得抄的做法：

1. **参数做了上下限夹取**，不会被 `#roll 99999d99999` 拖死；
2. **按钮状态跟着权限走**：没拿到 `message.send` 时「发送到会话」是禁用的，并在提示里说明原因。

## 会话统计 `com.circlechat.stats`

- 权限：`chat.read`
- 指令：`#stats`
- 演示：读取成员与最近消息 → 本地聚合 → 渲染

```js
const { chat, members, recent } = await CircleChat.getChat({ limit: 100 });

const counts = {};
for (const m of recent) counts[m.from] = (counts[m.from] || 0) + 1;
const top = Object.keys(counts)
  .map((name) => ({ name, n: counts[name] }))
  .sort((a, b) => b.n - a.n)
  .slice(0, 6);
```

要点：

- 只读取，**不写任何东西**，是权限最小的那一类小程序；
- 统计全部在客户端做，服务端不提供聚合接口；
- 已撤回的消息 `content` 为空，统计时要跳过（`recent` 里带 `recalled` 字段）。

## 会话便签 `com.circlechat.notes`

- 权限：`kv.read`、`kv.write`
- 指令：`#note`
- 演示：共享便签的读 / 写 / 删除，以及命名空间带来的「群里共享」效果

```js
await CircleChat.kv.set('note', text);
await CircleChat.kv.set('note_by', CircleChat.context.username);   // 额外记一个「最后修改人」
const text = await CircleChat.kv.get('note') || '';
```

要点：

- 便签属于「小程序 + 群」这个命名空间，所以**同群共享、跨群隔离**；
- 「最后修改人」是业务层自己存的一个额外键——平台不提供元数据字段，需要就自己存；
- `Ctrl/Cmd + S` 保存，无权限时按钮禁用并提示。

## 三个样例的共同结构

每个样例都是**单文件**，结构一致：

```
<head>
  <meta charset>
  <title>
  <style>          /* 自带样式，含 prefers-color-scheme 暗色适配 */
  <script>         /* SDK 引导：从 #ccsdk 或 referrer 定位平台并加载 mini-sdk.js */
</head>
<body>
  ...标记...
  <script>
    function boot() { ...业务... }
    if (window.CircleChat) boot();
    else window.addEventListener('minisdk-ready', boot);
  </script>
</body>
```

三条经验：

1. **单文件**：平台用 `srcdoc` 渲染，页面内的相对资源（外链 CSS/JS/图片）可能失效，全部内联最稳；
2. **自带暗色**：沙箱里拿不到宿主的 CSS 变量，自己写 `prefers-color-scheme`；
3. **语言自己判断**：样例用 `navigator.language` 在 zh/en/ja 间切换，平台不注入语言。
