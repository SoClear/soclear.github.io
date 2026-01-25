# Cloudflare Tunnel 优选 IP 与 Docker 多服务部署指南

假定你的域名为 `your.domain` 已经托管在 Cloudflare 上。

## 1. 架构概述

本方案旨在解决直接连接 Cloudflare Tunnel 速度慢、延迟高的问题。通过 **Cloudflare for SaaS** 功能，配合 **Nginx 反向代理**，实现以下目标：

1. **网络加速**：用户通过“自选 IP”或“第三方优选域名”访问服务。
2. **流量穿透**：流量经优选线路进入 Cloudflare 边缘，再通过 Tunnel 穿透至内网，无需公网 IP。
3. **统一路由**：Docker 内部运行 Nginx 作为网关，根据域名将流量分发到不同的容器。

**流量路径：**
`用户` -> `优选 IP/域名 (DNS Only)` -> `Cloudflare 边缘` -> `Tunnel` -> `Nginx (Docker)` -> `Code-Server (Docker)`

## 2. Cloudflare 设置 (控制台端)

### 2.1 修改 Tunnel 回源 (Zero Trust 面板)

我们需要将 Tunnel 指向 Docker 内的 Nginx，而不是直接指向具体的服务。

1. 进入 **Zero Trust** -> **Networks** -> **Tunnels**。
2. 配置你的 Tunnel，进入 **Public Hostname** 标签页。
3. **删除**原有的所有记录。
4. **添加**一个新的“幕后”回源域名（仅用于 Tunnel 连接，不对外公开）：
    - **Public Hostname**: `origin.your.domain` (举例)
    - **Service**: `http://nginx:80`
    - *注意：这里填写 `nginx` 是因为 Tunnel 容器和 Nginx 容器在同一个 Docker 网络中，可以直接用容器名访问。*

### 2.2 开启 Cloudflare for SaaS (域名管理面板)

此步骤是为了允许通过“优选 IP”访问 Tunnel。

1. 在 Cloudflare 首页选择域名 `your.domain`。
2. 进入 **SSL/TLS** -> **Custom Hostnames**。
3. 点击 **Enable Cloudflare for SaaS** (需绑定支付方式，前100个域名免费)。
4. **设置回源源站 (Fallback Origin)**:
    - 输入：`origin.your.domain` (即步骤 2.1 设置的域名)。
    - 点击 Add Fallback Origin，等待状态变为 **Active**。

### 2.3 添加自定义主机名 (目标域名)

1. 在 **Custom Hostnames** 页面，点击 **Add Custom Hostname**。
2. 输入你实际要访问的域名：`code.your.domain`。
3. 验证方式选择 TXT（通常自动通过）。
4. 等待状态变为 **Active**。

### 2.4 配置 DNS (选择一种方式)

此处决定了用户如何连接到 Cloudflare。

#### 方式一：手动指定优选 IP (A 记录)

*适合想要极致控制，自己通过测速工具筛选 IP 的用户。*

1. 进入 **DNS** -> **Records**。
2. 添加记录：
    - **Type**: `A`
    - **Name**: `code`
    - **Content**: `104.16.x.x` (填入你测速筛选出的 IP)。
    - **Proxy status**: **DNS Only (灰云)** (必须关闭代理)

#### 方式二：使用优选 CNAME (CNAME 记录)

*适合不想频繁测速，使用第三方维护好的优选线路（如 `www.shopify.com`）。*

寻找优选 CNAME 的网站：

