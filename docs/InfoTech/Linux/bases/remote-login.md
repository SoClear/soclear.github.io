# 远程登录

## ssh登录远程主机

ssh默认端口为22  
`ssh -p 端口 远程主机用户名@IP地址`

## 使用密钥登录

1. 生成密钥 `ssh-keygen -t rsa`  
一路回车，在`$HOME/.ssh/`中就可以看到生产的公钥 `id_rsa.pub` 和私钥 `id_rsa`  
2. 复制到远程主机的`$HOME/.ssh/authorized_keys`：  
`ssh-copy-id -i 【公钥路径】 -p 端口 远程主机用户名@IP地址`

## 禁用密码登录、修改端口

`nano /etc/ssh/sshd_config`

```bash
#禁用密码验证
PasswordAuthentication no
#启用密钥验证
PubkeyAuthentication yes
#修改端口
Port 【自定义端口号，最大不能超过65535】
```

保存并退出，重启ssh服务

```bash
#centos系统
service sshd restart
#ubuntu系统
service ssh restart 
#debian系统
/etc/init.d/ssh restart 
```

## 远程复制scp

### 复制本地文件到远程主机

`scp -P 【端口】 【本地文件路径】 【远程用户名】@【IP】:【远程文件路径】`

### 复制远程主机文件到本地

`scp -P 【端口】 【远程用户名】@【IP】:【远程文件路径】 【本地文件路径】`
