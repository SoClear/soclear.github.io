# 公私项目配置不同的SSH和Git

在公司Mac电脑上同时开发公司项目和个人项目是非常常见的需求。为了避免代码提交身份混淆、或者把个人代码推送到公司仓库，你需要分别配置**不同的 SSH Key** 和 **不同的 Git 提交邮箱**。

以下是完整且优雅的配置步骤：

> **💡 温馨提示**：在开始之前，请确保贵公司的 IT 政策和员工协议允许在公司设备上开发个人项目，以避免产生知识产权（IP）纠纷。

## 第一步：为个人项目生成独立的 SSH Key

默认情况下，你的公司 SSH Key 可能叫 `id_rsa` 或 `id_ed25519`。我们需要为个人账号（例如个人的 GitHub）生成一个新的、名字不同的 Key。

打开终端（Terminal），输入以下命令（替换为你个人的邮箱）：

```bash
ssh-keygen -t ed25519 -C "your-personal-email@example.com" -f ~/.ssh/id_ed25519_personal
```

*提示：按回车跳过密码设置（或设置一个你记得住的密码）。*

这会在你的 `~/.ssh/` 目录下生成两个文件：

* `id_ed25519_personal`（私钥，**绝对不能泄露**）
* `id_ed25519_personal.pub`（公钥，用于配置在 GitHub 等平台）

## 第二步：配置 SSH Config 文件（核心）

SSH 客户端需要知道“在连接什么仓库时，该用哪一个 Key”。我们可以通过配置 `~/.ssh/config` 文件来实现。

1. 打开或创建 config 文件：

   ```bash
   nano ~/.ssh/config
   ```

2. 在文件中写入以下规则（假设你的公司和个人项目都在 GitHub，如果是 GitLab 或其他平台，修改 `HostName` 即可）：

   ```text
   # --- 公司账号（默认） ---
   Host github.com
       HostName github.com
       User git
       IdentityFile ~/.ssh/id_ed25519
       UseKeychain yes
       AddKeysToAgent yes

   # --- 个人账号 ---
   # Host 是一个别名，你可以随便起，比如 github-personal
   Host github-personal
       HostName github.com
       User git
       IdentityFile ~/.ssh/id_ed25519_personal
       UseKeychain yes
       AddKeysToAgent yes
   ```

3. 保存并退出（在 nano 中按 `Ctrl + O` 保存，回车确认，`Ctrl + X` 退出）。

## 第三步：将公钥添加到你的个人 GitHub/GitLab

1. 在 Mac 终端运行以下命令，将个人公钥复制到剪贴板：

   ```bash
   pbcopy < ~/.ssh/id_ed25519_personal.pub
   ```

2. 登录你个人的 GitHub（或 Gitee / GitLab），进入 **Settings -> SSH and GPG keys -> New SSH key**。
3. 粘贴刚才复制的内容并保存。

## 第四步：拉取（Clone）个人项目的方式

因为我们在第二步设置了别名 `github-personal`，所以在 Clone 个人项目时，**需要把原本克隆链接中的 `github.com` 替换为 `github-personal`**。

* **原来的链接**：`git clone git@github.com:username/my-project.git`
* **现在的链接**：`git clone git@github-personal:username/my-project.git`

这样，SSH 就会自动匹配并使用你的个人私钥进行认证。

***

## 第五步：区分 Git 提交人的邮箱和名字（非常重要！）

SSH Key 只负责“有没有权限推送代码”，而代码提交记录里显示的“是谁提交的”是由 Git 的 `user.name` 和 `user.email` 决定的。**如果不修改，你会把带有公司邮箱的 Commit 推送到个人开源项目中。**

### 方案 A：针对单个仓库局部设置（适合个人项目很少）

进入你刚才 clone 下来的个人项目目录，执行：

```bash
git config local user.name "你的个人昵称"
git config local user.email "你的个人邮箱@example.com"
```

### 方案 B：使用 `includeIf` 自动切换（⭐ 强烈推荐，终极优雅方案）

如果你的个人项目很多，每次都手动设非常容易忘。你可以按照**文件夹**来区分公司和个人项目。例如：

* 公司项目统一放在 `~/Workspace/Company/`
* 个人项目统一放在 `~/Workspace/Personal/`

1. 设置全局默认（公司用）：

   ```bash
   git config --global user.name "你的真实姓名/花名"
   git config --global user.email "your-name@company.com"
   ```

2. 创建一个专门给个人项目用的 Git 配置文件：

   ```bash
   nano ~/.gitconfig-personal
   ```

   写入以下内容并保存：

   ```ini
   [user]
       name = 你的个人昵称
       email = your-personal-email@example.com
   ```

3. 修改全局 `~/.gitconfig`，加入条件包含（`includeIf`）规则：

   ```bash
   nano ~/.gitconfig
   ```

   在文件末尾加上这段：

   ```ini
   # 当你在 ~/Workspace/Personal/ 目录及子目录下时，自动使用以下配置
   [includeIf "gitdir:~/Workspace/Personal/"]
       path = ~/.gitconfig-personal
   ```

**大功告成！**
以后只要你把个人项目放在 `~/Workspace/Personal/` 目录下，Git 就会自动用你的个人邮箱去 Commit，并且通过 SSH Config 自动用你的个人 Key 去 push 代码，与公司环境完全物理隔离，再也不会搞混了。
