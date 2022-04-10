# ufw防火墙

## 安装

```bash
sudo apt update
sudo apt install ufw
```

## 配合docker

[解决 ufw 无法管理 Docker 发布出来的端口](https://github.com/chaifeng/ufw-docker)

## 禁止/启用ipv6

1. `sudo nano /etc/default/ufw`
2. 想禁用就修改`IPv6=no` 反之`yes`
3. 重启ufw :
    1. `sudo ufw disable`
    2. `sudo ufw enable`
