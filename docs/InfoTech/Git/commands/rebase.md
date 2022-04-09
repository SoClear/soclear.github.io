# rebase

## 工作流程

假设Git目前只有一个分支master。开发人员的工作流程是

- 1、`git clone master branch`
- 2、在自己本地`git checkout -b local`创建一个本地开发分支
- 3、在本地的开发分支上开发和测试
- 4、阶段性开发完成后（包含功能代码和单元测试），可以准备提交代码
- 5、提交代码流程：
  - 5.1、首先切换到master分支，`git pull`拉取最新的分支状态
  - 5.2、然后切回local分支
  - 5.3、通过 `git rebase -i` 将本地的多次提交合并为一个，以简化提交历史。本地有多个提交时,如果不进行这一步,在git rebase master时会多次解决冲突(最坏情况下,每一个提交都会相应解决一个冲突)
  - 5.4、然后切换到master分支，`git merge` 将本地的local分支内容合并到master分支
  - 5.5、`git push` 将master分支的提交上传

用rebase灵活管理本地开发分支

## 代码示例

```bash
git checkout master
git pull
git checkout local
git rebase -i HEAD~2  //合并提交 --- 2表示合并两个
git rebase master---->解决冲突--->git rebase --continue
git checkout master
git merge local
git push
```
