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
