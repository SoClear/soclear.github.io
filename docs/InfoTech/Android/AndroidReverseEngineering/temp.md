# 待整理

## 双开

双开：简单来说，就是手机同时运行两个或多个相同的应用，例如同时运行两个微信

| 原理 | 解释 |
| --- | --- |
| 修改包名 | 让手机系统认为这是2个APP，这样的话就能生成2个数据存储路径，此时的多开就等于你打开了两个互不干扰的APP |
| 修改Framework | 对于有系统修改权限的厂商，可以修改Framework来实现双开的目的，例如：小米自带多开 |
| 通过虚拟化技术实现 | 虚拟Framework层、虚拟文件系统、模拟Android对组件的管理、虚拟应用进程管理 等一整套虚拟技术，将APK复制一份到虚拟空间中运行，例如：平行空间 |
| 以插件机制运行 | 利用反射替换，动态代{过}{滤}理，hook了系统的大部分与system—server进程通讯的函数，以此作为“欺上瞒下”的目的，欺骗系统“以为”只有一个apk在运行，瞒过插件让其“认为”自己已经安装。例如：VirtualApp |

## 汉化

- arsc
- xml
- dex

## 初识AndroidManifest.xml

AndroidManifest.xml文件是整个应用程序的信息描述文件，定义了应用程序中包含的Activity,Service,Content provider和BroadcastReceiver组件信息。每个应用程序在根目录下必须包含一个AndroidManifest.xml文件，且文件名不能修改。它描述了package中暴露的组件，他们各自的实现类，各种能被处理的数据和启动位置。

| 属性 | 定义 |
| --- | --- |
| versionCode | 版本号，主要用来更新，例如:12 |
| versionName | 版本名，给用户看的，例如:1.2 |
| package | 包名，例如：com.zj.52pj.demo |
| uses-permission android:name="" | 应用权限，例如：android.permission.INTERNET 代表网络权限 |
| android:label="@string/app\_name" | 应用名称 |
| android:icon="@mipmap/ic\_launcher" | 应用图标路径 |
| android:debuggable="true" | 应用是否开启debug权限 |
