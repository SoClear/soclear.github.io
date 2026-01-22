# commands

## add

添加所有文件到暂存区: `git add .`  
添加指定文件到暂存区: `git add [文件名]`

## blame

以列表形式查看***指定文件***的历史修改记录。
例子:

```bash
$ git blame README
^d2097aa (tianqixin 2020-08-25 14:59:25 +0800 1) # Runoob Git 测试
db9315b0 (runoob    2020-08-25 16:00:23 +0800 2) # 菜鸟教程
```

## branch

| 功能                               | 命令                             |
| ---------------------------------- | -------------------------------- |
| 列出所有本地分支                   | `git branch`                     |
| 列出所有远程分支                   | `git branch -r`                  |
| 新建一个分支，但依然停留在当前分支 | `git branch [branch-name]`       |
| 删除分支                           | `git branch -d [branch-name]`    |
| 不做检查，强制删除分支             | `git branch -D [branch-name]`    |
| 删除远程分支                       | `git branch -dr [remote/branch]` |

## clone

我们使用 git clone 从现有 Git 仓库中拷贝项目（类似 svn checkout）。

| 需求                                                                   | 命令                                                        | 解释                                                                                                           |
| ---------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 克隆仓库的命令格式为                                                   | `git clone <repo>`                                          | • repo:Git 仓库。                                                                                              |
| 如果我们需要克隆到指定的目录，可以使用以下命令格式：                   | `git clone <repo> <directory>`                              | 参数说明：<br/>• repo:Git 仓库。<br/>• directory:本地目录。                                                    |
| 比如，要克隆 Ruby 语言的 Git 代码仓库 Grit，可以用下面的命令:          | `git clone git://github.com/schacon/grit.git`               | 执行该命令后，会在当前目录下创建一个名为grit的目录，其中包含一个 .git 的目录，用于保存下载下来的所有版本记录。 |
| 如果要自己定义要新建的项目目录名称，可以在上面的命令末尾指定新的名字： | `git clone git://github.com/schacon/grit.git mygrit`        | mygrit是指定的名字。                                                                                           |
| 克隆非22端口的项目                                                     | `git clone ssh://git@<hostname>:<port>/<作者>/<项目名>.git` | hostname 可以是网址也可以是IP                                                                                  |

### 浅层克隆

在处理大型仓库或网络条件较差时，只获取最新一次提交可以显著提升克隆速度并减少磁盘占用。Git 提供了 **浅层克隆（Shallow Clone）** 功能来实现这一需求。

执行浅克隆命令 `git clone --depth 1 <仓库地址>`

指定分支（可选） 如果只需要某个分支的最新提交：`git clone --depth 1 --branch main <仓库地址>`

验证结果，执行：`git log --oneline`

#### 注意事项

功能限制：浅克隆无法查看完整历史，git blame、rebase、跨分支切换等操作可能受限。

推送限制：部分 Git 服务端可能拒绝从浅克隆直接推送。

扩展历史：如需更多历史，可执行：

```bash
git fetch --depth=<N> # 增加到最近 N 次提交
git fetch --unshallow # 转换为完整克隆
```

#### 最佳实践

- 在 CI/CD、部署环境或仅需最新代码的场景中使用 --depth 1。

- 避免在浅克隆上进行长期开发，如需复杂操作请先转换为完整克隆。

- 可结合 `--filter=blob:none` 与稀疏检出（sparse checkout）进一步减少下载内容：

```bash
git clone --depth 1 --filter=blob:none --sparse <仓库地址>
cd 项目目录
git sparse-checkout add path/to/folder
```

这样，你就能快速获取所需代码，同时最大限度节省时间与资源。

## commit

