---
title: fetch
description: 
published: 1
date: 2022-04-01T16:24:17.193Z
tags: 
editor: undefined
dateCreated: 2022-04-01T16:24:13.428Z
---

# 作用
抓取指令就是将仓库里的更新都抓取到本地，不会进行合并
如果不指定远端名称和分支名，则抓取所有分支。
# 语法
`git fetch <远程主机名> <本地分支名>:<远程分支名>`
如果本地分支名与远程分支名相同，则可以省略冒号：<br/>`git fetch <远程主机名> <本地分支名>`