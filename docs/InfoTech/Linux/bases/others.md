# 其他

修改计算机名 `nano /etc/hostname`，同时别忘了修改host `nano /etc/hosts`

## 修改时区

```bash
timedatectl set-timezone Asia/Shanghai
```

## 设置自动网络时间同步（NTP）

### 1. 检查当前状态

```bash
timedatectl
```

### 2. 安装 Chrony

```bash
sudo apt update
sudo apt install chrony
```

### 3. 启动并设置开机自启

```bash
sudo systemctl start chrony
sudo systemctl enable chrony
```

验证是否成功：

```bash
systemctl status chrony
```

### 4. 验证同步状态

查看时间源状态：

```bash
chronyc sources
```
