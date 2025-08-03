# Xposed模块使用DataStore存储配置信息

## 探索

想在Xposed模块中存储用户偏好配置信息？翻看各种教程文章和API，都是使用 `SharedPreferences` 来存储用户配置信息：

在模块中 `val sp = Context.getSharedPreferences("name", MODE_WORLD_READABLE)` 来获取 `SharedPreferences` 对象，在宿主中，使用 `val xsp = XSharedPreferences(BuildConfig.APPLICATION_ID, "prefFileName")` 来获取 `XSharedPreferences` 对象。

优点是易于理解，缺点是需要定义字符串的 key ，每次获取需要写默认值： `getString("key", "defaultValue")` ，当有大量的配置时，代码量会非常多。

在常规的安卓开发中，已经有了现代化的解决方案：[DataStore](https://developer.android.com/topic/libraries/architecture/datastore?)

> Jetpack DataStore 是一种数据存储解决方案，允许您使用协议缓冲区存储键值对或类型化对象。DataStore 使用 Kotlin 协程和 Flow 以异步、一致的事务方式存储数据。
>
>如果您目前是使用 `SharedPreferences` 存储数据的，请考虑迁移到 `DataStore` 。

### 对比 DataStore 和 XSharedPreferences 文件存储位置

`DataStore` 把数据存在哪里了呢？查看源码：

```kotlin
package androidx.datastore.core

public fun Context.deviceProtectedDataStoreFile(fileName: String): File {
    // Make sure it is a DeviceProtectedStorageContext and convert to a
    // DeviceProtectedStorageContext if it is not.
    val deviceProtectedContext = requireDeviceProtectedStorageContext()
    return File(deviceProtectedContext.filesDir, "datastore/$fileName")
}
```

```kotlin
package androidx.datastore

public fun Context.dataStoreFile(fileName: String): File {
    return File(this.applicationContext.filesDir, "datastore/$fileName")
}
```

- 使用 `val Context.dataStore by dataStore("YourFileName.json", YourSerializer)` 则存储在 `/data/data/your.packagename/files/datastore/YourFileName.json` 文件中。
- 使用 `val Context.dataStore by deviceProtectedDataStore("YourFileName.json", YourSerializer)` 则存储在 `/data/user_de/0/your.packagename/files/datastore/YourFileName.json` 文件中。

宿主能不能读取这两个文件呢? 用 MT管理器给这两个文件赋予 644 权限（ `-rw-r--r--` 全都可读），再到 Termux 里 `cat` 一下，很不幸，全都是 Permission denied 。

那 `XSharedPreferences` 是怎样做到宿主读取配置文件的呢？

试一下 `XSharedPreferences(BuildConfig.APPLICATION_ID, "YourFileName").file.absolutePath` ，路径是 `/data/misc/f1624d22-c2dd-46cd-9adb-ce0d87bf645c/prefs/your.packagename/YourFileName.xml` （其中的 UUID 每个手机并不相同），而且发现它的权限就是 644 ，Termux `cat` 一下，成功读取。

### 劫持模块自身 DataStore 创建文件

那么就有一个绝妙的思路：劫持模块自身 `DataStore` 创建文件！我们在上述路径下创建一个文件，并通过 hook 返回该文件：

```kotlin
object SelfHook {
    fun enableDataStoreFileSharing(loadPackageParam: LoadPackageParam) {
        if (loadPackageParam.packageName != BuildConfig.APPLICATION_ID) return
        val path = XSharedPreferences(BuildConfig.APPLICATION_ID).file.parent
        val file = File(path, "YourDataStoreFileName.json")
        if (!file.exists()) {
            file.writeText("{}")
            @SuppressLint("SetWorldReadable")
            file.setReadable(true, false)
        }

        findAndHookMethod(
            "androidx.datastore.core.DeviceProtectedDataStoreFile",
            loadPackageParam.classLoader,
            "deviceProtectedDataStoreFile",
            Context::class.java,
            String::class.java,
            returnConstant(file)
        )
        findAndHookMethod(
            "androidx.datastore.DataStoreFile",
            loadPackageParam.classLoader,
            "dataStoreFile",
            Context::class.java,
            String::class.java,
            returnConstant(file)
        )
    }
}
```

Shift + F10 运行完毕，立刻到 Termux `cat` 一下，哇，能读取到数据！

立马编写 hook 逻辑，在宿主里

```kotlin
val path = XSharedPreferences(BuildConfig.APPLICATION_ID).file.parent
val file = File(path, "YourDataStoreFileName.json")
val json = file.readText()
```

果然在宿主里也能读取到数据，大功告成！了吗？

### 解决文件权限

开发一定要做好自测✍️✍️✍️。在模块中修改配置，然后重启宿主，发现功能没有生效，打印日志发现文件的权限变成 600 （其他用户不可读）。

此时灵感枯竭，于是问当今最强AI： Gemini 2.5 Pro，它告诉我在每回 `dataStore.updateData {}` 之后重新设置该文件为可读。我才不会这样做，这太不优雅了，每次调用加一句 `dataStoreFile.setReadable(true, false)` ，跟正常的 `DataStore` 使用方式不一样，很麻烦，而且如果某次忘了加这句代码，就会导致配置文件都变成不可读，导致 hook 功能失效。

那我 hook 自身的 `dataStore.updateData {}` 在其执行后执行

```kotlin
val path = XSharedPreferences(BuildConfig.APPLICATION_ID).file.parent
val file = File(path, "YourFileName.json")
@SuppressLint("SetWorldReadable")
file.setReadable(true, false)
```

真是优雅的实现，但经过测试发现，在更改配置后， `YourDataStoreFileName.json` 仍然是 600 不可读……

不放弃，那我试试 hook `Serializer` 的 `writeTo` 方法

```kotlin
object PreferenceSerializer : Serializer<Preference> {
    override suspend fun readFrom(input: InputStream): Preference {
        return try {
            Json.decodeFromString(
                deserializer = Preference.serializer(),
                string = input.readBytes().decodeToString()
            )
        } catch (e: SerializationException) {
            e.printStackTrace()
            defaultValue
        }
    }

    override suspend fun writeTo(t: Preference, output: OutputStream) {
        output.write(
            Json.encodeToString(
                serializer = Preference.serializer(),
                value = t
            ).encodeToByteArray()
        )
    }

    override val defaultValue: Preference  = Preference()
}

val Context.dataStore by dataStore("whatever", PreferenceSerializer)
```

很不幸，还是 600 不可读……

思索良久，每次写入配置文件都要设置全部可读权限，那能不能在写入配置文件完毕后，一次性设置为全部可读权限呢，只要保证设置权限之后不再修改模块配置，就能保证宿主可读取。那这不就是生命周期该干的事情吗？一个好的安卓开发此时应该意识到了 `onPause()` ，在 Activity 失去焦点时便会调用它，正符合我们的需求。

修改 `MainActivity` :

```kotlin
// 这里使用 "whatever" 是因为 dataStoreFile() 方法已经被 hook 劫持了，所以用什么名字都行。
val preferenceFile = dataStoreFile("whatever")

@SuppressLint("SetWorldReadable")
override fun onPause() {
    super.onPause()
    preferenceFile.setReadable(true, false)
}
```

再次测试，修改模块配置，重启宿主，功能生效了。至此解决了模块配置文件权限问题。

### 新安装崩溃

再次谨记，开发一定要做好自测✍️✍️✍️，卸载模块，重新安装，并且不在 LSPosed 中启用，用来模拟第一次安装。打开模块，哦吼，闪退了，查看 logcat ：

java.lang.RuntimeException: Unable to instantiate activity ComponentInfo{your.packagename/your.packagename.MainActivity}: java.lang.NullPointerException: Attempt to invoke virtual method 'android.content.Context android.content.Context.getApplicationContext()' on a null object reference

……

Caused by: java.lang.NullPointerException: Attempt to invoke virtual method 'android.content.Context android.content.Context.getApplicationContext()' on a null object reference

是 `val preferenceFile = dataStoreFile("whatever")` 出错了，根据源码

```kotlin
public fun Context.dataStoreFile(fileName: String): File {
    return File(this.applicationContext.filesDir, "datastore/$fileName")
}
```

此时没有 `applicationContext`，所以崩溃了。好办，直接一手

```kotlin
val preferenceFile = try {
    dataStoreFile("whatever")
} catch (_: Exception) {
    null
}

@SuppressLint("SetWorldReadable")
override fun onPause() {
    super.onPause()
    preferenceFile?.setReadable(true, false)
}
```

完美解决，而且还可以通过判空来判断模块是否被启用：

```kotlin
fun checkModuleEnabled(): Boolean = preferenceFile != null
```

### ProGuard/R8 压缩

接下来，开发一定要做好自测✍️✍️✍️。打 release 包，安装测试，又双叒叕出错了，查看 LSPosed 日志，发现找不到 `DataStore` 相关的类。哦哦哦，是我启用了 ProGuard/R8 压缩，那就保留相关的类及其方法：

```proguard-rules.pro
-keep class androidx.datastore.DataStoreFile {
    public static java.io.File dataStoreFile(android.content.Context, java.lang.String);
}

-keep class androidx.datastore.core.DeviceProtectedDataStoreFile {
    public static java.io.File deviceProtectedDataStoreFile(android.content.Context, java.lang.String);
}
```

再次自测，没问题了。

## 总结引入 DataStore 的步骤

### 1. 添加依赖

libs.versions.toml :

```toml
[versions]
datastore = "1.2.0-alpha02"
kotlinxSerializationJson = "1.9.0"

[libraries]
datastore = { group = "androidx.datastore", name = "datastore", version.ref = "datastore" }
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinxSerializationJson" }


[plugins]
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

build.gradle.kts :

```kotlin
plugins {
    alias(libs.plugins.kotlin.serialization)
}

dependencies {
    implementation(libs.datastore)
    implementation(libs.kotlinx.serialization.json)
}
```

按 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> Sync Project With Gradle Files

### 2. Hook DataStore

PreferenceProvider :

```kotlin
object PreferenceProvider {
    private const val PREFERENCE_FILE_NAME = "preference.json"

    val preference: Preference? = try {
        Json.decodeFromString<Preference>(getPreferenceFile().readText())
    } catch (_: Exception) {
        null
    }

    fun getPreferenceFile(): File {
        val path = XSharedPreferences(BuildConfig.APPLICATION_ID).file.parent
        return File(path, PREFERENCE_FILE_NAME)
    }
}
```

SelfHook :

```kotlin
object SelfHook {
    fun enableDataStoreFileSharing(loadPackageParam: LoadPackageParam) {
        if (loadPackageParam.packageName != BuildConfig.APPLICATION_ID) return
        val file = PreferenceProvider.getPreferenceFile()
        if (!file.exists()) {
            file.writeText("{}")
            @SuppressLint("SetWorldReadable")
            file.setReadable(true, false)
        }

        findAndHookMethod(
            "androidx.datastore.core.DeviceProtectedDataStoreFile",
            loadPackageParam.classLoader,
            "deviceProtectedDataStoreFile",
            Context::class.java,
            String::class.java,
            returnConstant(file)
        )
        findAndHookMethod(
            "androidx.datastore.DataStoreFile",
            loadPackageParam.classLoader,
            "dataStoreFile",
            Context::class.java,
            String::class.java,
            returnConstant(file)
        )
    }
}
```

MainHook :

```kotlin
class MainHook : IXposedHookLoadPackage, IXposedHookInitPackageResources {
    override fun handleLoadPackage(lpparam: LoadPackageParam) {
        if (lpparam.packageName == BuildConfig.APPLICATION_ID) {
            SelfHook.enableDataStoreFileSharing(lpparam)
        }

        val preference = PreferenceProvider.preference ?: return

        when (lpparam.packageName) {
            Package.ANDROID -> {
                // 省略余下
```

### 3. 确保 DataStore 文件全部可读

修改偏好配置所在 Activity，在其失焦时使文件全部可读

MainActivity :

```kotlin
val preferenceFile = try {
    dataStoreFile("whatever")
} catch (_: Exception) {
    null
}

@SuppressLint("SetWorldReadable")
override fun onPause() {
    super.onPause()
    preferenceFile?.setReadable(true, false)
}
```

### 4. ProGuard/R8

如果启用了代码压缩/混淆，则需要添加以下规则：

```pro
-keep class your.packagename.MainHook

-keep class androidx.datastore.DataStoreFile {
    public static java.io.File dataStoreFile(android.content.Context, java.lang.String);
}

-keep class androidx.datastore.core.DeviceProtectedDataStoreFile {
    public static java.io.File deviceProtectedDataStoreFile(android.content.Context, java.lang.String);
}
```

其中 `your.packagename.MainHook` 是模块入口类，与 `assets/xposed_init` 文件中的类名一致。
