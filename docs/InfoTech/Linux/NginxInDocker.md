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

```nginx
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

```nginx
location /.well-known/acme-challenge/ {
    root /var/www/acme-challenges;
}
```

对于通配符证书是多余的，可以删掉。

### conf.d/snippets/proxy-common.conf

```nginx
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

```nginx
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

```nginx
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

### conf.d/code.your.domain.conf

这是 code-server 的配置文件，可以参考。

重点：修改 server_name 以匹配泛域名

这样 code.your.domain 和 3000.your.domain 都会进到这里

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    # 你的域名
    server_name code.your.domain *.your.domain;

    # 复用 SSL 配置
    include /etc/nginx/conf.d/snippets/ssl-common.conf;

    access_log /var/log/nginx/code_access.log;
    error_log /var/log/nginx/code_error.log warn;

    location / {
        # LinuxServer 镜像默认容器内监听 8443
        # 且在同一网络下，直接用服务名访问
        proxy_pass http://code-server:8443;

        # 复用通用 Header (包含 Host, Real-IP, WebSocket Upgrade)
        include /etc/nginx/conf.d/snippets/proxy-common.conf;

        # =========================================
        # code-server 专属优化
        # =========================================

        # 1. WebSocket 核心 (终端必须)
        # 你的 proxy-common.conf 已经包含了 Upgrade 和 Connection 头
        # 所以这里不需要重复写，但下面的超时必须加

        # 2. 长连接超时设置
        # 如果不设置，你在网页终端里写代码，过一会不动就会断开连接
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;

        # 3. 关闭缓冲
        # 保证终端输入输出的实时性
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

code-server 的 `docker-compose.yml` :

```yml
services:
  code-server:
    image: lscr.io/linuxserver/code-server:latest
    container_name: code-server
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - PASSWORD=YourPassword
      - PROXY_DOMAIN=your.domain
      - SUDO_PASSWORD=YourSudoPassword
    volumes:
      - ./config:/config
    #ports:
      #- 8443:8443
    restart: unless-stopped

networks:
  default:
    external: true
    name: scoobydoo
```

`code.your.domain.conf` 中的 `*.your.domain` 与 `docker-compose.yml` 中的 `- PROXY_DOMAIN=your.domain` 配合使用。

这样 code-server 支持通过子域名访问项目的端口，例如 `https://3000.your.domain/` ，

- 此时项目运行在域名的根目录 `/` 下，不再需要剥离 `/proxy/3000/` 前缀。
- 不需要更改项目配置，所有的懒编译、静态资源、路由都默认工作正常。
- 需要输入 code-server 的密码才能访问你的项目。
- 能够利用 `*.your.domain` 泛域名证书，不用再单独为 `*.code.your.domain` 创建新的证书。

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

## 进阶：隐藏源站 IP 防止网络测绘（Security）

在使用 CDN（如 Cloudflare）时，我们希望攻击者无法直接通过 IP 访问到源站。但如果 Nginx 配置不当，网络空间测绘引擎（如 Fofa、Shodan）扫描全网 IP 的 443 端口时，Nginx 会默认返回包含你真实域名的 SSL 证书。这样，攻击者就能通过“IP 反查域名”找到你的源站 IP。

为了解决这个问题，我们需要利用 Nginx 的 `default_server` 机制，配合一个“假证书”来欺骗扫描器。

### 1. 生成自签名“假证书”

我们需要生成一个与真实域名无关的自签名证书。

在宿主机创建的 `certs` 目录下执行以下命令（注意：CN 我们填了 127.0.0.1，千万不要填真实域名）

生成有效期 10 年的自签名假证书（注意在 `certs` 的父目录下执行）：

```bash
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
-keyout certs/fake.key \
-out certs/fake.crt \
-subj "/C=US/ST=Fake/L=Fake/O=Fake/CN=127.0.0.1"
```

确保 `certs` 目录已正确挂载到 Docker 容器内的 `/etc/nginx/certs`。

### 2. 升级默认配置文件

我们将原来的 `00-default-http.conf` 改造为 `00-default-protection.conf`。这个配置文件的作用是：**当有人直接访问 IP，或者访问未绑定的域名时，直接拒绝连接或返回假证书。**

**conf.d/00-default-protection.conf** :

```nginx
# --------------------------------------------------------
# 1. 默认捕获：直接 IP 访问 HTTP (80) -> 直接拒绝
# --------------------------------------------------------
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    # 匹配所有未定义的域名或直接 IP 访问
    server_name _;
    
    # 返回 444 代表 Nginx 直接关闭连接，不返回任何 HTTP 头部，节省资源
    return 444;
}

# --------------------------------------------------------
# 2. 默认捕获：直接 IP 访问 HTTPS (443) -> 防止测绘的关键
# --------------------------------------------------------
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    
    server_name _;
    
    # 【关键】使用刚才生成的假证书
    # 扫描器扫描 IP 时，只会看到这张假证书，无法关联到你的真实域名
    ssl_certificate /etc/nginx/certs/fake.crt;
    ssl_certificate_key /etc/nginx/certs/fake.key;
    
    # 握手完成后直接关闭连接
    return 444;
}

# --------------------------------------------------------
# 3. 正常业务：域名访问 HTTP (80) -> 强制跳转 HTTPS
# --------------------------------------------------------
server {
    listen 80;
    listen [::]:80;
    
    # 只有明确匹配到你的域名时，才进行跳转
    server_name *.your.domain your.domain;

    location / {
        return 301 https://$host$request_uri;
    }
}
```

### 3. 核心注意事项（非常重要）

配置了上述 `default_server` 后，必须遵循一条铁律：

**所有其他的业务配置文件（如 `cloudreve.your.domain.conf`、`code.your.domain.conf`）中，`listen` 指令绝对不能包含 `default_server` 标记。**

Nginx 规定对于同一个端口（如 443），只能有一个 `default_server`。如果其他配置文件里写了 `listen 443 ssl default_server;`，Nginx 启动时会报错 `duplicate default_server`。

**正确的业务配置示例 (app.your.domain.conf)：**

```nginx
server {
    # 这里的 listen 不要加 default_server
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    # 你的域名
    server_name app.your.domain;

    # 复用 SSL 配置
    include /etc/nginx/conf.d/snippets/ssl-common.conf;

    # 日志
    access_log /var/log/nginx/app_access.log;
    error_log /var/log/nginx/app_error.log warn;

    location / {
        # 在同一网络下，直接用服务名加端口号访问
        proxy_pass http://app:8443;

        # 复用通用 Header (包含 Host, Real-IP, WebSocket Upgrade)
        include /etc/nginx/conf.d/snippets/proxy-common.conf;

        # 其他配置
    }
}
```

配置生效后，你可以尝试直接访问 `https://你的IP`，浏览器会警告证书错误，且证书信息显示为 `Fake`，证明你的真实域名已被成功隐藏。

## 附：WebSocket 代理

假定把代理服务放在 `code.your.domain` 下，路径为 `/your_secret_path`

**conf.d/code.your.domain.conf** :

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    # 你的域名
    server_name code.your.domain *.your.domain;

    # 复用 SSL 配置
    include /etc/nginx/conf.d/snippets/ssl-common.conf;

    access_log /var/log/nginx/code_access.log;
    error_log /var/log/nginx/code_error.log warn;

    location / {
        # LinuxServer 镜像默认容器内监听 8443
        # 且在同一网络下，直接用服务名访问
        proxy_pass http://code-server:8443;

        # 复用通用 Header (包含 Host, Real-IP, WebSocket Upgrade)
        include /etc/nginx/conf.d/snippets/proxy-common.conf;

        # =========================================
        # code-server 专属优化
        # =========================================

        # 1. WebSocket 核心 (终端必须)
        # 你的 proxy-common.conf 已经包含了 Upgrade 和 Connection 头
        # 所以这里不需要重复写，但下面的超时必须加

        # 2. 长连接超时设置
        # 如果不设置，你在网页终端里写代码，过一会不动就会断开连接
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;

        # 3. 关闭缓冲
        # 保证终端输入输出的实时性
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # ===============================
    #      秘密通道 (s-ui 分流)
    # ===============================
    location /your_secret_path {
        proxy_pass http://s-ui:10000;

        # 1. 基础 WebSocket 必须头
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;

        # 2. 传递真实 IP (配合 s-ui 日志或审计)
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # =========================================
        # 核心优化部分
        # =========================================

        # 3. 关闭缓冲 (极重要：降低延迟)
        # Nginx 默认会缓存后端的数据。对于代理流量，我们希望数据来了立马转给客户端。
        # 开启这个可以显著降低延迟，提升浏览网页和看视频的流畅度。
        proxy_buffering off;

        # 4. 延长超时时间 (极重要：防止断连)
        # Nginx 默认 60秒 无数据传输就切断连接。
        # 挂梯子时（特别是 SSH 或看长视频暂停时），容易因此意外断开。
        # 设置为一天 (86400s) 确保连接极其稳定。
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;

        # 5. 支持 Xray/Sing-box 的 0-RTT (Early Data)
        # 这可以让连接建立更快。如果不透传这些头，Early Data 功能会失效。
        # 客户端需设置 Max Early Data > 0 才能生效。
        proxy_set_header Sec-WebSocket-Key $http_sec_websocket_key;
        proxy_set_header Sec-WebSocket-Extensions $http_sec_websocket_extensions;
        proxy_set_header Sec-WebSocket-Accept $http_sec_websocket_accept;
        proxy_set_header Sec-WebSocket-Protocol $http_sec_websocket_protocol;

        # 6. 禁用重定向处理
        # 代理隧道不需要 Nginx 去处理 301/302 跳转，直接透传即可。
        proxy_redirect off;
    }
}
```
