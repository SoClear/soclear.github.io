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
android {
    def keystorePropertiesFile = rootProject.file("keystore.properties")
    def keystoreProperties = new Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    }

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

    // 假设启用 ABI 拆分，如不需要请删除 splits 配置
    splits {
        abi {
            enable true // 启用 ABI 拆分
            reset() // 可选：清除任何先前的包含/排除规则
            include 'arm64-v8a', 'x86_64' // 指定你想要构建的 ABI
            // universalApk false // 可选：如果你不想生成包含所有 ABI 的通用 APK，可以设置为 false。默认为 false（当启用 ABI 拆分时）
        }
    }
}
```

如果是 `build.gradle.kts` ，修改如下

```kotlin
android {
    val keystorePropertiesFile = rootProject.file("keystore.properties")
    val keystoreProperties = Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(FileInputStream(keystorePropertiesFile))
    }

    signingConfigs {
        create("release") {
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    // 假设启用 ABI 拆分，如不需要请删除 splits 配置
    splits {
        abi {
            isEnable = true // 启用 ABI 拆分
            reset() // 可选：清除任何先前的包含/排除规则
            include("arm64-v8a", "x86_64") // 指定你想要构建的 ABI
            // isUniversalApk = false // 可选：如果你不想生成包含所有 ABI 的通用 APK，可以设置为 false。默认为 false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}
```

如果是 Xposed 模块，请将 `minifyEnabled` 设置为 `false` ；或者 `minifyEnabled true` ，并在 `proguard-rules.pro` 中添加规则
`--keep class your.package.YourHookClass` 。

为了确保 ProGuard 在代码混淆过程中保留 `your.package.YourHookClass` 类及其所有成员，你需要在你的 `proguard-rules.pro` 文件中添加特定的规则。以下是如何实现这一点的说明：

1. 保留整个类：
    如果你想要保留整个类不被混淆并且不被移除，可以使用 `-keep` 指令。

    ```pro
    -keep your.package.YourHookClass { *; }
    ```

    这条规则会告诉 ProGuard 保持 `your.package.YourHookClass` 类不变，并且保留该类的所有方法和字段。

2. 如果你只希望保留类本身但允许其成员（方法和字段）被混淆，你可以这样做：

    ```pro
    -keep class your.package.YourHookClass
    ```

3. 如果你有特定的方法或字段需要保留，你可以明确指出它们。例如：

    ```pro
    -keepclassmembers your.package.YourHookClass {
        <fields>;
        <methods>;
    }
    ```

    这将保留 `your.package.YourHookClass` 类中的所有字段和方法，但仍然会对它们进行混淆，除非它们也被 `-keep` 或类似的指令保护。

4. 如果这个类是用于反射或者动态加载，你应该确保它的构造函数、方法签名和字段名都被保留下来：

    ```pro
    -keep,allowobfuscation your.package.YourHookClass {
        *;
    }
    ```

5. 如果你还想保留注解信息，可以添加：

    ```pro
    -keepattributes *Annotation*
    ```

请根据你的具体需求选择适当的规则。通常情况下，第一条规则（保留整个类及其所有成员）对于大多数场景来说已经足够了。
确保在添加这些规则后测试你的应用程序，以确认一切按预期工作。

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

      - name: Build Release APKs
        run: ./gradlew assembleRelease

      # 上传所有相关的 Release APKs (兼容单/多 APK)
      - name: Upload Release Assets
        uses: softprops/action-gh-release@v2
#        下面这句在 on: release: types: [created] 条件下是多余的，因为 Release 创建必然与一个标签相关联。
#        if: startsWith(github.ref, 'refs/tags/')
        with:
          # 使用多行输入来指定多个文件匹配模式
          files: |
            app/build/outputs/apk/release/app-release.apk
            app/build/outputs/apk/release/app-*-release.apk
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
