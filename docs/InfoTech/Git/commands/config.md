# config

## 显示当前的 git 配置信息

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

## 查看系统config

`git config --system --list`

注: 文件位置为/etc/gitconfig

## 查看当前用户（global）配置

`git config --global  --list`

注: 文件位置为~/.gitconfig

## 编辑 git 配置文件

```bash
git config -e  # 针对当前仓库 
git config -e --global   # 针对系统上所有仓库
```

## 设置提交代码时的用户信息

```bash
git config --global user.name "runoob"
git config --global user.email test@runoob.com 
```

注: 如果去掉 --global 参数只对当前仓库有效。

## credential.helper

[转自CSDN](https://blog.csdn.net/u012163684/article/details/52433645)

### 现实场景

在使用Git进行开发的时候，我们可以使用ssh url或者http url来进行源码的clone/push/pull。  
二者的区别是，使用ssh url需要在本地配置ssh key，这也就意味着你必须是开发者或者有一定的权限，每次的代码同步（主要是push和clone）不需要进行用户名和密码的输入操作；  
那么http url就相对宽松些，但是需要在每次同步操作输入用户名和密码，有时候，为了省去每次都输入密码的重复操作，我们可以在本地新建一个文件，来存储你的用户名和密码，只需要在第一次clone输入用户名和密码，这些信息就被存储起来，以后就可以自动读取，不需要你在手动输入了。  
在Git官网介绍了这一实现，是通过叫做credential helper的小玩意儿实现的。可以把它叫做证书或者凭证小助手，它帮我们存储了credential(凭证，里面包含了用户名和密码)，这是地址：[https://git-scm.com/docs/gitcredentials](https://git-scm.com/docs/gitcredentials) 下面是我根据官网介绍进行的简单的翻译。如果不想搞明白原理，或者觉得我的翻译比较渣，可以直接跳到最后的实践去看实际操作。

### 基本介绍

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

### 凭据上下文环境

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

### credential配置选项

credential context的配置选项可以被配置为 credential._来应用到全部的credential，或者配置为credential.._，这样url会匹配之前讲到的context。  
下面的是一些配置选项  

- helper  
- username
  
一个默认的用户名，当在URL中没有提供用户名时使用  
useHttpPath  
默认的，在使用外置的helpers时，Git并不把path考虑在匹配的范畴，也就是说`"https://example.com/foo.git"`的凭证也适用与`"https://example.com/bar.git"`，如果想要使用path来区分前面说过的两种情况，可以设置这个属性为true。  
当然你也可以写自定义的helper  

### 实践

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
