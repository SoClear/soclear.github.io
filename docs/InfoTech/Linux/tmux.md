# tmux终端复用

## 前置知识

> 命令行的典型使用方式是，打开一个终端窗口（terminal window，以下简称"窗口"），在里面输入命令。用户与计算机的这种临时的交互，称为一次"会话"（session） 。
>
> 会话的一个重要特点是，窗口与其中启动的进程是连在一起的。打开窗口，会话开始；关闭窗口，会话结束，会话内部的进程也会随之终止，不管有没有运行完。
>
> 一个典型的例子就是，SSH 登录远程计算机，打开一个远程窗口执行命令。这时，网络突然断线，再次登录的时候，是找不回上一次执行的命令的。因为上一次 SSH 会话已经终止了，里面的进程也随之消失了。
>
> 为了解决这个问题，会话与窗口可以"解绑"：窗口关闭时，会话并不终止，而是继续运行，等到以后需要的时候，再让会话"绑定"其他窗口。
>
> 引用自 [阮一峰的网络日志](http://www.ruanyifeng.com/blog/2019/10/tmux.html)

一个*会话session*通常指一个任务里面可以有很多*窗口window*，一个窗口又可以有很多的*窗格pane*。  
前缀键Ctrl+B

## 安装

`apt/yum/brew install tmux`

## 会话 session

| 功能                            | 命令                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| 使用会话名称切换会话            | `tmux switch -t [session-name]`                                |
| 使用会话名称接入会话            | `tmux attach -t [session-name]`<br/>`tmux a -t [session-name]` |
| 使用会话名称杀死会话            | `tmux kill-session -t [session-name]`                          |
| 使用会话编号切换会话            | `tmux switch -t 0`                                             |
| 使用会话编号接入会话            | `tmux attach -t 0`<br/>`tmux a -t 0`                           |
| 使用会话编号杀死会话            | `tmux kill-session -t 0`                                       |
| 创建以[session-name] 命名的会话 | `tmux new -s [session-name]`                                   |
| 创建以序号命名的会话            | `tmux`                                                         |
| 查看所有会话 s                  | `tmux ls`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>S</kbd>        |
| 离开会话 d                      | `tmux detach`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>D</kbd>    |
| 重命名会话                      | `tmux rename-session -t [old-name] [new-name]`                 |
| 重命名当前会话$                 | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>$</kbd>                      |

## 窗口 window

| 功能                                                                              | 命令                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 关闭当前窗口&                                                                     | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>&</kbd>                                            |
| 关闭窗口                                                                          | `tmux kill-window -t [window-name]`                                                  |
| 切换到指定序号的窗口[number]                                                      | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>[number]</kbd>                                     |
| 创建窗口 n                                                                        | `tmux new-window -n [window-name]`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>C</kbd>     |
| 快速切换到上一个窗口 p                                                            | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>P</kbd>                                            |
| 快速切换到下一个窗口 n                                                            | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>N</kbd>                                            |
| 显示窗口列表 ctrl + b w 可以通过 j , k 上下进行选择窗口，然后回车进入指定的窗口。 | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>W</kbd>                                            |
| 相邻窗口切换 l                                                                    | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>L</kbd>                                            |
| 重命名窗口,                                                                       | `tmux rename-window [new-window-name]`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>,</kbd> |

## 窗格 pane

| 功能                                    | 命令                                                                 |
| --------------------------------------- | -------------------------------------------------------------------- |
| 上下切割窗格"                           | `tmux split-window`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>"</kbd>    |
| 关闭窗格 x                              | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>X</kbd>                            |
| 切换到上一个窗格;                       | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>;</kbd>                            |
| 切换到下一个窗格 o                      | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>O</kbd>                            |
| 左右切割窗格%                           | `tmux split-window -h`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>%</kbd> |
| 当前窗格向上移动                        | `tmux swap-pane -U`                                                  |
| 当前窗格向下移动                        | `tmux swap-pane -D`                                                  |
| 放大窗格（再次触发该快捷键将恢复原来）z | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>Z</kbd>                            |
| 显示时间（按 Enter 复原）t              | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>T</kbd>                            |
| 移动到上方的窗格 ↑                      | `tmux select-pane -U`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>↑</kbd>  |
| 移动到下方的窗格 ↓                      | `tmux select-pane -D`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>↓</kbd>  |
| 移动到右方的窗格 →                      | `tmux select-pane -R`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>→</kbd>  |
| 移动到左方的窗格 ←                      | `tmux select-pane -L`<br/><kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>←</kbd>  |
| 退出                                    | `exit`<br/><kbd>Ctrl</kbd>+<kbd>D</kbd>                              |

## 其他命令

| 功能     | 命令                                      |
| -------- | ----------------------------------------- |
| 进入帮助 | <kbd>Ctrl</kbd>+<kbd>B</kbd> <kbd>?</kbd> |
| 退出     | `exit`<br/><kbd>Ctrl</kbd>+<kbd>D</kbd>   |
| 退出帮助 | <kbd>ESC</kbd><br/><kbd>q</kbd>           |

## 自定义前置键

在~/.tmux.conf中更改前缀键为Ctrl+x

```text
#below reset tmux prefix command key
set -g prefix C-x
unbind C-b
bind C-x send-prefix
```
