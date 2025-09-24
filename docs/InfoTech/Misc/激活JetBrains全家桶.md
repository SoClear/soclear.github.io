# 激活JetBrains全家桶

## 方法一

访问 [https://jetbra.in/s](https://jetbra.in/s)

## 方法二

> 当前适配系统：
>
> Windows10、Windows11
>
> Ubuntu 24.04.2 LTS
>
> MacOS Sequoia 15.2

今天话不多说，直接开始！

只需要输入一行命令，无需手动下载任何文件（不是不下载文件，而是不用手动下载，不用手动输入激活码等）就可以自动扫描当前系统中安装的JetBrains系列软件

下面以最新版本的Idea为例，详细讲解一下操作步骤：

___

食用方法：

1. Windows

    - 键盘使用“Win+X”快捷键，选择“终端管理员”

    - 手动输入或复制下方命令到终端中执行

    ```powershell
    irm ckey.run|iex
    ```

    - 关闭所有 JetBrains 软件，回车，等待激活完成：

2. Linux

    ```shell
    wget --no-check-certificate ckey.run -O ckey.run && bash ckey.run
    ```

3. Mac

    ```shell
    curl -L -o ckey.run ckey.run && bash ckey.run
    ```

方法二转自：[懒人福利：一键激活JetBrains全家桶](https://mp.weixin.qq.com/s/Vhjfcp01_phLp_JTypy09w)
