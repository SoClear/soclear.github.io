# clone

我们使用 git clone 从现有 Git 仓库中拷贝项目（类似 svn checkout）。  

|需求|命令|解释|
|-|-|-|
| 克隆仓库的命令格式为                                            | `git clone <repo>`                                   | • repo:Git 仓库。       |
| 如果我们需要克隆到指定的目录，可以使用以下命令格式：               | `git clone <repo> <directory>`                       | 参数说明：<br/>• repo:Git 仓库。<br/>• directory:本地目录。|
| 比如，要克隆 Ruby 语言的 Git 代码仓库 Grit，可以用下面的命令:     | `git clone git://github.com/schacon/grit.git`| 执行该命令后，会在当前目录下创建一个名为grit的目录，其中包含一个 .git 的目录，用于保存下载下来的所有版本记录。 |
| 如果要自己定义要新建的项目目录名称，可以在上面的命令末尾指定新的名字：| `git clone git://github.com/schacon/grit.git mygrit` | mygrit是指定的名字。    |