| 命令                                          | 解释                                                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git commit -m [message]`                     | 提交暂存区到本地仓库中                                                                                                                             |
| `git commit [file1] [file2] ... -m [message]` | 提交暂存区的指定文件到仓库区                                                                                                                       |
| `git commit -a`                               | -a 参数设置修改文件后不需要执行 git add 命令，直接来提交。<br/>适用于被修改和被删除的文件，不适用于新建的文件。<br/>例如 git commit -am '提交信息' |

## config

### 显示当前的 git 配置信息

```bash
$ git config --list
credential.helper=osxkeychain
core.repositoryformatversion=0
core.filemode=true
core.bare=false
core.logallrefupdates=true
core.ignorecase=true
core.precomposeunicode=true
```

### 查看系统config

`git config --system --list`

注: 文件位置为/etc/gitconfig

### 查看当前用户（global）配置

`git config --global  --list`

注: 文件位置为~/.gitconfig

### 编辑 git 配置文件

```bash
git config -e  # 针对当前仓库
git config -e --global   # 针对系统上所有仓库
```

### 设置提交代码时的用户信息

```bash
git config --global user.name "runoob"
git config --global user.email test@runoob.com
```

注: 如果去掉 --global 参数只对当前仓库有效。

### credential.helper

[转自CSDN](https://blog.csdn.net/u012163684/article/details/52433645)

#### 现实场景

在使用Git进行开发的时候，我们可以使用ssh url或者http url来进行源码的clone/push/pull。  
二者的区别是，使用ssh url需要在本地配置ssh key，这也就意味着你必须是开发者或者有一定的权限，每次的代码同步（主要是push和clone）不需要进行用户名和密码的输入操作；  
那么http url就相对宽松些，但是需要在每次同步操作输入用户名和密码，有时候，为了省去每次都输入密码的重复操作，我们可以在本地新建一个文件，来存储你的用户名和密码，只需要在第一次clone输入用户名和密码，这些信息就被存储起来，以后就可以自动读取，不需要你在手动输入了。  
在Git官网介绍了这一实现，是通过叫做credential helper的小玩意儿实现的。可以把它叫做证书或者凭证小助手，它帮我们存储了credential(凭证，里面包含了用户名和密码)，这是地址：[https://git-scm.com/docs/gitcredentials](https://git-scm.com/docs/gitcredentials) 下面是我根据官网介绍进行的简单的翻译。如果不想搞明白原理，或者觉得我的翻译比较渣，可以直接跳到最后的实践去看实际操作。

#### 基本介绍

Git有时需要从用户读取证书来执行某些操作，例如，有时可能会向用户索要用户名和密码去通过Http协议访问远程的仓库，下面是Git在寻找证书时候的机制，这和某些时候避免重复输入密码的特点一样。

当没有任何的证书小助手(credential helpers)定义的时候，Git将会按照如下的策略检查，并请求用户输入用户名和密码

- `GIT_ASKPASS`环境变量
- `core.askPass`配置
- `SSH_ASKPASS`配置

上述都没有。最终直接要求用户在terminal输入密码

要求用户一次次重复地输入密码证书是十分笨的逻辑，Git提供了两种方法来减少这种情况：

1. 在给定的认证环境中静态地配置用户名（这种方式还没研究过）
2. 凭据（credential）帮助缓存或者存储密码，或者和系统交互获得密码（password wallet or keychain）

第一种方式比较简单合适，如果你并没有一个密码的安全存储地，一般在config中加入下面的语句：

```text
[credential "https://example.com"]
username = me
```

第二种方式使用Credential helpers。Credentials helpers是一种外置的程序代码，Git可以从那里取得用户名和密码。credentials helpers通常和操作系统或者其他程序提供的安全存储交互。  
为了使用helper，你必须首先选择一个使用。Git现在包含了如下的两个helper：

1. Cache  
   cache 将凭据在内存中进行短时间的缓存，详情见 [https://git-scm.com/docs/git-credential-cache](https://git-scm.com/docs/git-credential-cache)

   会将凭证存放在内存中一段时间。 密码永远不会被存储在磁盘中，并且在15分钟后从内存中清除。

2. Store  
   store 将凭据保存在磁盘上，详情见 [https://git-scm.com/docs/git-credential-store](https://git-scm.com/docs/git-credential-store)  
   当然你也可能有第三方的helper，在git help -a的输出中使用 credential-\*进行搜索，并且参考每个helper的文档。一旦你选择了一个helper，你可以通过把helper的name放到credentials.helper的变量中来告诉Git使用哪个helper。

   会将凭证用明文的形式存放在磁盘中，并且永不过期。 这意味着除非你修改了你在 Git 服务器上的密码，否则你永远不需要再次输入你的凭证信息。 这种方式的缺点是你的密码是用明文的方式存放在你的 home 目录下。

- 例如寻找一个helper  
  `$ git help -a | grep credential foo`

- 查看介绍  
  `$ git help credential-foo`

- 通知Git使用某个helper  
  `$ git config --global credential.helper foo`  
  例如：  
  `git config --global credential.helper store`  
  会使你省去你每次使用 http url clone/push/pull 时输入账号密码的麻烦。

如果在credential.helper的配置变量中有多个实例，Git会轮流尝试他们，这个过程中，可能会提供用户名，用户密码，或者什么都没有。  
一旦Git同时取得了用户名和用户密码，Git不再会尝试其他helper。  
如果credential.helper被设置为空字符串，这会把helper列表重置为空，这也就是说，你可以通过配置空的字符串helper，并在后面接上你想要的任何helper来覆盖一个helper set。

#### 凭据上下文环境

Git认为每个凭据通过URL定义了各自的上下文环境。这个环境被用来关联环境配置，并且被传给了任何一位helper，这样也许可以使用这个环境作为安全存储的索引。  
例如，假设我们要访问<http://example.com/foo.git>。当Git在config文件查询是否有一个部分符合这个环境。如果上下文环境是一个config文件里配置pattern更为详细的子集，那么就认为这两个是匹配的。例如，如果你在你的config文件中有如下 :

```text
[credential "https://example.com"]
username = foo
```

然后，我们认为下述条件是匹配的：当传入的URL和上述定义协议一致，主机名一致，并且模式URL并不关心路径的组成。然而这种context并不会匹配：

```text
[credential "https://kernel.org/"]
username = foo
```

因为主机名不匹配。这种情况如“foo.example.com”也不会匹配Git会很精确地匹配主机名，并且不会考虑两个主机名是否是同一个域（domain）。类似的，当config 配置为”`"http://example.com"`也不会匹配,因为协议不一样。

#### credential配置选项

credential context的配置选项可以被配置为 credential. *来应用到全部的credential，或者配置为credential..* ，这样url会匹配之前讲到的context。  
下面的是一些配置选项

- helper
- username

一个默认的用户名，当在URL中没有提供用户名时使用  
useHttpPath  
默认的，在使用外置的helpers时，Git并不把path考虑在匹配的范畴，也就是说`"https://example.com/foo.git"`的凭证也适用与`"https://example.com/bar.git"`，如果想要使用path来区分前面说过的两种情况，可以设置这个属性为true。  
当然你也可以写自定义的helper

#### 实践

1. 先查看先查看我们系统支持哪种helper  
   `git help -a | grep credential`

   ```sh
   $ git help -a | grep credential
   credential           Retrieve and store user credentials
   credential-cache     Helper to temporarily store passwords in memory
   credential-store     Helper to store credentials on disk
   ```

   cache是存储在内存中，可以设定有效时间但是时间过去后，将会失效；store是存储在磁盘上，不过用户名和密码是明文存储的，对于一般使用来说没太大差别，要是想加密存储，可是使用gnome-keyring来存储。这里我们选择使用store的方式。

2. 设置credential helper  
   凭据可以设置为全局，也可以设置为仅仅在当前的项目下起作用。  
   如果想使用全局，则设置为：  
   `git config --global credential.helper store --file=git-credentails`.  
   如果仅仅设置当前项目有效，则进入项目代码目录下，运行：  
   `git config credential.helper store --file=.git-credentails`.  
   上面的`--file=.git-credentials`表示你的用户名密码存储的文件目录结构，即存放在哪里由你指定。

3. 查看配置  
   如果你的凭证位置没有指定，则去用户目录下查看，发现多了一个 `.git-credentials` 文件，打开文件可以看到里面以明文存放你的用户名和密码（进行第四部分后才会有）。  
   然后在你的项目目录下运行指令  
   `git config –list`  
   发现配置文件多了一项 `credential.helper=store`

   ```text
   user.name=[your name]
   user.email=[your email]
   credential.helper=store
   core.autocrlf=true
   ```

4. 同步一下  
   尝试在项目文件下输入  
   `push <http://你的远程仓库url>`  
   这回提示输入用户名和密码，正确输入后，以后的每一次都可以直接push了。

