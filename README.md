#  cloudflare worker 加解密脚本 (初版)

https://github.com/bradyjoslin/encrypt-workers-kv

用于实现 Zola 静态博客的文章密码保护功能

集成 Cloudflare KV, 支持服务端加密存储

### 加密

```bash
curl -H 'x-app-password: password' -H 'content-type: text/plain' -X POST 'http://127.0.0.1:8787/encrypt' -d 'plain text'
```
```bash
curl -H 'x-app-kv: true' -H 'x-app-password: password' -H 'content-type: text/plain' -X POST 'http://127.0.0.1:8787/encrypt' -d 'plain text'
```

### 解密

```bash
curl -H 'content-type: application/json' -X POST 'http://127.0.0.1:8787/decrypt' -d '{"password": "password", "key": "key"}'
```

### 清空 KV

[adding secrets via wrangler](https://developers.cloudflare.com/workers/platform/environment-variables/#adding-secrets-via-wrangler)

`wrangler secret put TRUNCATE_SECRET`

```bash
curl -H 'x-app-truncate: YOUR_TRUNCATE_SECRET' -X POST 'http://127.0.0.1:8787/truncate'
```

## cloudflare worker example

https://developers.cloudflare.com/workers/examples/

## 脚本配置

https://developers.cloudflare.com/workers/cli-wrangler/configuration/

有个疑惑的地方，文档说 account_id 是必须的，但我不配置运行 wrangler dev 和 publish 好像也没问题

## 使用 wrangler

https://developers.cloudflare.com/workers/cli-wrangler/commands/

```bash
wrangler generate

wrangler login

wrangler dev

wrangler publish
```

## TODO

- [ ] webpack 不会用

虽然参考 [migrating-to-module-workers](https://developers.cloudflare.com/workers/learning/migrating-to-module-workers/) 把单文件 `index.js` 转成了模块项目

但是还是无法引入 npm 安装的第三方依赖，比如 [base64-arraybuffer](https://github.com/niklasvh/base64-arraybuffer)，只能拷贝文件 import

猜测应该是 webpack 需要额外配置

- [x] cloudflare modules 里使用 KV

参考 [durable-objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/#durable-object-lifespan)