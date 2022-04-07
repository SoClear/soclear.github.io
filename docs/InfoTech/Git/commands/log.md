---
title: log
description: 
published: true
date: 2022-04-02T08:31:14.338Z
tags: 
editor: markdown
dateCreated: 2022-04-02T08:28:50.307Z
---

`git log [参数]`用来查看历史提交记录
|参数|解释|
|-|-|
|无参数|	列出详细历史提交记录|
|`--oneline`| 	查看历史记录的简洁的版本|
|`--graph`|	查看历史中什么时候出现了分支、合并。开启了拓扑图|
|`--reverse`|	逆向显示|
|`--author=[username]`|	只查找指定用户[username]的提交日志|
|`--since`<br/>`--before`<br/>`--until`<br/>`--after`|指定日期<br/>例子:--before={3.weeks.ago} --after={2010-04-18}|
|`--no-merges`|隐藏合并提交|