## diff

git diff 命令比较文件的不同，即比较文件在暂存区和工作区的差异。
git diff 命令显示已写入暂存区和已经被修改但尚未写入暂存区文件的区别。

| 命令                                                          | 解释                                 |
| ------------------------------------------------------------- | ------------------------------------ |
| `git diff`                                                    | 查看尚未缓存的改动                   |
| `git diff --cached`                                           | 查看已缓存的改动                     |
| `git diff HEAD`                                               | 查看已缓存的与未缓存的所有改动       |
| `git diff --stat`                                             | 显示摘要而非整个 diff                |
| `git diff [file]`                                             | 显示暂存区和工作区的差异             |
| `git diff --cached [file]`<br/>或者`git diff --staged [file]` | 显示暂存区和上一次提交(commit)的差异 |
| `git diff [first-branch]...[second-branch]`                   | 显示两次提交之间的差异               |

`git status` 显示你上次提交更新后的更改或者写入缓存的改动，
而 `git diff` 一行一行地显示这些改动具体是啥。

## fetch

### 作用

抓取指令就是将仓库里的更新都抓取到本地，不会进行合并  
如果不指定远端名称和分支名，则抓取所有分支。

### 语法

`git fetch <远程主机名> <本地分支名>:<远程分支名>`  
如果本地分支名与远程分支名相同，则可以省略冒号：  
`git fetch <远程主机名> <本地分支名>`

