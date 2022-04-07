---
title: push
description: 
published: 1
date: 2022-04-01T16:27:07.244Z
tags: 
editor: undefined
dateCreated: 2022-04-01T16:27:03.369Z
---

# 作用
git push 命用于从将本地的分支版本上传到远程并合并。
# 命令格式
`git push <远程主机名> <本地分支名>:<远程分支名>`
<远程主机名>是为远程仓库起的名字
如果本地分支名与远程分支名相同，则可以省略冒号：
`git push <远程主机名> <本地分支名>`
# 常见用法
|需求|命令|
|-|-|
|如果远程仓库的分支名字与本地仓库分支名字相同，可以只写一遍。右侧命令将本地的 master 分支推送到 origin 主机的 master 分支。|`git push origin master`相当于`git push origin master:master`|
|如果当前分支与多个主机存在追踪关系，则可以使用 -u 参数指定一个默认主机，这样后面就可以不加任何参数使用`git push`|	`git push -u origin master`<br/>等价于<br/>`git push --set-upstream origin master`<br/>注：origin是远程仓库名，master是本地仓库和远程仓库共有的名字。|
|如果本地版本与远程版本有差异，但又要强制推送可以使用 `--force` 参数|`git push --force origin master`|
|删除主机的分支可以使用 `--delete` 参数，右侧命令表示删除 `origin` 主机的 `master` 分支|	`git push origin --delete master`|
|如果当前分支已经和远端分支关联，则可以省略远端名和分支名。|	`git push`|
