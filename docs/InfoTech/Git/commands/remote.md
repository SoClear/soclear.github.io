# remote

|命令|解释|
|-|-|
|`git remote`| 查看远程仓库|
|`git remote -v` |显示所有远程仓库（含远程仓库的地址）|
|`git remote show [remote]`|显示某个远程仓库的信息|
|`git remote add [shortname] [url]`|给远程仓库`[url]`起名为`[shortname]`，默认是origin. <br/>例如提交到 Github: <br/>`$ git remote add origin git@github.com:tianqixin/runoob-git-test.git`<br/>`$ git push -u origin master`|
|`git remote rm name`|删除远程仓库|
|`git remote rename old_name new_name` |修改仓库名|