## init

Git 使用 `git init` 命令来初始化一个 Git 仓库，Git 的很多命令都需要在 Git 的仓库中运行，所以 `git init` 是使用 Git 的第一个命令。

在执行完成 `git init` 命令后，Git 仓库会生成一个 .git 目录，该目录包含了资源的所有元数据，其他的项目目录保持不变。

使用方法:

| 需求                                                                                                       | 命令                                                                          | 作用                                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 使用当前目录作为Git仓库，我们只需使它初始化。                                                              | `git init`                                                                    | 该命令执行完后会在当前目录生成一个 .git 目录。                                                         |
| 使用我们指定目录作为Git仓库。                                                                              | `git init newrepo`                                                            | 初始化后，会在 newrepo 目录下会出现一个名为 .git 的目录，所有 Git 需要的数据和资源都存放在这个目录中。 |
| 如果当前目录下有几个文件想要纳入版本控制，需要先用 git add 命令告诉 Git 开始对这些文件进行跟踪，然后提交： | `$ git add *.c`<br/>`$ git add README`<br/>`$ git commit -m '初始化项目版本'` | 以上命令将目录下以 .c 结尾及 README 文件提交到仓库中。                                                 |

注:  
在 Linux 系统中，commit 信息使用单引号 '，Windows 系统，commit 信息使用双引号 "。  
所以在 git bash 中 `git commit -m '提交说明'` 这样是可以的，在 Windows 命令行中就要使用双引号 `git commit -m "提交说明"`。

## log

`git log [参数]`用来查看历史提交记录

| 参数                                                 | 解释                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| 无参数                                               | 列出详细历史提交记录                                          |
| `--oneline`                                          | 查看历史记录的简洁的版本                                      |
| `--graph`                                            | 查看历史中什么时候出现了分支、合并。开启了拓扑图              |
| `--reverse`                                          | 逆向显示                                                      |
| `--author=[username]`                                | 只查找指定用户[username]的提交日志                            |
| `--since`<br/>`--before`<br/>`--until`<br/>`--after` | 指定日期<br/>例子:--before={3.weeks.ago} --after={2010-04-18} |
| `--no-merges`                                        | 隐藏合并提交                                                  |

## mv

移动或重命名工作区文件。

## pull

### 作用

- 拉取拉取指令就是将远端仓库的修改拉到本地并自动进行合并，等同于fetch+merge
- 如果不指定远端名称和分支名，则抓取所有并更新当前分支。

### 语法

`git pull <远程主机名> <本地分支名>:<远程分支名>`
如果本地分支名与远程分支名相同，则可以省略冒号：
`git pull <远程主机名> <本地分支名>`

`git pull = git fetch + git merge`  
`git pull --rebase = git fetch + git rebase`

## push

### 作用

git push 命用于从将本地的分支版本上传到远程并合并。

### 命令格式

`git push <远程主机名> <本地分支名>:<远程分支名>`
<远程主机名>是为远程仓库起的名字
如果本地分支名与远程分支名相同，则可以省略冒号：
`git push <远程主机名> <本地分支名>`

### 常见用法

