# code-server 配置 cron

前提：LinuxServer.io 的 [code-server](https://docs.linuxserver.io/images/docker-code-server/)
效果：重启 code-server 后，Cron 任务会自动生效。

## 第一步：将 Cron 规则写入持久化文件

不要再用 `crontab -e` 了，把你的任务写在一个文本文件里，放在你的工作区（这样永远不会丢）。

1. 在 code-server 的终端里，创建一个文件，例如 `/config/workspace/my_cron_jobs.txt`。
2. 把你的任务写进去（记得加换行）：

    ```text
    * * * * * /bin/date >> /config/workspace/cron_test.log 2>&1
    # 这里可以继续加其他任务
    ```

## 第二步：创建自动加载脚本

LinuxServer 镜像会在启动时自动运行 `/config/custom-cont-init.d/` 目录下的脚本。我们要在这里放一个脚本，每次开机把上面的 txt 文件“灌入”到 Cron 系统里。

1. 创建脚本目录（如果不存在）：

    ```bash
    mkdir -p /config/custom-cont-init.d
    ```

2. 创建启动脚本：

    ```bash
    nano /config/custom-cont-init.d/99-apply-cron
    ```

3. 在编辑器中粘贴以下内容：

    ```bash
    #!/bin/bash
    
    echo "Applying custom cron jobs..."
    
    # 检查你的规则文件是否存在
    if [ -f /config/workspace/my_cron_jobs.txt ]; then
        # 将文件里的规则应用给 abc 用户
        crontab -u abc /config/workspace/my_cron_jobs.txt
        echo "Cron jobs updated for user abc."
    else
        echo "No custom cron file found at /config/workspace/my_cron_jobs.txt"
    fi
    
    # 确保 cron 服务的相关权限正确 (修正一些常见的 s6 权限问题)
    chown abc:abc /var/spool/cron/crontabs/abc
    chmod 0600 /var/spool/cron/crontabs/abc
    ```

4. 保存并退出（Ctrl+O, Enter, Ctrl+X）。

5. **关键一步**：给脚本赋予执行权限：

    ```bash
    chmod +x /config/custom-cont-init.d/99-apply-cron
    ```

## 第三步：验证

现在，你可以放心地重启 Docker 容器了。

1. 重启容器：`docker restart <你的容器名>`
2. 等待容器启动后，观察日志：

    ```bash
    docker logs <你的容器名>
    ```

    你应该能在启动日志的前面部分看到 `Applying custom cron jobs...` 和 `Cron jobs updated for user abc.`。
3. 过一分钟，检查 `/config/workspace/cron_test.log`，你会发现时间戳在不断更新。

### 这种方法的好处

1. **不怕容器删除**：你的 Cron 规则保存在 `/config/workspace/my_cron_jobs.txt` 里，这个目录是挂载到宿主机的，只要文件还在，任务就在。
2. **自动生效**：每次容器启动，脚本都会强行刷新一次 Crontab，不需要手动 `pkill`。
3. **版本控制**：你可以像管理代码一样管理那个 txt 文件。
