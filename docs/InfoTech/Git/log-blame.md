---
title: 查看提交历史
description: 
published: true
date: 2022-04-05T16:19:30.097Z
tags: 
editor: markdown
dateCreated: 2022-04-03T10:10:22.747Z
---

# git log
`git log [参数]`用来查看历史提交记录
|参数|解释|
|-|-|
|无参数|	列出详细历史提交记录|
|`--oneline`| 查看历史记录的简洁的版本|
|`--graph`|	查看历史中什么时候出现了分支、合并。开启了拓扑图|
|`--reverse`|	逆向显示|
|`--author=[username]`|	只查找指定用户[username]的提交日志|
|`--since`<br/>`--before`<br/>`--until`<br/>`--after`|指定日期<br/>例子:--before={3.weeks.ago} --after={2010-04-18}|
|`--no-merges`|隐藏合并提交|

# git blame
以列表形式查看***指定文件***的历史修改记录。
例子:
```bash
$ git blame README
^d2097aa (tianqixin 2020-08-25 14:59:25 +0800 1) # Runoob Git 测试
db9315b0 (runoob 2020-08-25 16:00:23 +0800 2) # 菜鸟教程
```