| 需求                                                                                                                       | 命令                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 如果远程仓库的分支名字与本地仓库分支名字相同，可以只写一遍。右侧命令将本地的 master 分支推送到 origin 主机的 master 分支。 | `git push origin master`相当于`git push origin master:master`                                                                                         |
| 如果当前分支与多个主机存在追踪关系，则可以使用 -u 参数指定一个默认主机，这样后面就可以不加任何参数使用`git push`           | `git push -u origin master`<br/>等价于<br/>`git push --set-upstream origin master`<br/>注：origin是远程仓库名，master是本地仓库和远程仓库共有的名字。 |
| 如果本地版本与远程版本有差异，但又要强制推送可以使用 `--force` 参数                                                        | `git push --force origin master`                                                                                                                      |
| 删除主机的分支可以使用 `--delete` 参数，右侧命令表示删除 `origin` 主机的 `master` 分支                                     | `git push origin --delete master`                                                                                                                     |
| 如果当前分支已经和远端分支关联，则可以省略远端名和分支名。                                                                 | `git push`                                                                                                                                            |

## rebase

### 工作流程

假设Git目前只有一个分支master。开发人员的工作流程是

- 1、`git clone master branch`
- 2、在自己本地`git checkout -b local`创建一个本地开发分支
- 3、在本地的开发分支上开发和测试
- 4、阶段性开发完成后（包含功能代码和单元测试），可以准备提交代码
- 5、提交代码流程：
  - 5.1、首先切换到master分支，`git pull`拉取最新的分支状态
  - 5.2、然后切回local分支
  - 5.3、通过 `git rebase -i` 将本地的多次提交合并为一个，以简化提交历史。本地有多个提交时,如果不进行这一步,在git rebase master时会多次解决冲突(最坏情况下,每一个提交都会相应解决一个冲突)
  - 5.4、然后切换到master分支，`git merge` 将本地的local分支内容合并到master分支
  - 5.5、`git push` 将master分支的提交上传

用rebase灵活管理本地开发分支

### 代码示例

```bash
git checkout master
git pull
git checkout local
git rebase -i HEAD~2  //合并提交 --- 2表示合并两个
git rebase master---->解决冲突--->git rebase --continue
git checkout master
git merge local
git push
```

## remote

| 命令                                  | 解释                                                                                                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git remote`                          | 查看远程仓库                                                                                                                                                                              |
| `git remote -v`                       | 显示所有远程仓库（含远程仓库的地址）                                                                                                                                                      |
| `git remote show [remote]`            | 显示某个远程仓库的信息                                                                                                                                                                    |
| `git remote add [shortname] [url]`    | 给远程仓库`[url]`起名为`[shortname]`，默认是origin. <br/>例如提交到 Github: <br/>`$ git remote add origin git@github.com:tianqixin/runoob-git-test.git`<br/>`$ git push -u origin master` |
| `git remote rm name`                  | 删除远程仓库                                                                                                                                                                              |
| `git remote rename old_name new_name` | 修改仓库名                                                                                                                                                                                |

## reset

### 作用

用于回退版本，可以指定退回某一次提交的版本。

### 语法

`git reset [--soft | --mixed | --hard] [HEAD]`

#### HEAD 说明

##### ^…

| 格式     | 意义           |
| -------- | -------------- |
| HEAD     | 表示当前版本   |
| HEAD^    | 上一个版本     |
| HEAD^^   | 上上一个版本   |
| HEAD^^^  | 上上上一个版本 |
| HEAD^^^… | 以此类推...    |

##### ～数字

| 格式   | 意义           |
| ------ | -------------- |
| HEAD~0 | 表示当前版本   |
| HEAD~1 | 上一个版本     |
| HEAD~2 | 上上一个版本   |
| HEAD~3 | 上上上一个版本 |
| HEAD~n | 以此类推...    |

#### [--soft | --mixed | --hard]

##### git reset --mixed

为默认，可以不用带该参数，用于重置暂存区的文件与上一次的提交(commit)保持一致，工作区文件内容保持不变。
用法：
`git reset  [HEAD]`
例：

```bash
git reset HEAD^            # 回退所有内容到上一个版本
git reset HEAD^ hello.php  # 回退 hello.php 文件的版本到上一个版本
git reset 052e             # 回退到指定版本
```

##### git reset --soft

用于回退到某个版本  
用法：  
`git reset --soft HEAD`  
实例：  
`$ git reset --soft HEAD~3 # 回退上上上一个版本`

##### git reset --hard

参数撤销工作区中所有未提交的修改内容，将暂存区与工作区都回到上一次版本，并删除之前的所有信息提交  
用法：  
`git reset --hard`  
实例：

