# 为三星 Note20 Ultra 编译支持 Docker 的内核

前提：

使用 Ubuntu ，是否虚拟机，是否有图形界面均可。

已经在 [Samsung Open Source](https://opensource.samsung.com/uploadSearch?searchValue=sm-n9860) 下载了 三星 Note20 Ultra（SM-N9860）的内核源码，并把其中的 `Kernel` 解压了出来。

假定源码在 `~/Project/Kernel` 目录下，编译依赖放在 `~/Project/toolchains` 目录下。

## 安装编译依赖

安装基本编译工具：

```bash
sudo apt install -y build-essential bc bison flex libssl-dev libncurses5-dev libelf-dev git python-is-python3
```

进入 `toolchains` 目录

```bash
cd ~/Project/toolchains
```

1. 克隆 linux-x86(clang-llvm)

    ```bash
    git clone --branch android12-release --single-branch --depth 1 https://android.googlesource.com/platform/prebuilts/clang/host/linux-x86
    ```

2. 克隆 aarch64-linux-android-4.9

    ```bash
    git clone --branch android12-release --single-branch --depth 1 https://android.googlesource.com/platform/prebuilts/gcc/linux-x86/aarch64/aarch64-linux-android-4.9
    ```

3. 克隆 arm-linux-androideabi-4.9

    ```bash
    git clone --branch android12-release --single-branch --depth 1 https://android.googlesource.com/platform/prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.9
    ```

## changes

编辑 `~/Project/Kernel/arch/arm64/configs/vendor/c2q_chn_hkx_defconfig`

comment all `Control Flow Protection` section

```ini
#
# Control Flow Protection
#
# CONFIG_CFP=y
# CONFIG_CFP_JOPP=y
# CONFIG_CFP_JOPP_MAGIC=0x00be7bad
# CONFIG_CFP_ROPP=y
# CONFIG_CFP_ROPP_SYSREGKEY=y
# CONFIG_CFP_ROPP_RANDKEY is not set
# CONFIG_CFP_ROPP_FIXKEY is not set
# CONFIG_CFP_ROPP_ZEROKEY is not set
# CONFIG_CFP_TEST is not set
```

## -Werror 改为 -Wno-error

显示所有的 -Werror : `grep -r --include="Makefile" -e "-Werror" drivers`

把所有的 -Werror 替换为 -Wno-error：

修改 drivers 目录下所有 Makefile 中的 -Werror 为 -Wno-error

```sh
find drivers -name "Makefile" -print0 | xargs -0 sed -i 's/-Werror/-Wno-error/g'
```

可选修改 techpack 目录（高通驱动重灾区）下所有 Makefile 中的 -Werror 为 `-Wno-error`

```sh
find techpack -name "Makefile" -print0 | xargs -0 sed -i 's/-Werror/-Wno-error/g'
```

## build.sh

创建 `~/Project/Kernel/build.sh`

```sh
#!/bin/bash

# ==========================================
#      Samsung Note 20 Ultra (SM-N9860)
#               Build Script
# ==========================================

# 1. 路径配置
# ------------------------------------------
PROJECT_ROOT="$HOME/Project"
CLANG_DIR="$PROJECT_ROOT/toolchains/linux-x86/clang-r416183b1/bin"
GCC64_DIR="$PROJECT_ROOT/toolchains/aarch64-linux-android-4.9/bin"
GCC32_DIR="$PROJECT_ROOT/toolchains/arm-linux-androideabi-4.9/bin"

# 2. 检查环境
# ------------------------------------------
if ! command -v make &> /dev/null; then
    echo "错误: 系统未安装 'make'。"
    echo "请执行: sudo apt install build-essential"
    exit 1
fi

if [ ! -d "$CLANG_DIR" ]; then
    echo "错误: Clang 路径不对 -> $CLANG_DIR"
    exit 1
fi

# 3. 设置环境变量
# ------------------------------------------
export PATH=$CLANG_DIR:$GCC64_DIR:$GCC32_DIR:$PATH
export ARCH=arm64

# 指定项目代号，避免 techpack 编译所有设备的驱动
export PROJECT_NAME=c2q

# 强行注入：关闭错误提示，忽略原型检查
export KCFLAGS="-Wno-error -Wno-error=strict-prototypes -Wno-error=implicit-function-declaration -Wno-strict-prototypes -fno-builtin-stpcpy"
export HOSTCFLAGS="-Wno-strict-prototypes -Wno-error -fcommon"

export SUBARCH=arm64
export KBUILD_BUILD_USER="builder"
export KBUILD_BUILD_HOST="localhost"

# 4. 核心配置 (精准匹配你的 c2q_chn_hkx)
# ------------------------------------------
# 你提供的 tree 显示配置文件在 arch/arm64/configs/vendor/c2q_chn_hkx_defconfig
# Make 会自动在 arch/arm64/configs 下寻找，所以我们要传给它 vendor/c2q_chn_hkx_defconfig
DEFCONFIG="vendor/c2q_chn_hkx_defconfig"

echo "-------------------------------------"
echo "机型: Note 20 Ultra (Snapdragon 865+)"
echo "目标: SM-N9860 (国行/港版)"
echo "配置: $DEFCONFIG"
echo "-------------------------------------"

# 高通版 techpack 检查
if [ ! -d "techpack" ]; then
    echo "!!!! 严重警告 !!!!"
    echo "根目录下未检测到 'techpack' 文件夹。"
    echo "如果编译报错提示 qc_ 找不到，请去源码包里找 techpack 并解压过来。"
    echo "-------------------------------------"
    sleep 3
fi

# 5. 定义编译器参数
# ------------------------------------------
ARGS="O=out \
      ARCH=arm64 \
      CC=clang \
      CLANG_TRIPLE=aarch64-linux-gnu- \
      CROSS_COMPILE=aarch64-linux-android- \
      CROSS_COMPILE_ARM32=arm-linux-androideabi-"

# 6. 执行编译
# ------------------------------------------
echo ">> [1/3] 清理构建环境..."
make clean
make mrproper
rm -rf out

echo ">> [2/3] 加载配置: $DEFCONFIG"
mkdir -p out
make $ARGS $DEFCONFIG

if [ $? -ne 0 ]; then
    echo "错误: 配置文件加载失败！"
    echo "请确认 arch/arm64/configs/$DEFCONFIG 真的存在。"
    exit 1
fi

echo ">> [3/3] 开始编译..."
CORES=$(nproc)
echo "cores: $CORES"
make -j$CORES $ARGS Image.gz-dtb
# make -j1 KCFLAGS="$KCFLAGS" $ARGS Image.gz-dtb
# make -j32 KCFLAGS="$KCFLAGS" $ARGS Image.gz-dtb

# 7. 结果反馈
# ------------------------------------------
TARGET="out/arch/arm64/boot/Image.gz-dtb"

if [ -f "$TARGET" ]; then
    echo "=================================================="
    echo "   编译成功 (BUILD SUCCESS)"
    echo "=================================================="
    echo "内核文件位置: $PWD/$TARGET"
else
    echo "=================================================="
    echo "   编译失败 (BUILD FAILED)"
    echo "=================================================="
fi
```

先在 `~/Project/Kernel` 目录下执行 `./build.sh` 看能否编译官方内核。

## AnyKernel3

如果能编译出官方内核，则尝试用 `AnyKernel3` 刷入，看是否能开机

```bash
cd ~/Project/
git clone --depth 1 https://github.com/osm0sis/AnyKernel3.git
cd AnyKernel3
cp $PWD/$TARGET .
```

上面的 `cp $PWD/$TARGET .` 的意思是把编译出来的 `Image.gz-dtb` 复制到 `AnyKernel3` 文件夹下

edit `global properties` and `boot shell variables`

```sh
# global properties
properties() { '
kernel.string=Note20U-Snapdragon
do.devicecheck=1
do.modules=0
do.systemless=1
do.cleanup=1
do.cleanuponabort=0
device.name1=c2q
device.name2=c2q_chn_hkx
device.name3=SM-N9860
device.name4=sm8250
device.name5=kona
supported.versions=11.0-14.0
supported.patchlevels=
supported.vendorpatchlevels=
'; } # end properties


# boot shell variables
# 三星高通机型的标准 Boot 分区路径
BLOCK=/dev/block/bootdevice/by-name/boot;
IS_SLOT_DEVICE=0;
RAMDISK_COMPRESSION=auto;
PATCH_VBMETA_FLAG=auto;
```

full version:

```sh
### AnyKernel3 Ramdisk Mod Script
## osm0sis @ xda-developers

### AnyKernel setup
# global properties
properties() { '
kernel.string=Note20U-Snapdragon
do.devicecheck=1
do.modules=0
do.systemless=1
do.cleanup=1
do.cleanuponabort=0
device.name1=c2q
device.name2=c2q_chn_hkx
device.name3=SM-N9860
device.name4=sm8250
device.name5=kona
supported.versions=11.0-14.0
supported.patchlevels=
supported.vendorpatchlevels=
'; } # end properties


### AnyKernel install
## boot files attributes
boot_attributes() {
set_perm_recursive 0 0 755 644 $RAMDISK/*;
set_perm_recursive 0 0 750 750 $RAMDISK/init* $RAMDISK/sbin;
} # end attributes

# boot shell variables
# 三星高通机型的标准 Boot 分区路径
BLOCK=/dev/block/bootdevice/by-name/boot;
IS_SLOT_DEVICE=0;
RAMDISK_COMPRESSION=auto;
PATCH_VBMETA_FLAG=auto;

# import functions/variables and setup patching - see for reference (DO NOT REMOVE)
. tools/ak3-core.sh;

# boot install
dump_boot; # use split_boot to skip ramdisk unpack, e.g. for devices with init_boot ramdisk

# init.rc
backup_file init.rc;
replace_string init.rc "cpuctl cpu,timer_slack" "mount cgroup none /dev/cpuctl cpu" "mount cgroup none /dev/cpuctl cpu,timer_slack";

# init.tuna.rc
backup_file init.tuna.rc;
insert_line init.tuna.rc "nodiratime barrier=0" after "mount_all /fstab.tuna" "\tmount ext4 /dev/block/platform/omap/omap_hsmmc.0/by-name/userdata /data remount nosuid nodev noatime nodiratime barrier=0";
append_file init.tuna.rc "bootscript" init.tuna;

# fstab.tuna
backup_file fstab.tuna;
patch_fstab fstab.tuna /system ext4 options "noatime,barrier=1" "noatime,nodiratime,barrier=0";
patch_fstab fstab.tuna /cache ext4 options "barrier=1" "barrier=0,nomblk_io_submit";
patch_fstab fstab.tuna /data ext4 options "data=ordered" "nomblk_io_submit,data=writeback";
append_file fstab.tuna "usbdisk" fstab;

write_boot; # use flash_boot to skip ramdisk repack, e.g. for devices with init_boot ramdisk
## end boot install


## init_boot files attributes
#init_boot_attributes() {
#set_perm_recursive 0 0 755 644 $RAMDISK/*;
#set_perm_recursive 0 0 750 750 $RAMDISK/init* $RAMDISK/sbin;
#} # end attributes

# init_boot shell variables
#BLOCK=init_boot;
#IS_SLOT_DEVICE=1;
#RAMDISK_COMPRESSION=auto;
#PATCH_VBMETA_FLAG=auto;

# reset for init_boot patching
#reset_ak;

# init_boot install
#dump_boot; # unpack ramdisk since it is the new first stage init ramdisk where overlay.d must go

#write_boot;
## end init_boot install


## vendor_kernel_boot shell variables
#BLOCK=vendor_kernel_boot;
#IS_SLOT_DEVICE=1;
#RAMDISK_COMPRESSION=auto;
#PATCH_VBMETA_FLAG=auto;

# reset for vendor_kernel_boot patching
#reset_ak;

# vendor_kernel_boot install
#split_boot; # skip unpack/repack ramdisk, e.g. for dtb on devices with hdr v4 and vendor_kernel_boot

#flash_boot;
## end vendor_kernel_boot install


## vendor_boot files attributes
#vendor_boot_attributes() {
#set_perm_recursive 0 0 755 644 $RAMDISK/*;
#set_perm_recursive 0 0 750 750 $RAMDISK/init* $RAMDISK/sbin;
#} # end attributes

# vendor_boot shell variables
#BLOCK=vendor_boot;
#IS_SLOT_DEVICE=1;
#RAMDISK_COMPRESSION=auto;
#PATCH_VBMETA_FLAG=auto;

# reset for vendor_boot patching
#reset_ak;

# vendor_boot install
#dump_boot; # use split_boot to skip ramdisk unpack, e.g. for dtb on devices with hdr v4 but no vendor_kernel_boot

#write_boot; # use flash_boot to skip ramdisk repack, e.g. for dtb on devices with hdr v4 but no vendor_kernel_boot
## end vendor_boot install
```

get AnyKernel3.zip

```bash
zip -r9 UPDATE-AnyKernel3.zip * -x .git README.md *placeholder
```

将 `UPDATE-AnyKernel3.zip` 用 Recovery 或者 `Kernel Flasher` 刷入，看是否能开机，能正常开机则进入下一步

## docker

创建 `~/Project/Kernel/docker.sh` ：

```sh
# 定义配置文件路径
DEFCONFIG="arch/arm64/configs/vendor/c2q_chn_hkx_defconfig"

# 1. 备份原文件 (后悔药)
cp $DEFCONFIG $DEFCONFIG.bak_nodocker

# 2. 追加 Docker 核心支持配置
cat <<EOT >> $DEFCONFIG

# ==============================================
#           Docker / Container Support
# ==============================================

# 1. 基本 Cgroup 支持
CONFIG_CGROUPS=y
CONFIG_MEMCG=y
CONFIG_MEMCG_SWAP=y
CONFIG_CGROUP_SCHED=y
CONFIG_CGROUP_FREEZER=y
CONFIG_CPUSETS=y
CONFIG_CGROUP_DEVICE=y
CONFIG_CGROUP_CPUACCT=y
CONFIG_CGROUP_PIDS=y
CONFIG_CGROUP_BPF=y

# 2. Namespaces (命名空间)
CONFIG_NAMESPACES=y
CONFIG_UTS_NS=y
CONFIG_IPC_NS=y
CONFIG_USER_NS=y
CONFIG_PID_NS=y
CONFIG_NET_NS=y

# 3. 网络虚拟化 (veth, bridge, iptables)
CONFIG_NETFILTER=y
CONFIG_NETFILTER_ADVANCED=y
CONFIG_BRIDGE=y
CONFIG_BRIDGE_NETFILTER=y
CONFIG_VETH=y
CONFIG_NET_CORE=y
CONFIG_IP_NF_FILTER=y
CONFIG_IP_NF_TARGET_MASQUERADE=y
CONFIG_NETFILTER_XT_MATCH_ADDRTYPE=y
CONFIG_NETFILTER_XT_MATCH_CONNTRACK=y
CONFIG_NETFILTER_XT_MATCH_IPVS=y
CONFIG_IP_NF_NAT=y
CONFIG_NF_NAT=y
CONFIG_POSIX_MQUEUE=y
CONFIG_NETFILTER_XT_TARGET_CHECKSUM=y
CONFIG_IP_NF_MANGLE=y

# 4. 文件系统 (OverlayFS 是 Docker 分层存储的核心)
CONFIG_OVERLAY_FS=y

# 5. 其他杂项
CONFIG_KEYS=y
CONFIG_BINFMT_MISC=y
CONFIG_IKCONFIG=y
CONFIG_IKCONFIG_PROC=y

# 关闭可能干扰容器的 Android 限制 (可选，但推荐)
# CONFIG_ANDROID_PARANOID_NETWORK is not set
EOT

echo "Docker 配置已追加到 $DEFCONFIG"
```

再次构建

```sh
cd ~/Project/Kernel/
./docker.sh
./build.sh
```

再次做成 AnyKernel3 刷机包刷入

## run docker in termux

太棒了！你已经完成了 99% 的核心工作。既然你的内核已经支持了 Docker（开启了 Cgroups, Namespace, OverlayFS 等），在 Termux 中运行 Docker 就只剩下最后的“软件配置”了。

由于 Android 的系统架构和标准 Linux 发行版（如 Ubuntu）不同，直接运行 `dockerd` 通常会报错（主要是 Cgroups 挂载点的问题）。你需要按照以下步骤来“欺骗” Docker，让它以为自己跑在标准 Linux 上。

### 第一步：安装 Docker 和必要工具

打开 Termux，执行以下命令安装 Docker 和 Root 权限工具：

```bash
# 1. 更新源
pkg update && pkg upgrade

# 2. 安装 tsu (用于在 Termux 中获取 root 权限)
pkg install tsu

# 3. 启用 root 仓库
pkg install root-repo

# 4. 安装 docker 软件包
pkg install docker docker-compose
```

### 第二步：编写启动脚本 (关键)

Android 的 Cgroups 挂载点和 Docker 预期的不一样（Android 在 `/dev/cg2_bpf` 或其他位置，Docker 想要 `/sys/fs/cgroup`）。我们需要写一个脚本来手动挂载它们。

在 Termux 中创建一个启动脚本，比如叫 `run_docker.sh`：

```bash
nano run_docker.sh
```

**复制粘贴以下内容（这是适配 Android 12/13/14 的通用挂载脚本）：**

```bash
#!/data/data/com.termux/files/usr/bin/bash

# ================= 配置区域 =================
# Docker 默认网段范围 (覆盖 172.16.x.x ~ 172.31.x.x)
DOCKER_SUBNET="172.16.0.0/12"

# EasyTier 虚拟网段设置
# 如果你需要 EasyTier，请填入你的虚拟网段 CIDR (例如 10.144.144.0/24)
# 如果你不需要或想禁用此功能，请将引号内容留空，例如 EASYTIER_SUBNET=""
EASYTIER_SUBNET="10.144.144.0/24"


# 自定义路由表 ID (防止污染系统表)
DOCKER_TABLE_ID=100

# 路由规则优先级 (优先级设为 2500)
# Android VPN 的优先级通常在 10000+，本地 WiFi 在 20000+
# 我们设为 2500，既能优先接管 Docker 流量，又不干扰系统自身的高优先级规则
RULE_PREF=2500
# ===========================================

# 0. Root 权限检查
if [ "$(id -u)" != "0" ]; then
    sudo "$0" "$@"
    exit $?
fi

echo "=== 🚀 Android Docker 智能启动 (VPN 共存版) ==="

# ----------------------------------------------------------------
# 1. 自动配置 daemon.json (修复 MTU 和 DNS 痛点)
# ----------------------------------------------------------------
# 如果配置不存在，自动创建；如果存在，暂不覆盖以免丢失个性化设置
# 强制推荐：MTU 1280 (适配所有 VPN)，DNS 使用公共 DNS
CONF_DIR="/data/data/com.termux/files/usr/etc/docker"
CONF_FILE="$CONF_DIR/daemon.json"

if [ ! -f "$CONF_FILE" ]; then
    echo "[1/6] Creating daemon.json (MTU 1280 + DNS)..."
    mkdir -p "$CONF_DIR"
    cat > "$CONF_FILE" <<EOF
{
    "data-root": "/data/data/com.termux/files/usr/lib/docker",
    "exec-root": "/data/data/com.termux/files/usr/var/run/docker",
    "pidfile": "/data/data/com.termux/files/usr/var/run/docker.pid",
    "mtu": 1280,
    "dns": [
        "223.5.5.5",
        "119.29.29.29",
        "8.8.8.8"
    ],
    "ip-masq": true,
    "bridge": "docker0",
    "hosts": [
        "unix:///data/data/com.termux/files/usr/var/run/docker.sock"
    ],
    "storage-driver": "overlay2"
}
EOF
else
    echo "[1/6] daemon.json exists, skipping overwrite."
fi

# ----------------------------------------------------------------
# 2. 基础环境挂载 (Cgroups)
# ----------------------------------------------------------------
echo "[2/6] Mounting Cgroups..."
if [ ! -d /sys/fs/cgroup ]; then mkdir -p /sys/fs/cgroup; fi
if ! mountpoint -q /sys/fs/cgroup; then mount -t tmpfs -o mode=755 tmpfs /sys/fs/cgroup; fi
for subsys in cpu cpuacct memory devices freezer blkio perf_event pids cpuset; do
    mkdir -p /sys/fs/cgroup/$subsys
    if ! mountpoint -q /sys/fs/cgroup/$subsys; then
        mount -t cgroup -o $subsys cgroup /sys/fs/cgroup/$subsys 2>/dev/null || true
    fi
done

# ----------------------------------------------------------------
# 3. 内核参数优化 (开启转发 + 关闭 rp_filter)
# ----------------------------------------------------------------
echo "[3/6] Enabling IP Forwarding & Fixing rp_filter..."
sysctl -w net.ipv4.ip_forward=1 > /dev/null
sysctl -w net.ipv4.conf.all.forwarding=1 > /dev/null

# 关闭所有网卡的反向路径过滤（解决 VPN/WiFi 切换丢包核心）
for file in /proc/sys/net/ipv4/conf/*/rp_filter; do
    echo 0 > "$file"
done

# ----------------------------------------------------------------
# 4. 智能路由配置 (核心修复：只动 Docker，不动系统)
# ----------------------------------------------------------------
echo "[4/6] Configuring Routing Strategy..."

# A. 清理旧的、可能导致冲突的“霸道”规则 (如 pref 1)
while ip rule del from all lookup main pref 1 2>/dev/null; do true; done
while ip rule del from all lookup main pref 30000 2>/dev/null; do true; done
# 清理我们自己可能残留的规则
while ip rule del from $DOCKER_SUBNET lookup $DOCKER_TABLE_ID 2>/dev/null; do true; done

# B. 探测当前外网出口 (自动识别 VPN tun0 或 WiFi wlan0)
# 我们询问系统：“去阿里 DNS 怎么走？” 系统会告诉我们当前有效的出口
ROUTE_INFO=$(ip route get 223.5.5.5 2>/dev/null)
INTERFACE=$(echo "$ROUTE_INFO" | grep -oP 'dev \K\S+')
GATEWAY=$(echo "$ROUTE_INFO" | grep -oP 'via \K\S+')

if [ -n "$INTERFACE" ]; then
    echo "    -> 当前系统主出口: $INTERFACE (网关: ${GATEWAY:-直连})"

    # C. 为 Docker 建立独立路由表
    ip route flush table $DOCKER_TABLE_ID
    if [ -n "$GATEWAY" ]; then
        # 如果有网关 (WiFi)，通过网关转发
        ip route add default via "$GATEWAY" dev "$INTERFACE" table $DOCKER_TABLE_ID
    else
        # 如果没网关 (通常是 VPN tun 设备)，直接从接口发出去
        ip route add default dev "$INTERFACE" table $DOCKER_TABLE_ID
    fi

    # D. 添加策略：只有 Docker 的流量才查这张表
    # 这就是“互不打扰”的关键！
    ip rule add from $DOCKER_SUBNET lookup $DOCKER_TABLE_ID pref $RULE_PREF
    echo "    -> 策略已生效: Docker 流量 -> Table $DOCKER_TABLE_ID -> $INTERFACE"
else
    echo "⚠️  警告: 未检测到网络连接，Docker 可能无法上网"
fi

# E. 修复 EasyTier (根据配置动态执行)
if [ -n "$EASYTIER_SUBNET" ]; then
    echo "检测到 EasyTier 配置，正在添加指向性路由..."

    # 1. 先尝试清理可能存在的旧规则 (防止重复添加)
    while ip rule del to "$EASYTIER_SUBNET" lookup main pref 1 2>/dev/null; do true; done

    # 2. 添加规则：只让去往 EasyTier 网段的包查 main 表
    ip rule add to "$EASYTIER_SUBNET" lookup main pref 1

    # 3. 配合 NAT (防止源 IP 选错，针对 tun0 接口)
    # 注意：这里假设 EasyTier 接口名为 tun0，如果是其他名字请按需修改
    # iptables -t nat -C POSTROUTING -o tun0 -j MASQUERADE 2>/dev/null
    # if [ $? -ne 0 ]; then
    #     iptables -t nat -I POSTROUTING -o tun0 -j MASQUERADE
    # fi

    echo "✅ EasyTier 修复完成: to $EASYTIER_SUBNET -> main table"
else
    echo "EasyTier 网段未配置，跳过修复。"
fi



# ----------------------------------------------------------------
# 5. 防火墙与 NAT (Snapdragon 修复版)
# ----------------------------------------------------------------
echo "[5/6] Applying Firewall & NAT Rules..."

# 清理 NAT 规则防止堆积
iptables -t nat -F POSTROUTING 2>/dev/null

# A. 允许转发 (FORWARD)
iptables -P FORWARD ACCEPT
iptables -I FORWARD 1 -j ACCEPT

# B. 万能 NAT 规则
# 只要源是 Docker，且目标不是 Docker 内部，就伪装成出口 IP
iptables -t nat -A POSTROUTING -s "$DOCKER_SUBNET" ! -d "$DOCKER_SUBNET" -j MASQUERADE

# C. 修复高通硬件校验和 (Checksum Fix)
# 必须要有，否则包发出去会被路由器丢弃
iptables -t mangle -F POSTROUTING 2>/dev/null
iptables -t mangle -A POSTROUTING -p tcp -j CHECKSUM --checksum-fill 2>/dev/null
iptables -t mangle -A POSTROUTING -p udp -j CHECKSUM --checksum-fill 2>/dev/null


# ----------------------------------------------------------------
# 6. 启动 Docker
# ----------------------------------------------------------------
echo "[6/6] Starting Dockerd..."

# 杀掉残留进程防止死锁
pkill dockerd 2>/dev/null
pkill containerd 2>/dev/null
sleep 1

# 启动 (参数都在 daemon.json 里了，这里保持干净)
# 依然保留 --iptables=false，由脚本接管防火墙，防止冲突
dockerd --iptables=false > /dev/null 2>&1 &

# 定义一个标志位，默认为失败
IS_RUNNING=0

# 等待启动检查
for i in {1..10}; do
    if [ -S "/data/data/com.termux/files/usr/var/run/docker.sock" ]; then
        echo "✅ Docker Daemon is Running!"
        # 自动设置客户端变量，方便直接使用
        export DOCKER_HOST="unix:///data/data/com.termux/files/usr/var/run/docker.sock"
        echo "   Host: unix:///data/data/com.termux/files/usr/var/run/docker.sock"

        # 标记为成功
        IS_RUNNING=1
        break
    fi
    sleep 1
done

# 根据标志位判断结果
if [ "$IS_RUNNING" -eq 1 ]; then
    # 尝试运行 docker ps 验证 (比 pgrep 更准)
    if docker ps >/dev/null 2>&1; then
        echo "   服务响应正常 (docker ps OK)"
    fi
else
    echo "❌ 启动超时或失败，请检查日志"
    # 只有失败时才尝试用 pgrep 看看进程还在不在
    if pgrep dockerd > /dev/null; then
        echo "   (dockerd 进程存在，但 Socket 未生成，可能是权限或配置错误)"
    else
        echo "   (dockerd 进程已退出)"
    fi
fi
```

保存并退出 (`Ctrl+O` -> `Enter` -> `Ctrl+X`)。

### 第三步 配置 docker 相关文件

#### 配置 DOCKER_HOST

告诉 docker 客户端：别去 /var/run 找了，来这里找

```bash
tsu
echo export DOCKER_HOST=\"unix:///data/data/com.termux/files/usr/var/run/docker.sock\" >> ~/.bashrc
source ~/.bashrc
```

修改 `/data/data/com.termux/files/usr/etc/docker/daemon.json` 为以下内容

```json
{
    "data-root": "/data/data/com.termux/files/usr/lib/docker",
    "exec-root": "/data/data/com.termux/files/usr/var/run/docker",
    "pidfile": "/data/data/com.termux/files/usr/var/run/docker.pid",
    "dns": [
        "223.5.5.5",
        "119.29.29.29"
    ],
    "ip-masq": true,
    "bridge": "docker0",
    "hosts": [
        "unix:///data/data/com.termux/files/usr/var/run/docker.sock"
    ],
    "storage-driver": "overlay2"
}
```

### 第四步：运行 Docker

1. **赋予脚本执行权限**：

    ```bash
    tsu
    chmod +x run_docker.sh
    ```

2. **启动！**

    ```bash
    ./run_docker.sh
    ```

    *你会看到很多日志输出，只要没有红色的 `Fatal Error`，并且最后停在日志滚动状态，就说明守护进程启动成功了。*

3. **测试 Docker** (保持上面的窗口不动，从左侧滑出菜单，**新建一个 Termux 窗口**)：

    ```bash
    # 在新窗口中获取 root
    tsu

    # 测试 hello-world
    docker run hello-world
    ```

### 第五步：常见故障排除

如果 `docker run` 报错，请检查以下几点：

1. **`devices cgroup isn't mounted`**:
    * 说明脚本里的 `mount -t cgroup -o devices ...` 失败了。
    * 检查你的内核配置：`zcat /proc/config.gz | grep CONFIG_CGROUP_DEVICE`，必须是 `=y`。如果之前编译时漏了，得重编内核。

2. **`iptables failed` / 无法联网**:
    * 在启动脚本的 `dockerd` 命令后面加上 `--iptables=false`。
    * Docker 容器默认用 Google DNS (8.8.8.8)，如果你在墙内，可能需要在运行容器时指定 DNS：
        `docker run --dns 223.5.5.5 hello-world`

3. **`OverlayFS not supported`**:
    * Docker 会回退到 `vfs` 存储驱动，非常慢且占用空间。
    * 检查内核配置 `CONFIG_OVERLAY_FS=y`。
    * *注意：Docker 数据通常存在 `/data/docker` 下，这里是 ext4/f2fs 文件系统，支持 OverlayFS。不要试图在 `/sdcard` (FAT/FUSE) 上跑 Docker。*

现在，你的 Note 20 Ultra 应该已经变成一台运行 Docker 的微型 Linux 服务器了！你可以跑 HomeAssistant, QingLong, 甚至 Linux 桌面版容器。

## ln

第三步配置了 DOCKER_HOST ，则可省略此步骤

use MT manager

```sh
sudo ln -s /data/data/com.termux/files/usr/var/run/docker.sock /var/run/docker.sock
```

## keep alive

这是一个在 Termux/Android 上运行 Docker 最常见的问题。

虽然你之前运行 `hello-world` 成功了，但现在报错 `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`，通常意味着 **后台的 Docker 服务进程 (dockerd) 已经挂了（被杀后台了）**，或者你**忘记加 sudo** 了。

对于三星 Note 20 Ultra (Android 12/13/14)，有一个名为 **"Phantom Process Killer" (幽灵进程杀手)** 的系统机制是 Docker 的头号大敌。

请按照以下步骤逐步排查并彻底修复：

### 1. 最简单的检查：你加 sudo 了吗？

在 Termux 中，Docker 的守护进程是 Root 权限运行的，所以 Docker 客户端命令也必须加 `sudo`。

* **错误写法**: `docker run xxx`
* **正确写法**: `sudo docker run xxx`

如果加了 sudo 还是报这个错，说明 **dockerd 服务确实已经停止了**。

---

### 2. 核心修复：禁用三星幽灵进程杀手 (必做！)

三星 Android 12+ 系统有一个极其激进的机制，会监控 Termux 的子进程。一旦 Docker 开始拉取镜像（如 `openlist` 或 `openwrt`）或者消耗较多资源，系统会判定它是“耗电的幽灵进程”并直接杀死 `dockerd`。

你需要连接电脑 ADB，执行以下两条命令来禁用这个机制（重启后可能失效，建议保存）：

```bash
# 1. 将幽灵进程上限调整到最大值 (约 20 亿)
adb shell "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"

# 2. 禁用配置同步 (防止系统自动改回去)
adb shell "/system/bin/device_config set_sync_disabled_for_tests persistent"
```

*执行完这两条命令后，不需要重启手机，Docker 就会变得非常稳定。*

---

### 3. 重启 Docker 守护进程

既然它已经挂了，你需要重新启动它。

1. **杀掉残留进程** (防止端口占用)：

    ```bash
    sudo pkill dockerd
    sudo pkill containerd
    ```

2. **重新运行启动脚本**：
    切换回你运行 `run_docker.sh` 的那个窗口，或者重新运行它：

    ```bash
    sudo ./run_docker.sh
    ```

    *确保你看到日志显示 "API listen on /var/run/docker.sock" 并且没有报错退出。*

3. **再试一次** (在新窗口)：

    ```bash
    sudo docker pull openwrt/openwrt  # 举例
    ```

---

### 4. 进阶技巧：让 Docker 自动复活

如果你不想每次都手动敲命令重启，可以在 Termux 安装一个进程管理工具，或者简单地写一个循环脚本来“守护”它。

创建一个 `keep_docker_alive.sh`:

```bash
#!/bin/bash
while true; do
    echo "启动 Dockerd..."
    # 这里的参数根据你的实际情况调整
    sudo dockerd --iptables=false >> docker.log 2>&1
    echo "Dockerd 挂了! 5秒后重启..."
    sleep 5
done
```

运行这个脚本，即使 Docker 被系统杀了，它也会立刻复活。

### 总结

1. **ADB 命令** 是解决三星手机 Docker 不稳定的关键，一定要做。
2. 永远记得用 **`sudo docker`**。
3. 保持 `run_docker.sh` 的窗口一直开着，不要关闭它。
