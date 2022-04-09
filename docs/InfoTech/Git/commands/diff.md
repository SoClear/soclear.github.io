# diff

git diff 命令比较文件的不同，即比较文件在暂存区和工作区的差异。
git diff 命令显示已写入暂存区和已经被修改但尚未写入暂存区文件的区别。

| 命令                                                          | 解释                                 |
| ------------------------------------------------------------- | ------------------------------------ |
| `git diff`                                                    | 查看尚未缓存的改动                   |
| `git diff --cached`                                           | 查看已缓存的改动                     |
| `git diff HEAD`                                               | 查看已缓存的与未缓存的所有改动       |
| `git diff --stat`                                             | 显示摘要而非整个 diff                |
| `git diff [file]`                                             | 显示暂存区和工作区的差异             |
| `git diff --cached [file]`<br/>或者`git diff --staged [file]` | 显示暂存区和上一次提交(commit)的差异 |
| `git diff [first-branch]...[second-branch]`                   | 显示两次提交之间的差异               |

`git status` 显示你上次提交更新后的更改或者写入缓存的改动，
而 `git diff` 一行一行地显示这些改动具体是啥。
