# 消息与上传

历史消息查询与文件上传。**发送 / 撤回 / 回应等实时操作走 WebSocket**，见[WebSocket 协议](websocket.md)。

## GET /api/messages?gid=\<gid\> 或 ?dm=\<username\>

查询某个房间的历史消息。

- 传 `gid`：群聊消息。
- 传 `dm`：与某用户的私聊消息（需是好友且不能是自己）。

响应：

```json
{
  "ok": true,
  "messages": [
    {
      "idx": 100,
      "from": "alice",
      "type": "text",
      "content": "你好",
      "ts": 1789900000000,
      "md": 0,
      ...
    }
  ],
  "max": 500
}
```

权限：私聊须为合法用户（`404` 用户不存在、`403` 不能查看自己）；群聊须是群成员（否则 `403`）。每房间最多保留最近 **500** 条消息。

> 消息 `type` 取值：`text` / `image` / `file` / `video` / `audio` / `merge`（合并转发）。

---

## 文件上传

支持**单次上传**（小文件）与**分片断点续传**（大文件）。单文件上限 **100MB**（`MAX_UPLOAD`），分片大小 **5MB**（`CHUNK_SIZE`）。

### POST /api/upload —— 小文件单次上传

单文件消息体为 `multipart/form-data`（**≤ 5MB**，大于则走分片接口）。`content-length` 声明超限直接返回 `413`（避免传完才报错）。

- 校验：上传类型白名单 + 图片魔数嗅探（`sniffImage`）+ 路径穿越防护。
- 归档：统一归类 / 去重 / 命名（`finalizeUpload`），同类文件可能被去重（`deduped`）。

响应：

```json
{
  "ok": true,
  "kind": "image",
  "url": "/uploads/xxxx.png",
  "name": "photo.png",
  "size": 123456,
  "deduped": false
}
```

错误：`400`（非 multipart / 无文件 / 失败）、`413`（超限）。

### 分片上传流程

大文件分四步：

1. **`POST /api/upload/init`** —— 开启会话。
2. **`POST /api/upload/chunk?uploadId=&index=`** —— 逐片上传。
3. **`POST /api/upload/complete`** —— 合并落盘。
4. **`POST /api/upload/abort`** —— 中止 / 清理（出错时）。

### POST /api/upload/init

请求体：

```json
{ "name": "video.mp4", "size": 104857600, "uploadId": "" }
```

- 带 `uploadId` 表示**续传**：会话归属与体积一致时复用，返回已收到分片序号，客户端只需补传缺失片。
- 无 `uploadId` 则新建会话。

响应（新建）：

```json
{ "ok": true, "uploadId": "...", "chunkSize": 5242880, "chunks": 20, "received": [] }
```

响应（续传）会带 `received` 已收分片索引。

错误：`413`（`api.upload.tooLarge` 尺寸不合法）。

### POST /api/upload/chunk?uploadId=\<id\>&index=\<n\>

上传单片，`multipart/form-data`，文件字段名 `file`。

- 会话必须存在且属于当前账号，否则 `404`（`api.upload.sessionGone`，客户端需重新 `init`）。
- `index` 必须在 `[0, chunks)` 内，否则 `400`（`api.upload.badChunk`）。
- 单片请求体超限返回 `413`。

### POST /api/upload/complete

分片齐全后合并落盘（分类 / 去重 / 命名，同单次上传）。

请求体：

```json
{ "uploadId": "..." }
```

响应同单次上传（`kind` / `url` / `name` / `size` / `deduped`）。

### POST /api/upload/abort

请求体：

```json
{ "uploadId": "..." }
```

清理未完结会话的临时数据。

---

## 上传安全约束（汇总）

- 类型白名单 + 图片魔数校验 + 路径穿越防护。
- 文件 / 图片等消息的 `content` 必须是本服务器上传目录的合法 URL（`/uploads/...`），防 `javascript:` 伪造。
- `merge`（合并转发）为结构化 JSON：仅做格式与大小校验（≤ 100 条、≤ 8000 字符）。