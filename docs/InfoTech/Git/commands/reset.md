---
title: reset
description: 
published: 1
date: 2022-04-01T16:29:31.838Z
tags: 
editor: undefined
dateCreated: 2022-04-01T16:29:28.031Z
---

# 作用
用于回退版本，可以指定退回某一次提交的版本。
# 语法
`git reset [--soft | --mixed | --hard] [HEAD]`
## HEAD 说明
### ^…
| 格式     | 意义           |
| -------- | -------------- |
| HEAD     | 表示当前版本   |
| HEAD^    | 上一个版本     |
| HEAD^^   | 上上一个版本   |
| HEAD^^^  | 上上上一个版本 |
| HEAD^^^… | 以此类推...    |
### ～数字
| 格式   | 意义           |
| ------ | -------------- |
| HEAD~0 | 表示当前版本   |
| HEAD~1 | 上一个版本     |
| HEAD~2 | 上上一个版本   |
| HEAD~3 | 上上上一个版本 |
| HEAD~n | 以此类推...    |


## [--soft | --mixed | --hard]
### git reset --mixed
为默认，可以不用带该参数，用于重置暂存区的文件与上一次的提交(commit)保持一致，工作区文件内容保持不变。
用法：
`git reset  [HEAD] `
例：
```bash
$ git reset HEAD^            # 回退所有内容到上一个版本 
$ git reset HEAD^ hello.php  # 回退 hello.php 文件的版本到上一个版本  
$ git reset 052e             # 回退到指定版本 
```
## git reset HEAD
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