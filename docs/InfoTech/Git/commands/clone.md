# clone

我们使用 git clone 从现有 Git 仓库中拷贝项目（类似 svn checkout）。  

| 需求                                                                   | 命令                                                 | 解释                                                                                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 克隆仓库的命令格式为                                                   | `git clone <repo>`                                   | • repo:Git 仓库。                                                                                              |
| 如果我们需要克隆到指定的目录，可以使用以下命令格式：                   | `git clone <repo> <directory>`                       | 参数说明：<br/>• repo:Git 仓库。<br/>• directory:本地目录。                                                    |
| 比如，要克隆 Ruby 语言的 Git 代码仓库 Grit，可以用下面的命令:          | `git clone git://github.com/schacon/grit.git`        | 执行该命令后，会在当前目录下创建一个名为grit的目录，其中包含一个 .git 的目录，用于保存下载下来的所有版本记录。 |
| 如果要自己定义要新建的项目目录名称，可以在上面的命令末尾指定新的名字： | `git clone git://github.com/schacon/grit.git mygrit` | mygrit是指定的名字。                                                                                           |
| 克隆非22端口的项目                                                     | `git clone ssh://git@<hostname>:<port>/<作者>/<项目名>.git`                                                     |hostname 可以是网址也可以是IP                                                                                                   |

## 浅层克隆

在处理大型仓库或网络条件较差时，只获取最新一次提交可以显著提升克隆速度并减少磁盘占用。Git 提供了 **浅层克隆（Shallow Clone）** 功能来实现这一需求。

执行浅克隆命令 `git clone --depth 1 <仓库地址>`

指定分支（可选） 如果只需要某个分支的最新提交：`git clone --depth 1 --branch main <仓库地址>`

验证结果，执行：`git log --oneline`

### 注意事项

功能限制：浅克隆无法查看完整历史，git blame、rebase、跨分支切换等操作可能受限。

推送限制：部分 Git 服务端可能拒绝从浅克隆直接推送。

扩展历史：如需更多历史，可执行：

```bash
git fetch --depth=<N> # 增加到最近 N 次提交
git fetch --unshallow # 转换为完整克隆
```

### 最佳实践

- 在 CI/CD、部署环境或仅需最新代码的场景中使用 --depth 1。

- 避免在浅克隆上进行长期开发，如需复杂操作请先转换为完整克隆。

- 可结合 `--filter=blob:none` 与稀疏检出（sparse checkout）进一步减少下载内容：

```bash
git clone --depth 1 --filter=blob:none --sparse <仓库地址>
cd 项目目录
git sparse-checkout add path/to/folder
```

这样，你就能快速获取所需代码，同时最大限度节省时间与资源。
