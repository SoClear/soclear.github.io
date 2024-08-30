# apk 文件结构

## assets 目录

assets 目录下存放的是不经过 aapt 编译的静态资源文件，如图片、音频、视频等。

## lib 目录

armeabi-v7a基本通用所有android设备，arm64-v8a只适用于64位的android设备，x86常见用于android模拟器，其目录下的.so文件是c或c++编译的动态链接库文件。

## META-INF 目录

`META-INF` 目录存放与 `APK` 文件的完整性和签名相关的信息。这些文件在 `APK` 的构建和签名过程中自动生成，其作用主要涉及应用程序的安全性和验证。

有些 `APK` **解压后看不到 `META-INF` 目录**，有可能是使用的 `V2` 的签名。`V2` 的签名信息，则插入在 `APK` 压缩包的文件结构里(数据区和中央目录中间)，所以**不会被解压出来**。 `APK` 的签名方式就不在本篇叙述了，[Android v1、v2、v3签名详解](https://zhuanlan.zhihu.com/p/89126018) 这篇文章讲解的不错。

该目录下包含文件：

### 1. MANIFEST.MF (Manifest File)

- `MANIFEST.MF` 是 `APK` 文件的主清单文件。它包含了与 `APK` 文件相关的元数据信息，如创建时间、修改时间、版本号等。
- 主清单文件记录了 `APK` 文件中包含的其他清单文件的名称和哈希值，用于确保 `APK` 文件的完整性。

### 2. CERT.RSA (RSA Certificate)

- `CERT.RSA` 文件包含 `APK` 文件的数字签名信息。在 `APK` 构建过程中，开发者会使用数字证书对 `APK` 文件进行签名。
- 数字签名是一种保证 `APK` 文件来源和完整性的机制，它防止 `APK` 在发布过程中被篡改或恶意修改。
- `Android` 设备在安装应用程序时会验证 `CERT.RSA` 文件中的签名信息，确保 `APK` 文件是由合法开发者签名的。

**注意：直接解压得到的 `CERT.RSA` 是使用 `RSA` 加密了的，需要用 `openssl` 等工具查看。**

```shell
openssl pkcs7 -inform DER -in CERT.RSA -text -noout -print_certs
```

### 3. CERT.SF (Signature File)

- `CERT.SF` 文件包含 `APK` 文件中所有资源文件的哈希值和清单文件的哈希值。  
    在 `APK` 签名过程中，清单文件中的每个条目都会被计算哈希值并记录在 `CERT.SF` 文件中。
- 当安装 `APK` 文件时，`Android` 设备会验证 `CERT.SF` 文件确保其中的哈希值与实际 `APK` 中的资源文件和清单文件一致，防止篡改和修改。所以安装 `APK` 时比较慢，就可能是因为 `APK` 中的资源文件较多，需要进行签名校验。

## res 目录

- `res` 目录是 `APK` 文件中存放资源文件的目录，它包含了应用程序使用的各种资源，如布局文件、图像文件、字符串资源等。
- 布局文件（`layout`）定义了应用程序界面的结构和组件的位置。
- 图像文件（`drawable`）包含了应用程序使用的图标、背景图等图像资源。
- 字符串资源（`values`）存储了应用程序中使用的文本字符串，以便实现国际化和本地化。

## AndroidManifest.xml 文件

AndroidManifest.xml 是应用程序清单文件。

- 清单文件是 `APK` 文件的核心组成部分，它描述了应用程序的基本信息和特性。
- 清单文件包含了应用程序的包名、版本号、权限要求以及组件的声明，如活动（`Activity`）、服务（`Service`）、广播接收器（`Broadcast Receiver`）和内容提供器（`Content Provider`）等。
- 清单文件告知 `Android` 系统应用程序的整体结构，使系统能够正确加载和启动应用程序的各个组件。

**注意：直接解压 `APK` 得到的 `AndroidManifest.xml` 是压缩过的，直接打开将看到乱码，可以通过相关工具（`AndroidStudio`,`jadx` 等）将其解压。**

## classes.dex 文件

- `classes.dex` 文件是 `APK` 文件中的 Dalvik 字节码文件，它包含了应用程序的所有 `Java` / `Kotlin` 代码经过编译和优化后的结果。
- `Dalvik` 是 `Android` 系统使用的一种特定虚拟机，它能够执行经过转换的字节码文件。
- `classes.dex` 文件中的字节码被 `Dalvik` / `ART` 虚拟机解释和执行，使应用程序能够在 `Android` 设备上运行。

## resources.arsc 文件

- `resources.arsc` 是一个二进制文件，它包含了应用程序中使用的所有资源的索引信息。
- 资源索引文件记录了每个资源的类型、名称和对应的 `ID`。
- `Android` 系统通过解析资源索引文件可以快速访问和加载应用程序所需的资源。

---

附：参考

[探索 APK 文件的内部：了解 Android 应用程序的组织结构](https://blog.csdn.net/DisMisPres/article/details/131833412)  
[APK文件结构](https://www.cnblogs.com/cyx-b/p/13426109.html)  
[Android v1、v2、v3签名详解](https://zhuanlan.zhihu.com/p/89126018)  
[Android 官方介绍签名](https://source.android.google.cn/docs/security/features/apksigning/v2?hl=zh-cn)
