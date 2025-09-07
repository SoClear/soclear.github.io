# 新版 WSL2 2.0 设置 Windows 和 WSL 镜像网络教程

## WSL2 2.0.0 更新

伴随着 Windows 11 23H2 更新，WSL2 的 2.0 更新带来了以下特性：

1. 支持**自动回收内存**：WSL2 现在可以自动回收未使用的内存，提高系统性能和资源利用率；
2. 支持**自动释放 WSL2 虚拟硬盘空间**：WSL2 现在可以自动释放未使用的虚拟硬盘空间，减少硬盘占用；
3. 支持和 Windows 使用相同的网络（**镜像网络**）：WSL2 现在可以与 Windows 共享相同的网络，实现更好的网络互通和访问；
4. 支持 **DNS Tunneling**：WSL2 现在支持 DNS Tunneling，可以更方便地进行网络配置和访问；
5. 支持**同步 Windows 代理**：WSL2 现在可以使用 Windows 设置的代理，方便进行网络代理配置；
6. 支持 **Windows 防火墙**：WSL2 现在可以与 Windows 防火墙配合使用，提供更好的网络安全性；
7. 支持 **Multicast**：WSL2 现在支持 Multicast，可以更好地进行多播网络通信。

## WSL2 原本存在的网络问题

WSL1 是基于代理的虚拟化技术，它通过将 Linux 系统调用转换为 Windows 系统调用来实现与 Windows 内核的交互。WSL2 则使用了真正的虚拟机技术，它在 Windows主机 上运行一个轻量级的 Linux 内核。

WSL2 无法访问 Windows 的 localhost 网络是由 WSL2 的网络架构所致。WSL2 使用了一个虚拟网络适配器来与 Windows 主机进行通信，这导致 WSL2 无法直接访问 Windows 的 localhost 网络。因此，以往的 WSL2 在访问 Windows 网络时需要将其当作 LAN 的另一个设备，而 Windows 宿主则可以把 WSL 当作本机设备。这导致了很多问题，尤其是梯子方面的。

WSL2 2.0 引入的镜像网络可以解决 localhost 访问问题。启用镜像网络后，WSL2 和 Windows 主机将使用相同的网络，并且可以通过 localhost 访问本机系统上的服务。这意味着你可以在 WSL2 中访问本机系统上运行的应用程序，以及通过本机系统访问在 WSL2 中运行的应用程序。

## 更新到 WSL2 2.0

要更新到 WSL2 2.0 版本，你需要满足以下环境要求：

1. Windows 11 23H2 或更高版本；
2. 安装了 WSL2（Windows Subsystem for Linux）的先前版本。

可以通过 Win+R 输入 `winver` 来查询系统版本：

如果系统满足以上要求，你可以按照以下步骤更新到 WSL2 2.0 版本：

1. 打开 PowerShell 或 Windows 命令提示符，以管理员身份运行。
2. 运行命令 `wsl --update --pre-release`，这将更新 WSL2 到 2.0.0 或更高版本。

## 配置 .wslconfig 文件开启新特性

使用 **.wslconfig** 为 WSL 上运行的所有已安装的发行版配置**全局设置**。

- 默认情况下，.wslconfig 文件不存在。 它必须创建并存储在`%UserProfile%`目录中才能应用这些配置设置。
- 用于在作为 WSL 2 版本运行的所有已安装的 Linux 发行版中全局配置设置。
- **只能用于 WSL 2 运行的发行版**。 作为 WSL 1 运行的发行版不受此配置的影响，因为它们不作为虚拟机运行。
- 要访问 `%UserProfile%` 目录，请在 PowerShell 中使用 `cd ~` 访问主目录（通常是用户配置文件 `C:\Users\<UserName>`），或者可以打开 Windows 文件资源管理器并在地址栏中输入 `%UserProfile%`。 该目录路径应类似于：`C:\Users\<UserName>\.wslconfig`。

WSL 将检测这些文件是否存在，读取内容，并在每次启动 WSL 时自动应用配置设置。 如果文件缺失或格式错误（标记格式不正确），则 WSL 将继续正常启动，而不应用配置设置。

## .wsl.conf 的配置设置

