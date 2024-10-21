# pull

## 作用

- 拉取拉取指令就是将远端仓库的修改拉到本地并自动进行合并，等同于fetch+merge
- 如果不指定远端名称和分支名，则抓取所有并更新当前分支。

## 语法

`git pull <远程主机名> <本地分支名>:<远程分支名>`
如果本地分支名与远程分支名相同，则可以省略冒号：
`git pull <远程主机名> <本地分支名>`

`git pull = git fetch + git merge`  
`git pull --rebase = git fetch + git rebase`
