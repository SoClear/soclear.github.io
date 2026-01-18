# 在 Docker 中使用 Nginx

虽然已经有可视化配置 Nginx 的项目了，比如 [nginx-proxy-manager](https://github.com/NginxProxyManager/nginx-proxy-manager) 和 [Zoraxy](https://github.com/tobychui/zoraxy) ，但是遇到问题难以排查，而且占用资源相比纯 Nginx 更多。对于 IT 从业者来说，学会配置 Nginx 还是很有用的。

假定域名为 `your.domain` ，想要运行 cloudreve、code-server、ntfy

首先展示最终的目录结构：

```txt
root@debian:~/container/nginx# tree
.
├── acme
│   ├── account.conf
│   ├── ca
│   │   └── acme.zerossl.com
│   │       └── v2
│   │           └── DV90
│   │               ├── account.json
│   │               ├── account.key
│   │               └── ca.conf
│   ├── your.domain_ecc
│   │   ├── backup
│   │   │   └── key.bak
│   │   ├── ca.cer
│   │   ├── your.domain.cer
│   │   ├── your.domain.conf
│   │   ├── your.domain.csr
│   │   ├── your.domain.csr.conf
│   │   ├── your.domain.key
│   │   └── fullchain.cer
│   └── http.header
├── certs
│   ├── your.domain.key
│   └── your.domain.pem
├── conf.d
│   ├── 00-default-http.conf
│   ├── cloudreve.your.domain.conf
│   ├── code.your.domain.conf
│   ├── ntfy.your.domain.conf
│   └── snippets
│       ├── proxy-common.conf
│       └── ssl-common.conf
├── docker-compose.yml
├── html
├── logs
│   ├── access.log
│   ├── cloudreve_access.log
│   ├── cloudreve_error.log
│   ├── code_access.log
│   ├── code_error.log
│   ├── error.log
│   ├── ntfy_access.log
│   └── ntfy_error.log
└── README.md
```

## Nginx 配置文件

创建目录：`mkdir -p acme certs conf.d html logs`

创建 Nginx 配置文件：

### conf.d/00-default-http.conf

```conf
# HTTP 默认配置 - 处理所有 your.domain 的子域名
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name *.your.domain your.domain;

    # 可选：保留 HTTP 验证路径（作为备用方案）
    # location /.well-known/acme-challenge/ {
    #    root /var/www/acme-challenges;
    # }

    # 强制跳转 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
```

这是一个默认的配置，用于处理所有 your.domain 的子域名，比如 `api.your.domain` `cloudreve.your.domain` `code.your.domain` `ntfy.your.domain` 。

通配符证书（*.your.domain）强制要求使用 DNS 验证（DNS-01 Challenge），无法通过 HTTP 文件验证（HTTP-01 Challenge）申请。

所以 `00-default-http.conf` 里的

```conf
location /.well-known/acme-challenge/ {
    root /var/www/acme-challenges;
}
```

对于通配符证书是多余的，可以删掉。

### conf.d/snippets/proxy-common.conf

```conf
# 公共代理配置，所有反向代理都可以引用

# 默认情况下 Nginx 使用 HTTP/1.0 连接后端，而 WebSocket 必须使用 HTTP/1.1
# 必须指定 HTTP 1.1，否则 WebSocket 无法握手
proxy_http_version 1.1;

# 允许客户端上传无限大小的请求体（解决 413 Request Entity Too Large）
client_max_body_size 0;

proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# WebSocket 支持
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### conf.d/snippets/ssl-common.conf

```conf
# 公共 SSL 配置，所有 HTTPS server 都可以引用

ssl_certificate /etc/nginx/certs/your.domain.pem;
ssl_certificate_key /etc/nginx/certs/your.domain.key;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;

ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# 安全响应头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### conf.d/cloudreve.your.domain.conf 示例

这是一个 Cloudreve 的配置文件，可以参考。

```conf
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    server_name cloudreve.your.domain;

    include /etc/nginx/conf.d/snippets/ssl-common.conf;

    access_log /var/log/nginx/cloudreve_access.log;
    error_log /var/log/nginx/cloudreve_error.log warn;

    location / {
        # 你的后端服务地址
        # 如果是本机其他容器，请使用 IP 或 Docker 网络名
        proxy_pass http://cloudreve:5212;

        include /etc/nginx/conf.d/snippets/proxy-common.conf;

        # =========================================
        # 1. 缓存控制 (全部关闭)
        # =========================================
        # 禁止 Nginx 将后端响应存入磁盘缓存 (防止权限泄露和磁盘爆满)
        proxy_cache off;

        # 关闭响应缓冲 (针对下载优化)
        # 让 Nginx 收到数据就立即发给客户端，而不是存满内存缓冲区再发
        # 解决下载大文件时内存飙升或卡顿的问题
        proxy_buffering off;

        # =========================================
        # 2. 上传控制 (针对上传优化)
        # =========================================
        # 关闭请求缓冲 (核心配置)
        # 允许 Cloudreve 边接收边处理，支持超大文件流式上传
        proxy_request_buffering off;

        # 解除上传大小限制
        client_max_body_size 0;

        # =========================================
        # 3. 连接保活 (防止断连)
        # =========================================
        # 针对极差网络环境，给予充足的时间
        proxy_connect_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_read_timeout 86400s;
    }
}
```

## Cloudflare API Token

在 [Cloudflare API Token](https://dash.cloudflare.com/profile/api-tokens) 点击创建令牌，点击 `编辑区域 DNS` 后面的模板，权限分别选择 `区域` `DNS` `编辑` ，区域资源选择 `包括` `特定区域` `你的域名` ，点击底部的 `继续以显示摘要` ，将会显示 API Token，复制下来，关闭页面就再也不会显示了。

## docker-compose.yml

```yml
services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./conf.d:/etc/nginx/conf.d
      - ./certs:/etc/nginx/certs
      - ./html:/usr/share/nginx/html
      - ./logs:/var/log/nginx
    command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"

  acme:
    image: neilpang/acme.sh:latest
    container_name: acme
    restart: unless-stopped
    command: daemon
    volumes:
      - ./acme:/acme.sh  # acme.sh 工作目录
      - ./certs:/certs   # 证书输出目录
    environment:
      # Cloudflare API Token（替换成你的）
      # 在 https://dash.cloudflare.com/profile/api-tokens 生成
      - CF_Token=_your_cloudflare_api_token

networks:
  default:
    external: true
    name: scoobydoo
```

注意底部的

```yml
networks:
  default:
    external: true
    name: scoobydoo
```

默认加入外部网络 `scoobydoo`，当然名字可以自定义。这样每个加入该网络的容器都可以互相访问到了。

如果没有该网络，则需手动创建该网络：`docker network create scoobydoo`

## 申请通配符证书

`docker compose up -d` 启动容器后，Nginx 会不断重启，这是正常现象，因为还没配置证书，`acme.sh` 能用就行。

注意下面的代码仅需执行一次，以后 `acme.sh` 会自动更新证书。

### 注册账户

ZeroSSL（acme.sh 现在的默认 CA）强制要求注册邮箱

```sh
docker exec acme acme.sh --register-account -m youremail@gmail.com
```

### 申请通配符证书

执行：

```sh
docker exec acme --issue \
  --dns dns_cf \
  -d your.domain \
  -d '*.your.domain' \
  --keylength ec-256 \
  --force
```

来申请证书。加了 `--force` 是为了如果之前执行失败了，则覆盖掉之前失败的空记录

### 部署证书到 nginx 目录

```sh
docker exec acme --install-cert -d your.domain \
  --key-file /certs/your.domain.key \
  --fullchain-file /certs/your.domain.pem \
  --reloadcmd "echo 'Certificate updated via acme.sh'"
```

最后执行 `docker compose restart` 重启容器，Nginx 就会自动加载证书。大功告成啦。

## 新建反向代理

1. 在 `./conf.d/` 新建 `名字.your.domain.conf` 并配置。
2. 检查配置：`docker compose exec nginx nginx -t`
3. 重载 Nginx：`docker compose exec nginx nginx -s reload`