.wslconfig 文件对所有在 WSL 2 上运行的 Linux 发行版进行全局设置配置。 （有关每个发行版配置的信息，请参阅 wsl.conf）。

有关 .wslconfig 文件的存储位置的信息，请参见 [.wslconfig](https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config#example-wslconfig-file#wslconfig)。

> 备注
>
> 使用 `.wslconfig` 进行全局配置的选项仅适用于在 Windows 版本 19041 及更高版本中作为 WSL 2 运行的发行版。 请记住，可能需要运行 `wsl --shutdown` 来关闭 WSL 2 VM，然后重启 WSL 实例以使这些更改生效。

最简便的方式：

> 提示
>
> 建议直接在 WSL 设置中修改 WSL 配置，而不是手动编辑 .wslconfig 文件。 可以在“开始”菜单中找到 WSL 设置。 ![适用于 Linux 设置的 Windows 子系统](https://learn.microsoft.com/zh-cn/windows/wsl/media/wsl-settings.png)

此文件可以包含以下选项，它们会影响为任何 WSL 2 发行版提供支持的 VM：

## 主要 WSL 设置

.wslconfig 节标签：`[wsl2]`

展开表

| 密钥 | 值 | 默认 | 说明 |
| --- | --- | --- | --- |
| `kernel` | 路径 | Microsoft 内置内核提供的收件箱 | 自定义 Linux 内核的绝对 Windows 路径。 |
| `kernelModules` | 路径 | 自定义 Linux 内核模块 VHD 的绝对 Windows 路径。 |  |
| `memory` | 大小 | Windows 上总内存的 50% | 要分配给 WSL 2 VM 的内存量。 |
| `processors` | 数字 | Windows 上相同数量的逻辑处理器 | 要分配给 WSL 2 VM 的逻辑处理器数量。 |
| `localhostForwarding` | 布尔 | `true` | 一个布尔值，用于指定绑定到 WSL 2 VM 中的通配符或 localhost 的端口是否应可通过 `localhost:port` 从主机连接。 |
| `kernelCommandLine` | 字符串 | 没有 | 其他内核命令行参数。 |
| `safeMode` | 布尔 | `false` | 在“安全模式”中运行 WSL，这会禁用许多功能，应用于恢复处于错误状态的发行版。 仅适用于 Windows 11 和 WSL 版本 0.66.2+。 |
| `swap` | 大小 | Windows 上 25% 的内存大小四舍五入到最接近的 GB | 要向 WSL 2 VM 添加的交换空间量，0 表示无交换文件。 交换存储是当内存需求超过硬件设备上的限制时使用的基于磁盘的 RAM。 |
| `swapFile` | 路径 | `%Temp%\swap.vhdx` | 交换虚拟硬盘的绝对 Windows 路径。 |
| `pageReporting` | 布尔 | `true` | 设置使 Windows 能够回收分配给 WSL 2 虚拟机的未使用的内存。 |
| `guiApplications` | 布尔 | `true` | 一个布尔值，用于在 WSL 中打开或关闭对 GUI 应用程序 ([WSLg](https://github.com/microsoft/wslg)) 的支持。 |
| `debugConsole`¹ | 布尔 | `false` | 一个布尔值，用于在 WSL 2 发行版实例启动时打开显示 `dmesg` 内容的输出控制台窗口。 |
| `maxCrashDumpCount` | 数字 | `10` | 设置将出于调试目的保留的最大故障转储文件数。 WSL 保留的默认数字为 10。 超过此限制后，将自动删除较旧的故障转储，为新转储腾出空间。 设置最大值有助于减少这些崩溃文件使用的磁盘空间量。 |
| `nestedVirtualization`¹ | 布尔 | `true` | 用于打开或关闭嵌套虚拟化的布尔值，使其他嵌套 VM 能够在 WSL 2 中运行。 |
| `vmIdleTimeout`¹ | 数字 | `60000` | VM 在关闭之前处于空闲状态的毫秒数。 |
| `dnsProxy` | 布尔 | `true` | `networkingMode = NAT`仅适用于 . 布尔值，通知 WSL 将 Linux 中的 DNS 服务器配置为主机上的 NAT。 `false`设置为将 DNS 服务器从 Windows 镜像到 Linux。 |
| `networkingMode`¹² | 字符串 | `NAT` | 可用值为：`none`、、（ `net``bridged`已弃用）`mirrored`和`virtioproxy`。 如果值为 `none`，则 WSL 网络断开连接。 如果值为 `net` 或未知值，则使用 NAT 网络模式（从 WSL 2.3.25 开始，如果 NAT 网络模式失败，则会回退到使用 VirtioProxy 网络模式）。 如果值为 `bridged`，则使用桥接网络模式（此模式已标记为自 WSL 2.4.5 以来已弃用）。 如果值为， `mirrored`则使用镜像网络模式。 如果值为 `virtioproxy`，则使用 VirtioProxy 网络模式。 |
| `firewall`¹² | 布尔 | `true` | 如果设置为 true，则 Windows 防火墙规则以及特定于 Hyper-V 流量的规则可以筛选 WSL 网络流量。 |
| `dnsTunneling`¹² | 布尔 | `true` | 更改将 DNS 请求从 WSL 代理到 Windows 的方式 |
| `autoProxy`¹ | 布尔 | `true` | 强制 WSL 使用 Windows 的 HTTP 代理信息 |
| `defaultVhdSize` | 大小 | `1099511627776` （1 TB） | 设置存储 Linux 发行版（例如 Ubuntu）文件系统的虚拟硬盘 (VHD) 大小。 可用于限制分发文件系统允许占用的最大大小。 |

具有“**path**”值的条目必须是带转义反斜杠的 Windows 路径，例如： `C:\\Temp\\myCustomKernel`

默认情况下，具有`size`值的条目默认为B（字节），单位可以省略。 若要使用其他单位，必须追加大小单位，例如： `8GB` 或 `512MB`。

¹：仅在 Windows 11 上可用。

²：需要 [Windows 11 版本 22H2](https://blogs.windows.com/windows-insider/2023/09/14/releasing-windows-11-build-22621-2359-to-the-release-preview-channel/) 或更高版本。

[](https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config#example-wslconfig-file#experimental-settings)

### 实验性设置

这些设置是试验性功能的选择加入预览，我们的目标是将来将其设为默认设置。

.wslconfig 节标签：`[experimental]`

展开表

| 密钥 | 值 | 默认 | 说明 |
| --- | --- | --- | --- |
| `autoMemoryReclaim` | 字符串 | `dropCache` | 可用值为： `disabled`、 `gradual`和 `dropCache`。 如果值为 `disabled`，则将禁用 WSL 自动内存回收。 如果值为此值 `gradual`，则缓存的内存将缓慢且自动回收。 如果值为 `dropCache` 或未知值，将立即回收缓存内存。 |
| `sparseVhd` | 布尔 | `false` | 当设置为 `true` 时，任何新创建的 VHD 将自动设置为稀疏。 |
| `bestEffortDnsParsing`¹² | 布尔 | `false` | 仅当 `wsl2.dnsTunneling` 设置为 `true` 时才适用。 设置为`true`时，Windows 将从 DNS 请求中提取查询，并尝试解析它，忽略未知记录。 |
| `dnsTunnelingIpAddress`¹² | 字符串 | `10.255.255.254` | 仅当 `wsl2.dnsTunneling` 设置为 `true` 时才适用。 指定在启用 DNS 隧道时将在 Linux `resolv.conf` 文件中配置的名称服务器。 |
| `initialAutoProxyTimeout`¹ | 字符串 | `1000` | 仅当 `wsl2.autoProxy` 设置为 `true` 时才适用。 配置启动 WSL 容器时，WSL 等待检索 HTTP 代理信息的时长（以毫秒为单位）。 如果代理设置在此时间之后解决，则必须重新启动 WSL 实例才能使用检索到的代理设置。 |
| `ignoredPorts`¹² | 字符串 | Null | 仅当 `wsl2.networkingMode` 设置为 `mirrored` 时才适用。 指定 Linux 应用程序可以绑定到哪些端口（即使该端口已在 Windows 中使用）。 通过此设置，应用程序能够仅侦听 Linux 中的流量端口，因此即使该端口在 Windows 上用于其他用途，这些应用程序也不会被阻止。 例如，WSL 将允许绑定到 Linux for Docker Desktop 中的端口 53，因为它只侦听来自 Linux 容器中的请求。 应在逗号分隔的列表中设置格式，例如：`3000,9000,9090` |
| `hostAddressLoopback`¹² | 布尔 | `false` | 仅当 `wsl2.networkingMode` 设置为 `mirrored` 时才适用。 如果设置为 `true`，将会允许容器通过分配给主机的 IP 地址连接到主机，或允许主机通过该地址连接到容器。 始终可以使用`127.0.0.1` 环回地址，此选项还允许使用所有额外分配的本地 IP 地址。 仅支持分配给主机的 IPv4 地址。 |

¹：仅在 Windows 11 上可用。

²：需要 [Windows 11 版本 22H2](https://blogs.windows.com/windows-insider/2023/09/14/releasing-windows-11-build-22621-2359-to-the-release-preview-channel/) 或更高版本。

[](https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config#example-wslconfig-file#example-wslconfig-file)

## 示例 .wslconfig 文件

下面的 `.wslconfig` 示例文件展示了一些可以使用的配置选项。 在此示例中，文件路径为 `%UserProfile%\.wslconfig`。

Bash 复制

```ini
# Settings apply across all Linux distros running on WSL 2
[wsl2]

# Limits VM memory to use no more than 4 GB, this can be set as whole numbers using GB or MB
memory=4GB

# Sets the VM to use two virtual processors
processors=2

# Specify a custom Linux kernel to use with your installed distros. The default kernel used can be found at https://github.com/microsoft/WSL2-Linux-Kernel
kernel=C:\\temp\\myCustomKernel

# Specify the modules VHD for the custum Linux kernel to use with your installed distros.
kernelModules=C:\\temp\\modules.vhdx

# Sets additional kernel parameters, in this case enabling older Linux base images such as Centos 6
kernelCommandLine = vsyscall=emulate

# Sets amount of swap storage space to 8GB, default is 25% of available RAM
swap=8GB

# Sets swapfile path location, default is %UserProfile%\AppData\Local\Temp\swap.vhdx
swapfile=C:\\temp\\wsl-swap.vhdx

# Disable page reporting so WSL retains all allocated memory claimed from Windows and releases none back when free
pageReporting=false

# Turn on default connection to bind WSL 2 localhost to Windows localhost. Setting is ignored when networkingMode=mirrored
localhostforwarding=true

# Disables nested virtualization
nestedVirtualization=false

# Turns on output console showing contents of dmesg when opening a WSL 2 distro for debugging
debugConsole=true

# Sets the maximum number of crash dump files to retain (default is 5)
maxCrashDumpCount=10

# Enable experimental features
[experimental]
sparseVhd=true
```

## 其他资源

[官方文档](https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config)

- [Windows 命令行博客：自动配置 WSL](https://devblogs.microsoft.com/commandline/automatically-configuring-wsl/)
- [Windows 命令行博客：Chmod/Chown、DrvFs、文件元数据](https://devblogs.microsoft.com/commandline/chmod-chown-wsl-improvements/)

_这一步不能少。_

```ini
[experimental]
autoMemoryReclaim=gradual # 开启自动回收内存，可在 gradual, dropcache, disabled 之间选择
networkingMode=mirrored # 开启镜像网络
dnsTunneling=true # 开启 DNS Tunneling
firewall=true # 开启 Windows 防火墙
autoProxy=true # 开启自动同步代理
sparseVhd=true # 开启自动释放 WSL2 虚拟硬盘空间
```

需要注意的是，`[experimental]` 不能加到 `[wsl2]` 的前面，一个正常的 `.wslconfig` 可能长成这个样子：

```ini
# Settings apply across all Linux distros running on WSL 2
[wsl2]

# Limits VM memory to use no more than 4 GB, this can be set as whole numbers using GB or MB
memory=8GB

# Sets the VM to use two virtual processors
processors=8

[experimental]
autoMemoryReclaim=gradual # 开启自动回收内存，可在 gradual, dropcache, disabled 之间选择
networkingMode=mirrored # 开启镜像网络
dnsTunneling=true # 开启 DNS Tunneling
firewall=true # 开启 Windows 防火墙
autoProxy=true # 开启自动同步代理
sparseVhd=true # 开启自动释放 WSL2 虚拟硬盘空间
```