- [CloudFlare公共优选Cname域名地址](https://www.wetest.vip/page/cloudflare/cname.html)
- [enhanced-FaaS-in-China](https://github.com/xingpingcn/enhanced-FaaS-in-China)

1. 进入 **DNS** -> **Records**。
2. 添加记录：
    - **Type**: `CNAME`
    - **Name**: `code`
    - **Target**: `优选域名地址` (例如第三方提供的 `www.shopify.com`)。
    - **Proxy status**: **DNS Only (灰云)** (必须关闭代理)

## 3. Docker 环境配置 (服务器端)

假设所有服务都在 `scoobydoo` 网络下。

### 3.1 Docker Compose 示例 (`docker-compose.yml`)

```yaml
version: '3'

networks:
  scoobydoo:
    external: true # 使用已存在的网络

services:
  # --- 网关层: Nginx ---
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: always
    networks:
      - scoobydoo
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf

  # --- 穿透层: Cloudflared ---
  tunnel:
    image: cloudflare/cloudflared
    container_name: cloudflared
    restart: always
    networks:
      - scoobydoo
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=你的Tunnel_Token

  # --- 应用层: Code-Server ---
  code-server:
    image: linuxserver/code-server
    container_name: code-server
    restart: always
    networks:
      - scoobydoo
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    volumes:
      - ./code-config:/config
```

---

## 4. Nginx 动态路由配置

这是实现多服务复用的核心。Nginx 根据 Cloudflare 传递过来的 `X-Forwarded-Host` 头部判断用户访问的是哪个域名，并转发给对应的 Docker 容器。

**文件：`nginx.conf`**

```nginx
# 使用 Docker 内置 DNS 解析容器名 (必须配置，否则无法解析 host)
resolver 127.0.0.11 valid=30s;

# --- 域名映射表 ---
# 格式: "域名" "容器名:端口"
map $http_x_forwarded_host $backend_upstream {
    # Code-Server 服务
    "code.your.domain"       "code-server:8443";
    
    # 未来添加的其他服务 (示例)
    # "blog.your.domain"     "wordpress:80";
    # "openlist.your.domain"    "openlist:5244";

    # 默认回落 (防止未知域名请求)
    default             "nginx:80"; 
}

server {
    listen 80;
    # 监听 Tunnel 的回源域名
    server_name origin.your.domain;

    location / {
        # --- 核心转发逻辑 ---
        # 使用 map 定义的变量进行动态转发
        proxy_pass http://$backend_upstream;

        # --- WebSocket 支持 (Code-Server 必须) ---
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # --- 传递真实头部信息 ---
        # 重要：还原用户访问的真实域名，否则后端应用可能会跳转错误
        proxy_set_header Host $http_x_forwarded_host;
        
        # 传递 IP 信息
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. 如何添加新服务 (扩展指南)

当你想在 VPS 上部署第二个服务（例如 openlist）并同样使用优选 IP 加速时，只需执行以下步骤：

1. **部署容器**：
    - 启动 openlist 容器，确保加入 `scoobydoo` 网络，设置 `container_name: openlist`。
2. **Cloudflare 配置**：
    - 在 **Custom Hostnames** 中添加 `openlist.your.domain`。
    - 在 **DNS** 中添加 `openlist` 的 A 记录 (或 CNAME 记录) 指向优选地址 (DNS Only)。
3. **Nginx 配置**：
    - 修改 `nginx.conf`，在 `map` 块中增加一行：

        ```nginx
        "openlist.your.domain"    "openlist:5244";
        ```

    - 检查配置：`docker compose exec nginx nginx -t`
    - 重载 Nginx：`docker compose exec nginx nginx -s reload`

## 6. 故障排查

- **502 Bad Gateway**:
  - 检查 Nginx 里的 `resolver 127.0.0.11` 是否已配置。
  - 检查 `map` 里的容器名是否与 `docker ps` 显示的名称一致。
  - 检查 Tunnel 里的 Service 是否指向了 `http://nginx:80`。
- **Code-Server 频繁断连**:
  - 如果使用优选 IP (A记录)，尝试更换其他 IP。
  - 如果使用优选 CNAME，尝试更换其他优选域名提供商，或改回手动 IP 模式。
  - 确保 Nginx 配置中保留了 `Upgrade` 和 `Connection` 头（WebSocket 配置）。
- **SSL 证书错误**:
  - 在 Custom Hostnames 页面检查该域名的 SSL Status 是否为 Active。如果是 Initializing，请等待片刻。
