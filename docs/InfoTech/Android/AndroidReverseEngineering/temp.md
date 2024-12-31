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

## 去弹窗

算法助手开启弹窗定位

## 强制开启调试

手机的 `/system/build.prop` 中的 `ro.debuggable`属性设置为1，即可为所有 App 开启调试模式。若 `ro.debuggable`属性设置为0，则判断 `AndroidManifest.xml` 文件中 `android:debuggable`属性是否为 `true`  ，若为 `true` ，则开启调试模式，否则不开启。

方法一:在AndroidManifest.xml里添加 `android:debuggable="true"`

方法二：XappDebug模块hook对应的app

项目地址 [XappDebug](https://github.com/Palatis/XAppDebug)

方法三：Magisk命令(重启失效)

```shell
adb shell #adb进入命令行模式
su #切换至超级用户
magisk resetprop ro.debuggable 1
stop;start; #一定要通过该方式重启
```

方法四:刷入MagiskHide Props Config模块

项目地址 [MagiskHide Props Config](https://github.com/cnrd/MagiskHide-Props-Config)

## Log插桩

定义：Log插桩指的是反编译APK文件时，在对应的smali文件里，添加相应的smali代码，将程序中的关键信息，以log日志的形式进行输出。

调用命令

```smali
invoke-static {对应寄存器}, Lcom/mtools/LogUtils;->v(Ljava/lang/Object;)V
```

文件见 [《安卓逆向这档事》五、1000-7=？&动态调试&Log插桩](https://www.52pojie.cn/thread-1714727-1-1.html)

## 签名

Android 目前支持以下四种应用签名方案：
v1 方案：基于 JAR 签名。
v2 方案：APK 签名方案 v2（在 Android 7.0 中引入）
v3 方案：APK 签名方案 v3（在 Android 9 中引入）
v4 方案：APK 签名方案 v4（在 Android 11 中引入）

见 [应用签名](https://source.android.com/docs/security/features/apksigning?hl=zh-cn)

[《安卓逆向这档事》六、校验的N次方-签名校验对抗、PM代{过}{滤}理、IO重定向](https://www.52pojie.cn/thread-1731181-1-1.html)
