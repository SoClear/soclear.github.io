# 使用 GitHub Actions 创建 Android Releases

## 1. 创建 keystore.properties

在安卓项目根目录下创建 `keystore.properties` 文件，内容如下：

```txt
storeFile=your_keystore.jks
storePassword=your_store_password
keyAlias=your_key_alias
keyPassword=your_key_password
```

让我解释每一项的含义：

1. `storeFile`：您的密钥库文件的路径。可以是：

    - 相对路径，如：`release.keystore`
    - 绝对路径，如：`/path/to/your/keystore.jks`
    - 或相对于项目的路径，如：`../keystores/release.keystore`
2. `storePassword`：密钥库的密码

3. `keyAlias`：密钥的别名

4. `keyPassword`：密钥的密码

重要提示：

不要将这个文件提交到 Git 仓库！应该将它添加到 `.gitignore` 文件中：

```txt
# 在 .gitignore 中添加
keystore.properties
*.keystore
*.jks
```

1. 为了在本地开发时使用，您应该：

    - 在本地项目根目录创建此文件
    - 填入实际的值
    - 确保文件权限正确（通常是 600）
2. 在使用 GitHub Actions 时，我们前面配置的工作流会自动创建这个文件，所以不需要手动上传。

## 2. 修改 build.gradle 文件

更新您的 `app/build.gradle` 文件以读取签名配置：

```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 3. 创建 GitHub Actions 工作流

在您的 GitHub 仓库的 `.github/workflows` 目录下创建一个名为 `release.yml` 的文件，内容如下：

```yaml
name: Android Release

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '21'
          cache: 'gradle'

      # 解码并保存 Keystore 文件
      - name: Decode Keystore
        run: |
          echo ${{ secrets.KEYSTORE_BASE64 }} | base64 -d > app/release.keystore

      # 设置签名环境变量
      - name: Set up keystore properties
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: |
          echo "storeFile=release.keystore" > keystore.properties
          echo "storePassword=$KEYSTORE_PASSWORD" >> keystore.properties
          echo "keyAlias=$KEY_ALIAS" >> keystore.properties
          echo "keyPassword=$KEY_PASSWORD" >> keystore.properties

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Release APK
        run: ./gradlew assembleRelease

      # 将 APK 上传到 Release
      - name: Upload Release Asset
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: app/build/outputs/apk/release/app-release.apk
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 4. 配置 GitHub Secrets 和 Github Actions 权限

### 4.1 配置 GitHub Secrets

在您的 GitHub 仓库中，在 Settings > Secrets and variables > Actions > Repository secrets 中创建以下 secrets：

- `KEYSTORE_BASE64`：您的密钥库文件的 Base64 编码版本。
  - 您可以使用以下命令将您的密钥库文件转换为 Base64 编码：

    ```bash
    base64 -w 0 release.keystore > keystore-base64.txt
    ```

- `KEYSTORE_PASSWORD`：您的密钥库的密码。
- `KEY_ALIAS`：您的密钥的别名。
- `KEY_PASSWORD`：您的密钥的密码。

### 4.2 配置 GitHub Actions 权限

确保 GitHub Actions 没有足够的权限来访问和更新 Release 。在您的 GitHub 仓库中，在 Settings > Actions > General 中，将 `Workflow permissions` 设置为 `Read and write permissions` ，然后点击下面的 `Save` 。

## 5. 发布 Release

现在，当您创建一个 Release 时，GitHub Actions 将自动构建您的 APK 并将其上传到 Release。

1. 在 GitHub 仓库中，在 Releases 页面，点击 `Draft a new release` 按钮。
2. 选择要创建的 Release 的标签（Choose a tag）。也可以直接输入你想要新建的标签名称，并点击下面的 `Create new tag` 。
3. 选择要创建的 Release 的目标分支（Target），默认为 `main`。
4. 输入 Release 的名称（Release title），输入 Release 的描述（Describe this release）。
5. 点击 `Publish release` 按钮。构建完成后，GitHub Actions 将自动上传您的 APK 到 Release。

注意： 一个 tag 只能对应一个 release，所以如果一个 tag 已经有 release，那么在创建新的 release 时，需要选择不同的 tag。