```bash
git reset –hard HEAD~3  # 回退上上上一个版本
git reset –hard bae128  # 回退到某个版本回退点之前的所有信息。
git reset --hard origin/master    # 将本地的状态回退到和远程的一样
```

注意：谨慎使用 –hard 参数，它会删除回退点之前的所有信息。

#### git reset HEAD

git reset HEAD 命令用于取消已缓存的内容。

实例：
我们先改动文件 README 文件，内容如下：

```bash
# Runoob Git 测试
# 菜鸟教程
```

hello.php 文件修改为：

```bash
<?php
echo '菜鸟教程：www.runoob.com';
echo '菜鸟教程：www.runoob.com';
echo '菜鸟教程：www.runoob.com';
?>
```

现在两个文件修改后，都提交到了缓存区，我们现在要取消其中一个的缓存，操作如下:

```bash
$ git status -s
    M README
    M hello.php
$ git add .
$ git status -s
M  README
M  hello.php
$ git reset HEAD hello.php
Unstaged changes after reset:
M    hello.php
$ git status -s
M  README
    M hello.php
```

现在你执行 git commit，只会将 README 文件的改动提交，而 hello.php 是没有的。

```bash
$ git commit -m '修改'
[master f50cfda] 修改
    1 file changed, 1 insertion(+)
$ git status -s
    M hello.php
```

可以看到 hello.php 文件的修改并未提交。
这时我们可以使用以下命令将 hello.php 的修改提交：

```bash
$ git commit -am '修改 hello.php 文件'
[master 760f74d] 修改 hello.php 文件
    1 file changed, 1 insertion(+)
$ git status
On branch master
nothing to commit, working directory clean
```

简而言之，执行 git reset HEAD 以取消之前 git add 添加，但不希望包含在下一提交快照中的缓存。

## rm

删除工作区文件。

## status

查看指定文件状态: `git status [filename]`  
查看所有文件状态: `git status`

## tag

### 介绍

如果你达到一个重要的阶段，并希望永远记住那个特别的提交快照，你可以使用 git tag 给它打上标签。

发布一个版本时，我们通常先在版本库中打一个标签（tag），这样就唯一确定了打标签时刻的版本。将来无论什么时候，取某个标签的版本，就是把那个打标签的时刻的历史版本取出来。
所以，标签也是版本库的一个快照。

Git 的标签虽然是版本库的快照，但其实它就是指向某个 commit 的指针（跟分支很像对不对？但是分支可以移动，标签不能移动），所以，创建和删除标签都是瞬间完成的。

Git有commit，为什么还要引入tag？
"请把上周一的那个版本打包发布，commit号是6a5819e…"
"一串乱七八糟的数字不好找！"
如果换一个办法：
"请把上周一的那个版本打包发布，版本号是v1.2"
"好的，按照tag v1.2查找commit就行！"

所以，tag就是一个让人容易记住的有意义的名字，它跟某个commit绑在一起。

同大多数 VCS 一样，Git 也可以对某一时间点上的版本打上标签。人们在发布某个软件版本（比如 v1.0 等等）的时候，经常这么做。

### 标签分类

#### 轻量级的（lightweight）

轻量级标签就像是个不会变化的分支，实际上它就是个指向特定提交对象的引用。

如果只是临时性加注标签，或者不需要旁注额外信息，用轻量级标签也没问题。

例子:`git tag v1.0`

#### 含附注的（annotated）

而含附注标签，实际上是存储在仓库中的一个独立对象，它有自身的校验和信息，包含着标签的名字，电子邮件地址和日期，以及标签说明，标签本身也允许使用 GNU Privacy Guard (GPG) 来签署或验证。

**一般我们都建议使用含附注型的标签，以便保留相关信息；**

例子:`git tag -a v1.0` (必须写注解)

### 命令

| 功能                                     | 命令                                 |
| ---------------------------------------- | ------------------------------------ |
| 查看所有标签                             | `git tag`                            |
| 创建轻量级标签                           | `git tag [tag name]`                 |
| 创建含附注的标签（打开文本编辑器写注解） | `git tag -a [tag name]`              |
| 创建含附注的标签并直接加注解             | `git tag -a [tag name] -m [message]` |
| 删除标签[tag name]                       | `git tag -d [tag name]`              |
| 查看此标签(此版本)修改的内容和tag附注    | `git show [tag name]`                |
| 为已经发布的提交追加标签                 | `git tag -a [tag name] [commit号]`   |
