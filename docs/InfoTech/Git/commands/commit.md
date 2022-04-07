---
title: commit
description: 
published: 1
date: 2022-04-01T15:06:06.995Z
tags: 
editor: undefined
dateCreated: 2022-04-01T07:52:57.629Z
---

|命令|解释|
|-|-|
|`git commit -m [message]`	                   |提交暂存区到本地仓库中|
|`git commit [file1] [file2] ... -m [message]` |	提交暂存区的指定文件到仓库区|
|`git commit -a`|-a 参数设置修改文件后不需要执行 git add 命令，直接来提交。<br/>适用于被修改和被删除的文件，不适用于新建的文件。<br/>例如 git commit -am '提交信息'|
