# 五分钟写第一个小程序

这一页带你在本地写出一个能跑起来的小程序：**掷骰子**。

## 0. 准备

- 一个能访问的静态文件地址（GitHub raw、jsDelivr、你自己的站点都行）
- 一个 CircleChat 平台（用来安装和试跑）

不需要构建工具、不需要依赖、不需要后端。

## 1. 写页面

新建 `dice/index.html`：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>掷骰子</title>
</head>
<body>
  <h1>掷骰子</h1>
  <button id="go" disabled>加载中…</button>
  <p id="out"></p>

<script>
function boot() {
  var btn = document.getElementById('go');
  var out = document.getElementById('out');

  CircleChat.ready().then(function (ctx) {
    if (!ctx) { out.textContent = '没拿到上下文：宿主没有响应'; return; }
    var canSend = ctx.permissions.indexOf('message.send') !== -1;
    btn.disabled = false;
    btn.textContent = canSend ? '掷一次并发到群里' : '掷一次（未授权发送）';

    btn.addEventListener('click', function () {
      var v = 1 + Math.floor(Math.random() * 6);
      out.textContent = '掷出了 ' + v;
      if (!canSend) return;
      CircleChat.sendMessage('🎲 掷出了 ' + v)
        .then(function () { out.textContent = '掷出了 ' + v + '，已发送到会话'; })
        .catch(function (e) { out.textContent = '发送失败：' + e.message; });
    });
  });
}
if (window.CircleChat) boot();
else window.addEventListener('minisdk-ready', boot);
</script>
</body>
</html>
```

关键点：

- `CircleChat.ready()` 一定要等，它是握手，返回上下文；超时（4 秒）会返回 `null`，此时页面仍应可用。
- 用 `ctx.permissions` 判断自己有没有拿到某项权限，不要假设一定有。
- SDK 是异步加载的，所以业务代码挂在 `minisdk-ready` 事件上。

## 2. 加载 SDK

小程序可能托管在任何站点，SDK 只能从**运行它的平台**加载。页面里放这段引导脚本：

```html
<script>
(function () {
  function safeOrigin(u) {
    try { var x = new URL(u); return (x.protocol === 'http:' || x.protocol === 'https:') ? x.origin : ''; } catch (e) { return ''; }
  }
  // 1) 宿主用 srcdoc 渲染时 SDK 已注入，直接放行
  if (window.CircleChat) { window.dispatchEvent(new Event('minisdk-ready')); return; }
  // 2) 宿主在 iframe 地址里用 #ccsdk=<origin> 传入（首选）
  // 3) 退回 document.referrer（跨域时至少能拿到宿主 origin）
  var origin = '';
  var m = /(?:^|[#&])ccsdk=([^&]+)/.exec(location.hash || '');
  if (m) origin = safeOrigin(decodeURIComponent(m[1]));
  if (!origin) origin = safeOrigin(document.referrer);

  function fail(msg) {
    document.addEventListener('DOMContentLoaded', function () {
      var p = document.createElement('p');
      p.style.cssText = 'padding:16px;font:13px/1.6 system-ui,sans-serif;color:#888';
      p.textContent = msg;
      document.body.appendChild(p);
    });
  }
  if (!origin) { fail('未能定位平台地址，SDK 未加载'); return; }

  var s = document.createElement('script');
  s.src = origin + '/mini-sdk.js';
  s.onload = function () { window.dispatchEvent(new Event('minisdk-ready')); };
  s.onerror = function () { fail('SDK 加载失败：' + s.src); };
  document.head.appendChild(s);
})();
</script>
```

> CircleChat 默认用 `srcdoc` 渲染小程序页面，并已经把 SDK 注入好了，
> 所以第 1 条分支在官方流程里会直接命中；上面 2、3 条是给「直接把页面地址塞进 iframe」的场景兜底。

## 3. 写索引

新建 `index.json`，放在同一仓库根目录：

```json
{
  "version": 1,
  "name": "我的小程序源",
  "apps": [
    {
      "id": "com.example.dice",
      "name": "掷骰子",
      "summary": "掷一个六面骰，结果可以发到当前会话",
      "icon": "https://cdn.jsdelivr.net/gh/you/your-repo@main/dice/icon.svg",
      "version": "1.0.0",
      "entry": "https://cdn.jsdelivr.net/gh/you/your-repo@main/dice/index.html",
      "permissions": ["message.send"],
      "command": "dice",
      "window": { "width": 360, "height": 300 }
    }
  ]
}
```

字段含义见 [索引与 manifest 规格](./manifest.md)。

## 4. 挂到平台上

两种方式任选：

- **管理员加源**：管理面板 →「小程序」页签 → 添加源，填你的 `index.json` 地址 → 保存并刷新；
- **临时试用**：也可以在管理面板里把官方源的地址临时换成你的地址，验证完再换回来。

平台启动时会合并加载一次，之后缓存 30 分钟；点「保存并刷新」可立即回源。

## 5. 安装并试跑

1. 聊天页侧边栏「+」→「小程序商店」→ 找到「掷骰子」→ 详情，勾选 `message.send` → 安装（个人）或添加到本群；
2. 个人安装：侧栏「小程序」分区里点它直接打开；
3. 群安装：在群里输入 `#dice` 回车，输入框也会在敲 `#` 时给出候选。

## 常见坑

| 现象 | 原因 |
| --- | --- |
| 页面显示一堆源码文本 | 用 `raw.githubusercontent.com` 的 HTML 直接当 iframe 地址——它发的是 `text/plain`，浏览器不渲染。CircleChat 已用 `srcdoc` 规避；自建源请换成 jsDelivr / GitHub Pages |
| `CircleChat is not defined` | 业务脚本在 SDK 加载前就跑了，挂到 `minisdk-ready` 上 |
| `ready()` 返回 null | 握手超时（宿主没响应），或页面不是被平台加载的（直接浏览器打开） |
| 发送返回 `noPerm` | 安装时没勾 `message.send`，去「已安装 → 改授权」补上 |
| 发送返回 `rateLimited` | 每分钟最多 10 条，等一分钟 |
