# BBR

BBR（Bottleneck Bandwidth and Round-trip propagation time）是 Google 开发的网络拥塞控制算法，可显著提升网络吞吐量、降低延迟，并在高延迟或跨境网络中表现出色。它需要 Linux 内核版本 ≥ 4.9 才能使用。

## 判断 BBR 是否开启

在 Linux 系统中，判断 BBR 是否成功开启并生效，可以通过以下几个步骤进行验证。通常建议按顺序执行，以确保不仅配置了 BBR，而且内核确实正在使用它。

首先检查内核与当前状态 先确认系统内核版本是否满足要求：

```bash
uname -r
```

### 方法一：检查内核配置参数（最常用）

这是最直接的检查方法，查看系统当前的 TCP 拥塞控制算法设置。

在终端输入：

```bash
sysctl net.ipv4.tcp_congestion_control
```

**预期输出：**

```text
net.ipv4.tcp_congestion_control = bbr
```

如果输出包含 `bbr`，说明系统配置已要求使用 BBR。

---

### 方法二：检查 BBR 是否被内核支持

仅仅配置了参数还不够，需要确认内核中是否包含 BBR 模块。

在终端输入：

```bash
sysctl net.ipv4.tcp_available_congestion_control
```

**预期输出：**

```text
net.ipv4.tcp_available_congestion_control = reno cubic bbr
```

输出结果中必须包含 `bbr`。如果只有 `reno cubic`，说明 BBR 模块未加载或内核版本过低（BBR 需要 Linux Kernel 4.9 及以上）。

---

### 方法三：检查 BBR 模块是否加载

检查内核模块列表中是否有 BBR。

在终端输入：

```bash
lsmod | grep bbr
```

**预期输出：**

```text
tcp_bbr                20480  14
```

*注意：* 如果你的系统是某些特定云服务商的定制内核，或者 BBR 是直接编译进内核（而不是作为模块）的，这个命令可能没有输出，但这不代表 BBR 没开启。**建议以方法四为最终判定标准。**

---

### 方法四：检查运行中的连接（最可靠的验证）

这是**最权威**的方法。通过查看当前活动的 TCP 连接详情，确认是否真的在使用 BBR 算法。

在终端输入：

```bash
ss -n -i | grep bbr
```

**预期输出：**
如果你看到类似下面的输出（注意其中的 `bbr` 字样）：

```text
bbr wscale:8,7 rto:800 rtt:314.801/101.233 ato:44 mss:1412 pmtu:1500 rcvmss:1412 advmss:1460 cwnd:43 bytes_sent:10337 bytes_retrans:36 bytes_acked:9833 bytes_received:8421 segs_out:181 segs_in:211 data_segs_out:166 data_segs_in:172 bbr:(bw:657808bps,mrtt:205.457,pacing_gain:2.88672,cwnd_gain:2.88672) send 1542968bps lastsnd:8 lastrcv:8 lastack:80 pacing_rate 1879912bps delivery_rate 658032bps delivered:159 app_limited busy:7016ms unacked:7 retrans:0/1 rcv_space:14600 rcv_ssthresh:65650 minrtt:204.629 snd_wnd:64512 rcv_wnd:65664
```

或者直接看 `ss -n -i` 的完整输出，在 `tcp` 协议的详细信息里寻找 `bbr` 关键字。如果能看到 `bbr`，说明 BBR 正在实际运行中。

---

### 总结

如果满足以下条件，则 BBR 已成功开启：

1. `sysctl net.ipv4.tcp_congestion_control` 返回 `bbr`。
2. `ss -n -i` 命令的输出中能看到 `bbr` 字样。

## 开启 BBR

### 第一步：强制系统启动时加载 BBR 模块

我们需要明确告诉系统：“每次开机请先把 tcp_bbr 模块加载进来”。

1. **执行以下命令**（将 `tcp_bbr` 写入模块加载列表）：

    ```bash
    echo "tcp_bbr" | sudo tee -a /etc/modules-load.d/modules.conf
    ```

    *(如果你的系统没有 `modules-load.d` 目录，可以直接写入 `/etc/modules` 文件：`echo "tcp_bbr" >> /etc/modules`)*

### 第二步：使用独立配置文件

BBR 依赖于 `fq` (Fair Queue) 队列调度算法。为了保险起见，建议确保 `fq` 的配置写在 `bbr` 之前。

我们需要创建一个文件名以 `99-` 开头的配置文件，放在 `/etc/sysctl.d/` 中。这能确保它在系统启动的最后阶段被加载，且拥有最高优先级，强制覆盖其他所有设置。

```bash
echo "net.core.default_qdisc = fq" | sudo tee /etc/sysctl.d/99-bbr.conf
echo "net.ipv4.tcp_congestion_control = bbr" | sudo tee -a /etc/sysctl.d/99-bbr.conf
```

(解释：在 `/etc/sysctl.d/` 下新建了一个叫 `99-bbr.conf` 的文件。数字 `99` 保证了它会最后执行。)

### 第三步：重启并验证

1. **重启系统**（关键步骤）：

    ```bash
    reboot
    ```

2. **重启后检查**：
    再次输入：

    ```bash
    sysctl net.ipv4.tcp_available_congestion_control
    ```

    如果输出包含 `bbr` （例如 `reno cubic bbr`），说明模块加载成功。

    **再确认是否正在运行**：

    ```bash
    sysctl net.ipv4.tcp_congestion_control
    ```

    如果输出 `bbr`，则 BBR 已成功启用。

---

### 补充：如果上述方法无效（内核版本问题）

如果执行完上面所有步骤，重启后依然没有 BBR，请检查你的内核版本：

```bash
uname -r
```

* **如果版本号低于 4.9**：你需要升级内核才能支持 BBR。
* **如果你是 VPS 用户（如 OpenVZ 架构）**：部分老旧的 OpenVZ 虚拟化技术不支持更换内核，这种情况下你无法开启原版 BBR（可能需要寻找 "BBR Plus" 或 "魔改版 BBR" 的 Docker/LKL 方案，或者更换 KVM 架构的 VPS）。
