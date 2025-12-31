# code-server端口转发与vite配合

code-server端口转发与vite配合来实现浏览器访问

```js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const serverPort = 5173
const serverHost = 'code-server.your.domain'
const proxyUrl = `/proxy/${serverPort}`

// https://vite.dev/config/
export default defineConfig({
  // 1. 必须设置为绝对路径，确保 App.vue 等内部引用路径正确
  base: `${proxyUrl}/`,
  plugins: [
    vue(),
    vueDevTools(),
    // 【核心修复插件】
    {
      name: 'fix-code-server-proxy-path',
      configureServer(server) {
        // A. 修复普通页面请求 (HTTP)
        server.middlewares.use((req, res, next) => {
          // Code-server 把请求传过来时，已经把 /proxy/5173 切掉了
          // 比如浏览器请求 /proxy/5173/src/main.js，Vite 收到的是 /src/main.js
          // 我们手动把前缀补回去，骗过 Vite，让它以为请求是完整的
          if (req.url && !req.url.startsWith(proxyUrl)) {
            req.url = proxyUrl + req.url;
          }
          next();
        });

        // B. 修复热更新连接 (WebSocket)
        // 必须使用 prependListener 确保在 Vite 内部逻辑之前执行
        server.httpServer?.prependListener('upgrade', (req, socket, head) => {
          if (req.url && !req.url.startsWith(proxyUrl)) {
            // 强行把被 code-server 切掉的前缀补回去
            // 比如收到 '/', 改回 '/proxy/5173/'
            req.url = proxyUrl + req.url;
          }
        });

        // C. 修复控制台显示的地址
        const _print = server.printUrls;
        server.printUrls = () => {
          // 先调用原有的打印逻辑
          _print();
          // 然后补充一个醒目的外部访问地址
          console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mExternal\x1b[0m: \x1b[36mhttps://${serverHost}${proxyUrl}\x1b[0m`);
        };
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: serverPort,
    allowedHosts: [serverHost],
    hmr: {
      host: serverHost,
      protocol: 'wss', // 因为是 https，必须用 wss
      clientPort: 443, // 浏览器看到的端口是 https 的 443
      // ⚠️ 关键修改：【删除】path 字段
      // 不要在这里写 path: proxyUrl + '/'，否则会出现重复路径
      // 让 Vite 根据 base 自动推导即可
    }
  }
})
```

请自行更换 端口 `5173`、域名 `code-server.your.domain`、代理路径 `/proxy/5173`

这样浏览器访问 `https://code-server.your.domain/proxy/5173/` 就可以访问正常访问页面和热更新了
