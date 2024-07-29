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
