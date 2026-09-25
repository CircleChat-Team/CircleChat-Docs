# 端点验真（API 真实性校验）

本页描述客户端如何确认「正在调用的 API 真的属于本站点，而不是被劫持 / 配错 / 钓鱼的假服务端」。

对应服务端接口：`GET /api/app-manifest`（`server/lib/runtime.ts`）。

## 背景

- 网页前端（同源 SPA）靠 `credentials: same-origin` + Cookie 信任 `apiBase`，不主动校验服务端身份；
- **桌面客户端（Electron / Tauri / 本地原生壳）没有同源概念**，且登录不带本站会话 Cookie，无法走登录态；
- 因此需要一个**无需登录、可公开访问、但带签名**的端点，让客户端在发起真实请求前先验明服务端身份。

这就是 `/api/app-manifest` 的用途：**用共享密钥 `APP_SECRET` 计算签名，客户端重算并比对，一致才算本站点**。

## 接口：GET /api/app-manifest

公开接口，放在鉴权门槛之前（桌面端无会话可走）。接口不下发任何凭据、也不认 Cookie。

允许跨域（`Access-Control-Allow-Origin: *`），因为桌面应用来源不可预知；只读不写，不扩大攻击面。支持 `OPTIONS` 预检。

### 环境变量

| 变量 | 作用 |
| --- | --- |
| `APP_SECRET` | 签名密钥。**服务端持有，客户端也必须持有同一份才能验真，但绝不下发到任何接口** |
| `CIRCLECHAT_APP_ID` / `APP_ID` | 应用标识（缺省取 `package.json` 的 `name`） |
| `APP_VERSION` | 应用版本（缺省取 `package.json` 的 `version`） |

### 签名算法

```
signature = sha256( app_id + version + timestamp + APP_SECRET )
```

- `timestamp`：服务端当前秒级时间戳 `Math.floor(Date.now() / 1000)`；
- 拼接顺序固定为 `id → version → timestamp → secret`，无分隔符。

### 响应

成功（`200`）：

```json
{
  "app_id": "circlechat",
  "version": "1.2.3",
  "timestamp": 1789900000,
  "signature": "a1b2c3...（sha256 十六进制，64 位）"
}
```

| 字段 | 说明 |
| --- | --- |
| `app_id` | 应用标识，与 `CIRCLECHAT_APP_ID` 一致 |
| `version` | 服务端版本号 |
| `timestamp` | 服务端秒级时间戳，客户端可据此判断清单是否过期 |
| `signature` | 上述算法算出的签名 |

### 错误

- `503`（`app_secret_not_configured`）：`APP_SECRET` 未配置时，**一份都不发**——宁可接口不可用，也不返回无签名（可被伪造）的清单。

## 客户端校验流程

1. 启动时先 `GET /api/app-manifest`；
2. 客户端用自身内置的 `APP_SECRET`、以及响应里的 `app_id` / `version` / `timestamp`，**按同一算法**重算 `signature`；
3. 与响应中的 `signature` 比对：
   - 一致 → 确认对方真持有 `APP_SECRET`，即本站点，继续后续请求；
   - 不一致 / 请求失败 / 返回 `503` → 拒绝初始化并在控制台告警，绝不拿凭据去打疑似假服务端；
4. （可选）校验 `timestamp` 与本地时钟差，过滤被缓存 / 重放的过期清单。

> 关键点：伪造者没有 `APP_SECRET`，即使篡改 `app_id` / `version` 也拼不出正确签名，因此无法冒名本站点。**密钥的保密性就是验真强度**。

## 与 API Key 的区别

| 维度 | `/api/app-manifest` | API Key |
| --- | --- | --- |
| 目的 | 客户端验明**服务端**身份 | 服务端认证**调用方**身份 |
| 是否需要登录 | 否（公开） | 是（替代会话 Cookie） |
| 密钥方向 | 共享密钥，双方都持有 | 服务端存哈希，明文仅创建时给一次 |
| 主要使用者 | 桌面客户端 | 脚本 / 机器人 / 第三方集成 |

## 安全建议

1. **`APP_SECRET` 务必在所有部署环境配置一致**，否则桌面端验真会失败；
2. 桌面壳工程里内置的 `APP_SECRET` 视同私钥，不要进公开仓库 / 日志；
3. 若怀疑密钥泄漏，更换 `APP_SECRET` 即可让旧版客户端全部验真失败（需同步更新客户端内置值并重新发布）；
4. 网页端当前未使用本端点，仍依赖同源 Cookie 信任 `apiBase`；如需更强的端点真实性保障，可让网页端也走一次 `/api/app-manifest` 校验。

## 相关

- 鉴权分档与状态码见 [API 概览与鉴权](overview#鉴权方式)
- API Key 体系见 [API Key](apikeys)
