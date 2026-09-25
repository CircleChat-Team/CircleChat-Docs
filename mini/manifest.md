# 索引与 manifest 规格

## 索引文件

一个源就是一个 JSON 文件，顶层结构：

```json
{
  "version": 1,
  "name": "我的小程序源",
  "updated": "2026-09-25",
  "apps": [ /* manifest 列表 */ ]
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `apps` | ✅ | 小程序清单；不是数组的条目会被当成空 |
| `version` / `name` / `updated` | | 展示用，平台不校验 |

平台读取时的限制：

- 单个索引最大 **1 MB**；
- 单个源最多 **200** 个 app，合并后最多 **500** 个；
- 拉取超时 **5 秒**；
- 地址只接受 `https://…`、`http://…` 或站内相对路径（如 `/mini/index.json`，从 `public/` 读取）。

## manifest 字段

```json
{
  "id": "com.example.dice",
  "name": "掷骰子",
  "summary": "一句话简介",
  "description": "更长的说明，展示在详情页",
  "icon": "https://…/icon.svg",
  "version": "1.0.0",
  "entry": "https://…/index.html",
  "permissions": ["message.send"],
  "command": "dice",
  "window": { "width": 380, "height": 440 },
  "author": "作者",
  "homepage": "https://…"
}
```

| 字段 | 必填 | 规则 |
| --- | --- | --- |
| `id` | ✅ | 全局唯一，只允许 `A-Za-z0-9._-`，最长 64。建议用反向域名 |
| `name` | ✅ | 展示名，最长 40 |
| `entry` | ✅ | 入口 HTML。只接受 `https://`、`http://` 或站内相对路径；`javascript:`、`data:` 会被拒 |
| `permissions` | ✅ | 权限数组，取值见[权限与安全模型](./permissions.md)；未知值会被丢弃 |
| `command` | | 群内触发的指令名（不含 `#`），`A-Za-z0-9_-`，最长 24，统一转小写 |
| `window` | | 运行窗口尺寸；宽会被夹到 280–1200，高夹到 320–900，默认 420×640 |
| `icon` | | 图标地址，建议 SVG/PNG，最长 500 |
| `summary` | | 一句话简介，最长 120 |
| `description` | | 详情说明，最长 400，支持换行 |
| `author` | | 作者，最长 60 |
| `homepage` | | 主页，必须 `http(s)`，否则丢弃 |

任何一项校验失败，该小程序会被**跳过**（不会让整个源失败），但 `id`、`name`、`entry` 缺失或 `id` 含非法字符会直接丢弃。

## 多源与合并

平台的源配置存在整站配置里（`app_config.mini_sources`），由管理员在「管理面板 → 小程序」维护：

```json
[
  { "id": "official", "name": "官方源", "url": "https://raw.githubusercontent.com/CircleChat-Team/CircleChat-MiniProgram/main/index.json", "enabled": true, "priority": 0, "official": true },
  { "id": "src-1", "name": "第三方源", "url": "https://example.com/mini/index.json", "enabled": true, "priority": 100, "official": false }
]
```

合并规则：

1. 只加载 `enabled` 的源；
2. 排序：**官方源优先**，其次按 `priority` 升序；
3. 按 `id` 去重，**先到先得**——高优先级源里的同 id 条目胜出，后面的不覆盖；
4. 每个条目带上 `sourceId` / `sourceName` / `official`，界面会标出「官方」或来源名。

容错设计：

- 单个源超时、解析失败、返回非法 JSON，只把这个源标记为失败并记录原因，**不影响其它源**；
- 失败状态会显示在商店底部和管理面板的「各源状态」里；
- 平台启动时加载一次（预热），之后内存缓存 **30 分钟**；管理员点「保存并刷新」立即回源。

## 版本与升级

`version` 只是展示用。平台在安装时会保存一份 manifest 快照，升级逻辑是：

- 索引里的 `version` / `name` / `entry` / 权限声明变了，用户重新安装（或平台刷新后用户再点安装）会覆盖快照；
- 已经安装的小程序不会因为索引更新而自动改变**已授权的权限**（授权是用户行为）。要调整就走「改授权」。

## 校验清单（发布前自查）

- [ ] `id` 唯一且只含 `A-Za-z0-9._-`
- [ ] `entry` 是 `https`，且**能作为 HTML 渲染**（注意 raw.githubusercontent.com 发的是 `text/plain`）
- [ ] `permissions` 只声明真正需要的权限，不多要
- [ ] `command` 简短好记，且不与常用词冲突
- [ ] 页面在纯静态、无 Cookie、无 `localStorage` 依赖的前提下能跑
- [ ] 暗色模式（`prefers-color-scheme`）不至于看不清
- [ ] 没有依赖页面内的相对资源（平台用 `srcdoc` 渲染时相对路径会失效）
