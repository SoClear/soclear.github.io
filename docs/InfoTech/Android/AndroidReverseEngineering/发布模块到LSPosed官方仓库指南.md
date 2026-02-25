# 发布模块到 LSPosed 官方仓库指南

本文档将引导你完成将自己开发的 Xposed/LSPosed 模块发布到 [LSPosed 官方模块仓库](https://modules.lsposed.org/) 的全过程。

## 第一步：提交收录申请

1. 打开 [Xposed Module Repository 提交页面](https://modules.lsposed.org/submission/)。
2. 在表单中填写以下信息：
   - **I'd like to**：选择 `Submit a new package`。
   - **Package name**：填写你模块的 Android 包名（如 `com.example.mymodule`）。
   - **Description (Reason)**：填写模块的简短描述或申请理由。
3. 点击 **SUBMIT** 按钮。
   - *注意：这会自动跳转到 GitHub [Xposed-Modules-Repo/submission](https://github.com/Xposed-Modules-Repo/submission) 的 `New Issue` 页面，并自动填充你刚才填写的信息。*
4. **确认 GitHub 账号**：确保当前登录的 GitHub 账号是你希望用来管理该模块的账号。
5. **补充信息（可选）**：如果你的模块已经开源，可以在 Issue 的 `description` 区域补充开源仓库的链接（GitHub Repo）。
6. 点击 **Submit new issue**（创建 Issue），等待人工审核。

## 第二步：接受邀请并配置仓库

审核通过后，系统会自动为你创建一个名为 `Xposed-Modules-Repo/[你的包名]` 的专属仓库。

1. **接受协作邀请**：
   - 检查与你 GitHub 账号关联的邮箱。
   - 查收来自 `XposedBot` 的邮件，标题为 *“XposedBot invited you to Xposed-Modules-Repo/[包名]”*。
   - 点击邮件中的 **View invitation** 并同意邀请。至此，仓库绑定成功。

2. **设置管理员权限（关键）**：
   - 进入该专属仓库，点击顶部导航栏的 **⚙️ Settings**（设置）按钮。
   - 在左侧菜单栏中选择 **Collaborators and teams**（协作者与团队）。
   - 在成员列表中找到你自己的 GitHub 账号，确保将你的角色（Role）修改/确认为 **Admin**（管理员）。
   - *(注意：必须保证有 Admin 权限，才能顺利进行后续的仓库信息修改。)*

3. **修改仓库详情（Edit repository details）**：
   - 在仓库主页（Code 页面），点击右上角简介旁边的 **齿轮（⚙️）** 按钮。
   - 填写以下基础信息：
     - **Description** (必填)：填写模块的名称。**这会作为 LSPosed 仓库模块列表中的标题显示。**
     - **Website** (选填)：模块的官方网站地址。如果没有，可以填你的开源仓库主页。
     - **Topics** (选填)：为仓库添加标签。建议添加 `xposed`、`xposed-module`、`lsposed`、`lsposed-module` 以增加搜索曝光量。
   - 点击 **Save changes** 保存。

## 第三步：完善仓库文件

在你的专属仓库中，你需要手动创建以下几个关键文件，它们将直接影响你的模块在 LSPosed 官网的展示效果：

| 文件名 | 是否必填 | 内容说明 |
| :--- | :---: | :--- |
| `SUMMARY` | **必填** | 一句话的**模块简介**。它将显示在 LSPosed 仓库的模块列表页。 |
| `README.md` | **必填** | 模块的**详细介绍**（支持 Markdown）。它将作为模块详情页的主要内容。 |
| `SOURCE_URL` | 选填 | 你的**开源仓库地址**（仅需填入纯文本 URL）。如果你的模块未开源则无需创建。 |

## 第四步：发布版本 (Release)

模块代码编译完成后，你需要通过 GitHub Releases 来发布 APK。

1. 在仓库主页右侧找到 **Releases** 模块。
   - 首次发布点击 **Create a new release**。
   - 后续发布点击 Releases 后选择 **Draft a new release**。
2. **创建 Tag**：
   - 点击 **Choose a tag** -> **Create a new tag**。
   - ⚠️ **严格命名规范**：Tag 名称必须为 `[版本号]-[版本名称]`（即 `versionCode-versionName`，例如：`100-v1.0.0`），**必须与模块 `build.gradle` 中配置的完全一致**，否则系统无法正确抓取。
3. **填写发布信息**：
   - **Release title**（发布标题）：通常填写版本名称，如 `v1.0.0`。
   - **Release notes**（发布说明）：填写本次更新的日志或注意事项。
4. **上传 APK 文件**：
   - 将编译好的 `.apk` 文件拖拽到页面下方的 *“Attach binaries by dropping them here...”* 区域进行上传。
5. 点击 **Publish release** 完成发布。

## 第五步：验证发布结果

Release 发布成功后，请耐心等待几分钟（系统会有延迟），然后前往 [LSPosed 模块仓库列表](https://modules.lsposed.org/) 检查：

- 确认你的模块是否已出现。
- 检查模块名称、简介和详细介绍是否与你配置的内容一致。
- 💡 **提示**：如果等待许久仍未看到更新，可能是浏览器缓存原因，请尝试使用浏览器的**无痕模式 (Incognito mode)** 重新打开网页查看。
