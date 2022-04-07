# init

Git 使用 `git init` 命令来初始化一个 Git 仓库，Git 的很多命令都需要在 Git 的仓库中运行，所以 `git init` 是使用 Git 的第一个命令。

在执行完成 `git init` 命令后，Git 仓库会生成一个 .git 目录，该目录包含了资源的所有元数据，其他的项目目录保持不变。

使用方法:  

|需求|命令|作用|
|-|-|-|
|使用当前目录作为Git仓库，我们只需使它初始化。                                                         |`git init`                                           |该命令执行完后会在当前目录生成一个 .git 目录。|
|使用我们指定目录作为Git仓库。                                                                       |`git init newrepo` |初始化后，会在 newrepo 目录下会出现一个名为 .git 的目录，所有 Git 需要的数据和资源都存放在这个目录中。|
|如果当前目录下有几个文件想要纳入版本控制，需要先用 git add 命令告诉 Git 开始对这些文件进行跟踪，然后提交：| `$ git add *.c`<br/>`$ git add README`<br/>`$ git commit -m '初始化项目版本'`|以上命令将目录下以 .c 结尾及 README 文件提交到仓库中。|

注:  
在 Linux 系统中，commit 信息使用单引号 '，Windows 系统，commit 信息使用双引号 "。  
所以在 git bash 中 `git commit -m '提交说明'` 这样是可以的，在 Windows 命令行中就要使用双引号 `git commit -m "提交说明"`。
