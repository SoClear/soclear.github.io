# LibXposed 102 模块开发指南

基于 LibXposed API 102 标准与现代化模块化工程实践总结。LibXposed 102 移除了传统 Xposed 复杂的 Manifest 元数据和不安全的跨进程文件读取，全面转向声明式配置、现代拦截器（Chain Interceptor）模型以及安全的 Remote File IPC 机制。

## 1. 推荐工程架构

推荐采用多模块分层架构，实现 Hook 逻辑与配置 UI 的彻底解耦：

```text
├── app/          # 模块主程序与设置界面 (Compose/DataStore)，组装最终 APK
├── hook/         # Hook 核心逻辑、入口类与拦截实现 (纯业务)
├── common/       # 共享数据模型 (Preference 数据类、常量、工具类)
└── stub/         # 目标系统/应用的 compileOnly 存根定义
```

**模块间依赖关系**：

- `app` -> `implementation(project(":common"))`，`runtimeOnly(project(":hook"))`（UI 不依赖 Hook 代码，打包时合并字节码）
- `hook` -> `implementation(project(":common"))`，`compileOnly(libs.libxposed.api)`
- `app` -> `implementation(libs.libxposed.service)`，`compileOnly(libs.libxposed.api)`（供 R8 混淆裁剪识别类型）

## 2. 依赖与 Gradle 配置

### 2.1 依赖声明 (`libs.versions.toml`)

LibXposed 已经发布至 Maven Central，无需额外配置第三方仓库：

```toml
[versions]
libxposed = "102.0.0"

[libraries]
libxposed-api = { group = "io.github.libxposed", name = "api", version.ref = "libxposed" }
libxposed-service = { group = "io.github.libxposed", name = "service", version.ref = "libxposed" }
```

### 2.2 构建脚本 (`build.gradle.kts`)

- **hook 模块**：仅需引入 API：

  ```kotlin
  dependencies {
      compileOnly(libs.libxposed.api)
      implementation(project(":common"))
  }
  ```

- **app 模块**：引入 Service 库，若需向宿主注入模块资源，建议自定义 package-id 避免 ID 冲突：

  ```kotlin
  android {
      androidResources {
          // 自定义资源 ID 前缀，避开默认的 0x7f
          additionalParameters += listOf("--allow-reserved-package-id", "--package-id", "0x55")
      }
  }

  dependencies {
      runtimeOnly(project(":hook"))
      compileOnly(libs.libxposed.api)
      implementation(libs.libxposed.service)
  }
  ```

## 3. 声明式配置 (META-INF)

API 102 **彻底弃用** `AndroidManifest.xml` 中的 `<meta-data>` 标签。全部配置放置于 `hook/src/main/resources/META-INF/xposed/` 目录下：

### 3.1 `module.prop`（模块基础信息）

```properties
minApiVersion=102
targetApiVersion=102
staticScope=true
autoHotReload=false
```

### 3.2 `java_init.list`（模块入口类）

每行一个完整的入口类名（替代旧版 `assets/xposed_init`）：

```text
io.github.soclear.oneuix.hook.Main
```

### 3.3 `scope.list`（静态作用域）

当 `module.prop` 开启 `staticScope=true` 时，在此列出模块作用域应用包名（一行一个，替代旧版 XML 数组）：

```text
system
com.android.settings
com.android.systemui
com.target.app
```

注意要 hook system_server 作用域要写 system ，而不是 82 版本的 android 。

## 4. 模块入口与生命周期

入口类继承自 `XposedModule`，按需覆盖生命周期钩子：

```kotlin
package io.github.soclear.oneuix.hook

import io.github.libxposed.api.XposedModule
import io.github.libxposed.api.XposedModuleInterface

class Main : XposedModule() {
    private var processName = ""

    // 模块在宿主进程加载时触发（获取进程名）
    override fun onModuleLoaded(param: XposedModuleInterface.ModuleLoadedParam) {
        processName = param.processName
    }

    // 目标应用 ClassLoader 就绪时触发
    override fun onPackageReady(param: XposedModuleInterface.PackageReadyParam) {
        val classLoader = param.classLoader
        val packageName = param.packageName

        when (packageName) {
            "com.target.app" -> initTargetAppHook(param)
        }
    }

    // system_server 启动时触发，原来 82 版本关于 "android" 的 hook 要写在这里
    override fun onSystemServerStarting(param: XposedModuleInterface.SystemServerStartingParam) {
        val classLoader = param.classLoader
        initSystemServerHook(param)
    }
}
```

## 5. Hook 与拦截器模型 (Chain Interceptor)

API 102 采用链式拦截器 API：`xposedModule.hook(member).intercept { chain -> ... }`。

### 5.1 基础调用与结果修改

```kotlin
val method = targetClass.getDeclaredMethod("targetMethod", String::class.java)

xposedModule.hook(method).intercept { chain ->
    // 1. 获取调用参数
    val arg0 = chain.args[0] as String
    
    // 2. 执行原方法
    val result = chain.proceed()
    
    // 3. 访问所属实例（如果是实例方法）
    val instance = chain.thisObject
    
    // 4. 返回修改后的结果
    return@intercept result
}
```

`intercept {}` 中最后一个表达式的值作为返回值，也就是被 hook 的方法的返回值。

### 5.2 修改入参调用原方法

```kotlin
xposedModule.hook(method).intercept { chain ->
    val newArgs = chain.args.toTypedArray()
    newArgs[0] = "ModifiedValue"
    chain.proceed(newArgs) // 传入修改后的参数执行
}
```

不要使用 `chain.args[index] = value` 的方式修改。
因为 `chain.args` 是 `List<Object>` （不变），直接通过下标修改的方式无效。
必须使用 `.toTypedArray()` 的方式。

### 5.3 阻断原方法并直接替换返回值

```kotlin
// 完全跳过原方法，直接返回模拟值
xposedModule.hook(method).intercept {
    return@intercept true
}

// 更简单的写法
xposedModule.hook(method).intercept { true }
```

### 5.4 构造函数 Hook

```kotlin
targetClass.declaredConstructors.forEach { constructor ->
    xposedModule.hook(constructor).intercept { chain ->
        val result = chain.proceed()
        // 对象实例化后修改内部私有属性
        chain.thisObject.setField("mInitialized", true)
        result
    }
}
```

## 6. 配置同步与跨进程通信 (Remote File & Service)

LibXposed 102 彻底废弃了 `XSharedPreferences` 和 ContentProvider 方案，推出了基于框架中介的 **Remote File 机制**。

### 6.1 模块应用侧：监听服务与读写文件

在 App 侧（如 DataStore/Serializer）通过 `XposedServiceHelper` 监听连接，使用 `openRemoteFile` 写入：

XposedServiceManager.kt:

```kotlin
import io.github.libxposed.service.XposedService
import io.github.libxposed.service.XposedServiceHelper

object XposedServiceManager {

    @Volatile
    var xposedService: XposedService? = null
        private set

    val isModuleActive: Boolean
        get() = xposedService != null

    init {
        XposedServiceHelper.registerListener(object : XposedServiceHelper.OnServiceListener {
            override fun onServiceBind(service: XposedService) {
                xposedService = service
            }

            override fun onServiceDied(service: XposedService) {
                if (xposedService == service) {
                    xposedService = null
                }
            }
        })
    }
}
```

PreferenceSerializer.kt:

```kotlin
import android.content.Context
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.datastore.core.Serializer
import androidx.datastore.dataStore
import io.github.soclear.oneuix.XposedServiceManager
import io.github.soclear.oneuix.common.IgnoreUnknownKeysJson
import io.github.soclear.oneuix.common.Preference
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.decodeFromStream
import kotlinx.serialization.json.encodeToStream
import java.io.InputStream
import java.io.OutputStream

object PreferenceSerializer : Serializer<Preference> {
    private const val TAG = "PreferenceSerializer"

    @OptIn(ExperimentalSerializationApi::class)
    override suspend fun readFrom(input: InputStream): Preference = try {
        val service = XposedServiceManager.xposedService ?: return defaultValue
        val parcelFileDescriptor = service.openRemoteFile(Preference.FILE_NAME)

        ParcelFileDescriptor.AutoCloseInputStream(parcelFileDescriptor).use { inputStream ->
            if (inputStream.channel.size() == 0L) return defaultValue
            IgnoreUnknownKeysJson.decodeFromStream<Preference>(inputStream)
        }
    } catch (e: Exception) {
        Log.e(TAG, "readFrom", e)
        defaultValue
    }


    @OptIn(ExperimentalSerializationApi::class)
    override suspend fun writeTo(t: Preference, output: OutputStream) {
        try {
            val service = XposedServiceManager.xposedService ?: return
            val parcelFileDescriptor = service.openRemoteFile(Preference.FILE_NAME)

            ParcelFileDescriptor.AutoCloseOutputStream(parcelFileDescriptor).use { outputStream ->
                outputStream.channel.truncate(0)
                IgnoreUnknownKeysJson.encodeToStream(Preference.serializer(), t, outputStream)
                outputStream.channel.force(true)
            }
        } catch (e: Exception) {
            Log.e(TAG, "writeTo", e)
        }
    }

    override val defaultValue: Preference = Preference()
}

val Context.dataStore by dataStore("whatever", PreferenceSerializer)
```

优点：只维护一份配置，不用双向同步；不用写混淆规则；即时写入，不用等 onResume 。

### 6.2 宿主 Hook 侧：读取配置文件

在 Hook 代码中，宿主进程通过 `xposedModule.openRemoteFile` 只读安全拉取：

```kotlin
@OptIn(ExperimentalSerializationApi::class)
context(xposedModule: XposedModule)
fun loadPreference(): Preference? = try {
    val parcelFileDescriptor = xposedModule.openRemoteFile(Preference.FILE_NAME)
    ParcelFileDescriptor.AutoCloseInputStream(parcelFileDescriptor).use { inputStream ->
        if (inputStream.channel.size() == 0L) {
            return null
        }
        IgnoreUnknownKeysJson.decodeFromStream<Preference>(inputStream)
    }
} catch (_: java.io.FileNotFoundException) {
    null
} catch (t: Throwable) {
    xlog(t)
    null
}
```

## 7. R8 / ProGuard 混淆规则

在 `hook/consumer-rules.pro` 中配置：

```text
# 混淆时自动同步更新 java_init.list 中的类名
-adaptresourcefilecontents META-INF/xposed/java_init.list
-dontwarn io.github.libxposed.annotation.**

# 允许混淆与优化模块入口类，但保留公共无参构造函数
-keep,allowoptimization,allowobfuscation public class * extends io.github.libxposed.api.XposedModule {
    public <init>();
}
```

## 8. 日志与调试避坑

1. **Tag 白名单过滤问题**：
   - 使用 `xposedModule.log(priority, tag, message)` 时，**推荐将 `tag` 传 `null`**。
   - 框架（如 LSPosed、Vector）会自动赋予默认 Tag（`LSPosedContext` / `VectorContext`），以命中框架守护进程的日志白名单。自定义 Tag 往往会被过滤掉导致管理器看不到日志。
2. **OEM 厂商系统日志等级屏蔽**：
   - 三星等 OEM 系统的属性（如 `persist.log.semlevel`）会屏蔽进程名包含系统特征的 `VERBOSE`/`DEBUG` 级别日志。
   - 建议在 Hook 逻辑中统一使用 `Log.INFO`、`Log.WARN` 或 `Log.ERROR` 输出重要日志。

## 9. 辅助工具代码

### 9.1 Reflect

```kotlin
package io.github.soclear.oneuix.hook.util

import java.lang.reflect.Constructor
import java.lang.reflect.Field
import java.lang.reflect.Member
import java.lang.reflect.Method
import java.lang.reflect.Modifier
import java.lang.reflect.Array as JavaArray
import java.util.concurrent.ConcurrentHashMap
import kotlin.reflect.KClass

// -------------------------------------------------------------
// 高性能并发反射缓存池 (FieldKey / MethodKey / ConstructorKey)
// -------------------------------------------------------------
private class FieldKey(
    val clazz: Class<*>,
    val name: String
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is FieldKey) return false
        return clazz == other.clazz && name == other.name
    }

    override fun hashCode(): Int = 31 * clazz.hashCode() + name.hashCode()
}

private class MethodKey(
    val clazz: Class<*>,
    val name: String,
    val paramTypes: Array<Class<*>>
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MethodKey) return false
        return clazz == other.clazz && name == other.name && paramTypes.contentEquals(other.paramTypes)
    }

    override fun hashCode(): Int = 31 * (31 * clazz.hashCode() + name.hashCode()) + paramTypes.contentHashCode()
}

private class ConstructorKey(
    val clazz: Class<*>,
    val paramTypes: Array<Class<*>>
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is ConstructorKey) return false
        return clazz == other.clazz && paramTypes.contentEquals(other.paramTypes)
    }

    override fun hashCode(): Int = 31 * clazz.hashCode() + paramTypes.contentHashCode()
}

private val fieldCache = ConcurrentHashMap<FieldKey, Field>()
private val methodCache = ConcurrentHashMap<MethodKey, Method>()
private val constructorCache = ConcurrentHashMap<ConstructorKey, Constructor<*>>()

private val EMPTY_CLASS_ARRAY = emptyArray<Class<*>>()

// 基本类型名与常用别名解析（消除运行时 Map 对象分配，无需 !!）
private fun resolvePrimitiveOrAlias(name: String): Class<*>? = when (name) {
    "boolean" -> Boolean::class.java
    "byte" -> Byte::class.java
    "char" -> Char::class.java
    "short" -> Short::class.java
    "int" -> Int::class.java
    "long" -> Long::class.java
    "float" -> Float::class.java
    "double" -> Double::class.java
    "void" -> Void.TYPE
    "string", "String" -> String::class.java
    "object", "Object" -> Any::class.java
    else -> null
}

/**
 * 基本类型装箱匹配（利用 isPrimitive 极速短路，分支直比指针，零 Map 分配）
 */
private fun Class<*>.boxed(): Class<*> {
    if (!isPrimitive) return this
    return when (this) {
        Boolean::class.java -> Boolean::class.javaObjectType
        Byte::class.java -> Byte::class.javaObjectType
        Char::class.java -> Char::class.javaObjectType
        Short::class.java -> Short::class.javaObjectType
        Int::class.java -> Int::class.javaObjectType
        Long::class.java -> Long::class.javaObjectType
        Float::class.java -> Float::class.javaObjectType
        Double::class.java -> Double::class.javaObjectType
        Void.TYPE -> Void::class.javaObjectType
        else -> this
    }
}

/**
 * 完整符合 JLS 5.1.2 规范的基本类型加宽规则（包含 Char）
 */
private fun isWideningCompatible(targetType: Class<*>, arg: Any?): Boolean {
    if (!targetType.isPrimitive) return false
    if (arg is Char) {
        return targetType == Int::class.java ||
               targetType == Long::class.java ||
               targetType == Float::class.java ||
               targetType == Double::class.java
    }
    if (arg !is Number) return false
    return when (targetType) {
        Double::class.java -> arg is Float || arg is Long || arg is Int || arg is Short || arg is Byte
        Float::class.java -> arg is Long || arg is Int || arg is Short || arg is Byte
        Long::class.java -> arg is Int || arg is Short || arg is Byte
        Int::class.java -> arg is Short || arg is Byte
        Short::class.java -> arg is Byte
        else -> false
    }
}

/**
 * 校验类型是否兼容（精确多态 + 装箱 + JLS 规范加宽）
 */
private fun isCompatible(parameterType: Class<*>, argument: Any?): Boolean = when {
    argument == null -> !parameterType.isPrimitive
    else -> parameterType.boxed().isInstance(argument) || isWideningCompatible(parameterType, argument)
}

/**
 * 工业级 ClassLoader 智能加载：
 * 1. 数组类型自动解析（如 "int[]", "byte[]", "java.lang.String[]"）
 * 2. 基本数据类型映射（如 "int" -> int.class）
 * 3. 智能双亲 ClassLoader 候选链（preferredLoader -> contextClassLoader -> moduleLoader）
 * 4. 内部类语法糖智能容错（Outer.Inner 自动回退尝试 Outer$Inner）
 */
fun loadClassWithFallback(className: String, preferredLoader: ClassLoader? = null): Class<*> {
    if (className.endsWith("[]")) {
        val componentName = className.substring(0, className.length - 2)
        val componentType = loadClassWithFallback(componentName, preferredLoader)
        return JavaArray.newInstance(componentType, 0).javaClass
    }

    resolvePrimitiveOrAlias(className)?.let { return it }

    val loaders = listOfNotNull(
        preferredLoader,
        Thread.currentThread().contextClassLoader,
        Reflect::class.java.classLoader,
        ClassLoader.getSystemClassLoader()
    ).distinct()

    for (loader in loaders) {
        try {
            return Class.forName(className, false, loader)
        } catch (_: ClassNotFoundException) {
            if (className.contains('.')) {
                val lastDot = className.lastIndexOf('.')
                val dollarName = className.substring(0, lastDot) + '$' + className.substring(lastDot + 1)
                try {
                    return Class.forName(dollarName, false, loader)
                } catch (_: ClassNotFoundException) {}
            }
        }
    }
    throw ClassNotFoundException("Failed to resolve class '$className' via available ClassLoaders")
}

private fun Any.toJavaClass(preferredLoader: ClassLoader? = null): Class<*> = when (this) {
    is Class<*> -> this
    is KClass<*> -> this.java
    is String -> loadClassWithFallback(this, preferredLoader)
    else -> throw IllegalArgumentException("Unsupported type: ${this.javaClass.name}, expected Class<*>, KClass<*>, or String")
}

/**
 * 现代高性能 Kotlin 反射门面
 */
@JvmInline
value class Reflect(val target: Any) {

    val targetClass: Class<*>
        get() = (target as? Class<*>) ?: target.javaClass

    val isClass: Boolean
        get() = target is Class<*>

    private fun checkInstanceAccess(member: Member) {
        if (isClass && !Modifier.isStatic(member.modifiers)) {
            throw IllegalStateException("Cannot access instance member '${member.name}' on a Class target ($targetClass). Use instance.reflect instead.")
        }
    }

    // ==========================================
    // 字段操作 (Field)
    // ==========================================

    fun findField(name: String): Field {
        val clazz = targetClass
        val key = FieldKey(clazz, name)
        return fieldCache.getOrPut(key) {
            var current: Class<*>? = clazz
            while (current != null) {
                try {
                    return@getOrPut current.getDeclaredField(name).apply { isAccessible = true }
                } catch (_: NoSuchFieldException) {
                    current = current.superclass
                }
            }
            try {
                return@getOrPut clazz.getField(name).apply { isAccessible = true }
            } catch (_: NoSuchFieldException) {}

            throw NoSuchFieldException("Field '$name' not found in $clazz")
        }
    }

    operator fun get(name: String): Any? {
        val field = findField(name)
        checkInstanceAccess(field)
        val isStatic = Modifier.isStatic(field.modifiers)
        return field.get(if (isStatic) null else target)
    }

    @Suppress("UNCHECKED_CAST")
    fun <T> getAs(name: String): T? = get(name) as? T

    @Suppress("UNCHECKED_CAST")
    fun <T> getNonNull(name: String): T =
        get(name) as? T ?: throw NullPointerException("Field '$name' is null or wrong type in $targetClass")

    operator fun set(name: String, value: Any?) {
        val field = findField(name)
        checkInstanceAccess(field)
        val isStatic = Modifier.isStatic(field.modifiers)
        field.set(if (isStatic) null else target, value)
    }

    // ==========================================
    // 方法操作 (Method)
    // ==========================================

    /**
     * 精确查找方法（专用于 LibXposed 注册 Hook）
     */
    fun findMethodExact(name: String, vararg paramTypes: Any): Method {
        val clazz = targetClass
        val loader = clazz.classLoader
        val resolvedTypes = if (paramTypes.isEmpty()) EMPTY_CLASS_ARRAY
            else Array(paramTypes.size) { paramTypes[it].toJavaClass(loader) }

        val key = MethodKey(clazz, name, resolvedTypes)
        return methodCache.getOrPut(key) {
            var current: Class<*>? = clazz
            while (current != null) {
                try {
                    return@getOrPut current.getDeclaredMethod(name, *resolvedTypes).apply { isAccessible = true }
                } catch (_: NoSuchMethodException) {
                    current = current.superclass
                }
            }
            try {
                return@getOrPut clazz.getMethod(name, *resolvedTypes).apply { isAccessible = true }
            } catch (_: NoSuchMethodException) {}

            throw NoSuchMethodException("Method '$name'(${resolvedTypes.joinToString { it.name }}) not found in $clazz")
        }
    }

    /**
     * 按实参动态自适应查找方法（修复 null 实参第一阶段匹配与 JLS 加宽支持）
     */
    fun findMethod(name: String, vararg args: Any?): Method {
        val clazz = targetClass
        val argTypes = if (args.isEmpty()) EMPTY_CLASS_ARRAY 
            else Array<Class<*>>(args.size) { (args[it]?.javaClass ?: Any::class.java) as Class<*> }
        val key = MethodKey(clazz, name, argTypes)
        
        return methodCache.getOrPut(key) {
            // 第一阶段：整树寻找精准匹配（修复对 null 实参的精准兼容）
            var current: Class<*>? = clazz
            while (current != null) {
                current.declaredMethods
                    .filter { it.name == name && it.parameterTypes.size == args.size }
                    .firstOrNull { method ->
                        method.parameterTypes.indices.all { i ->
                            val arg = args[i]
                            if (arg == null) !method.parameterTypes[i].isPrimitive 
                            else method.parameterTypes[i].boxed() == arg.javaClass
                        }
                    }?.let { return@getOrPut it.apply { isAccessible = true } }
                current = current.superclass
            }

            // 第二阶段：整树多态与 JLS 数值加宽降级匹配
            current = clazz
            while (current != null) {
                current.declaredMethods
                    .filter { it.name == name && it.parameterTypes.size == args.size }
                    .firstOrNull { method ->
                        method.parameterTypes.indices.all { i ->
                            isCompatible(method.parameterTypes[i], args[i])
                        }
                    }?.let { return@getOrPut it.apply { isAccessible = true } }
                current = current.superclass
            }

            // 第三阶段：兜底公共接口方法（含 Java 8+ 默认方法）
            clazz.methods
                .filter { it.name == name && it.parameterTypes.size == args.size }
                .firstOrNull { method ->
                    method.parameterTypes.indices.all { i ->
                        isCompatible(method.parameterTypes[i], args[i])
                    }
                }?.let { return@getOrPut it.apply { isAccessible = true } }

            throw NoSuchMethodException("Method '$name'(${args.size} args) not found in $clazz")
        }
    }

    fun findMethod(predicate: (Method) -> Boolean): Method? {
        var current: Class<*>? = targetClass
        while (current != null) {
            current.declaredMethods.firstOrNull(predicate)?.let {
                it.isAccessible = true
                return it
            }
            current = current.superclass
        }
        return null
    }

    fun call(name: String, vararg args: Any?): Any? {
        val method = findMethod(name, *args)
        checkInstanceAccess(method)
        val isStatic = Modifier.isStatic(method.modifiers)
        return method.invoke(if (isStatic) null else target, *args)
    }

    /**
     * 精确调用方法（使用 Array<out Any> 允许 Array<Class<*>> 或 Array<String> 传入）
     */
    fun callExact(name: String, paramTypes: Array<out Any>, vararg args: Any?): Any? {
        require(paramTypes.size == args.size) { "paramTypes.size (${paramTypes.size}) != args.size (${args.size})" }
        val method = findMethodExact(name, *paramTypes)
        checkInstanceAccess(method)
        val isStatic = Modifier.isStatic(method.modifiers)
        return method.invoke(if (isStatic) null else target, *args)
    }

    @Suppress("UNCHECKED_CAST")
    fun <T> callAs(name: String, vararg args: Any?): T? = call(name, *args) as? T

    @Suppress("UNCHECKED_CAST")
    fun <T> callExactAs(name: String, paramTypes: Array<out Any>, vararg args: Any?): T? =
        callExact(name, paramTypes, *args) as? T

    operator fun invoke(name: String, vararg args: Any?): Any? = call(name, *args)

    // ==========================================
    // 构造函数与实例化 (Constructor)
    // ==========================================

    fun findConstructorExact(vararg paramTypes: Any): Constructor<*> {
        if (!isClass) {
            throw UnsupportedOperationException("Cannot find constructor on an instance. Target must be a Class<*>.")
        }
        val clazz = target as Class<*>
        val loader = clazz.classLoader
        val resolvedTypes = if (paramTypes.isEmpty()) EMPTY_CLASS_ARRAY
            else Array(paramTypes.size) { paramTypes[it].toJavaClass(loader) }

        val key = ConstructorKey(clazz, resolvedTypes)
        return constructorCache.getOrPut(key) {
            clazz.getDeclaredConstructor(*resolvedTypes).apply { isAccessible = true }
        }
    }

    fun new(vararg args: Any?): Any {
        if (!isClass) {
            throw UnsupportedOperationException("Cannot call new() on an instance. Target must be a Class<*>.")
        }
        val clazz = target as Class<*>
        val argTypes = if (args.isEmpty()) EMPTY_CLASS_ARRAY 
            else Array<Class<*>>(args.size) { (args[it]?.javaClass ?: Any::class.java) as Class<*> }
        val key = ConstructorKey(clazz, argTypes)
        
        val constructor = constructorCache.getOrPut(key) {
            clazz.declaredConstructors
                .filter { it.parameterTypes.size == args.size }
                .firstOrNull { ctor ->
                    ctor.parameterTypes.indices.all { i ->
                        val arg = args[i]
                        if (arg == null) !ctor.parameterTypes[i].isPrimitive 
                        else ctor.parameterTypes[i].boxed() == arg.javaClass
                    }
                }?.apply { isAccessible = true }
                ?: clazz.declaredConstructors
                    .filter { it.parameterTypes.size == args.size }
                    .firstOrNull { ctor ->
                        ctor.parameterTypes.indices.all { i ->
                            isCompatible(ctor.parameterTypes[i], args[i])
                        }
                    }?.apply { isAccessible = true }
                ?: throw NoSuchMethodException("Constructor(${args.size} args) not found in $clazz")
        }
        return constructor.newInstance(*args)
    }

    fun newExact(paramTypes: Array<out Any>, vararg args: Any?): Any {
        require(paramTypes.size == args.size) { "paramTypes.size (${paramTypes.size}) != args.size (${args.size})" }
        val constructor = findConstructorExact(*paramTypes)
        return constructor.newInstance(*args)
    }

    @Suppress("UNCHECKED_CAST")
    fun <T> newAs(vararg args: Any?): T = new(*args) as T

    @Suppress("UNCHECKED_CAST")
    fun <T> newExactAs(paramTypes: Array<out Any>, vararg args: Any?): T = newExact(paramTypes, *args) as T
}

// -------------------------------------------------------------
// 扩展入口
// -------------------------------------------------------------
inline val Any.reflect: Reflect get() = Reflect(this)
inline val KClass<*>.reflect: Reflect get() = Reflect(this.java)

fun ClassLoader.reflect(className: String): Reflect {
    val clazz = loadClassWithFallback(className, this)
    return Reflect(clazz)
}
```

### 9.2 Util.kt

```kotlin
package io.github.soclear.oneuix.hook.util

import android.annotation.SuppressLint
import android.app.Application
import android.content.Context
import android.content.ContextWrapper
import android.content.pm.PackageManager
import android.content.res.loader.ResourcesLoader
import android.content.res.loader.ResourcesProvider
import android.os.ParcelFileDescriptor
import android.util.Log
import io.github.libxposed.api.XposedModule
import java.io.File

@SuppressLint("PrivateApi", "DiscouragedPrivateApi")
fun getSystemContext(): Context {
    val activityThreadClass = Class.forName("android.app.ActivityThread")
    val currentActivityThreadMethod = activityThreadClass.getDeclaredMethod("currentActivityThread")
    val currentActivityThread = currentActivityThreadMethod.invoke(null)
    val getSystemContextMethod = activityThreadClass.getDeclaredMethod("getSystemContext")
    return getSystemContextMethod.invoke(currentActivityThread) as Context
}

@SuppressLint("PrivateApi", "DiscouragedPrivateApi")
fun currentApplication(): Application? {
    val activityThreadClass = Class.forName("android.app.ActivityThread")
    val currentApplicationMethod = activityThreadClass.getDeclaredMethod("currentApplication")
    return currentApplicationMethod.invoke(null) as? Application
}

fun currentContext(): Context = currentApplication() ?: getSystemContext()

@SuppressLint("PrivateApi", "DiscouragedPrivateApi")
fun getCurrentPackageName(): String {
    val activityThreadClass = Class.forName("android.app.ActivityThread")
    val currentPackageNameMethod = activityThreadClass.getDeclaredMethod("currentPackageName")
    return (currentPackageNameMethod.invoke(null) as? String) ?: ""
}

fun getPackageVersionCode(name: String = getCurrentPackageName()): Long {
    if (name.isEmpty()) return -1L
    return getSystemContext().packageManager.getPackageInfo(name, PackageManager.PackageInfoFlags.of(0)).longVersionCode
}

val Context.longVersionCode get() = packageManager.getPackageInfo(packageName, 0).longVersionCode

@SuppressLint("DiscouragedPrivateApi")
context(xposedModule: XposedModule)
fun afterAttach(action: Context.() -> Unit) {
    val method = Application::class.java.getDeclaredMethod("attach", Context::class.java)
    xposedModule.hook(method).intercept { chain ->
        val result = chain.proceed()
        action(chain.args[0] as Context)
        result
    }
}

// 向宿主添加资源，路径为apk文件路径。例如添加模块的资源
context(xposedModule: XposedModule)
fun addAssetPath(modulePath: String) {
    val method = ContextWrapper::class.java.getDeclaredMethod("attachBaseContext", Context::class.java)
    xposedModule.hook(method).intercept { chain ->
        val result = chain.proceed()
        val context = chain.thisObject as Context
        if (context is Application) {
            try {
                val moduleApk = File(modulePath)
                val parcelFileDescriptor = ParcelFileDescriptor.open(moduleApk, ParcelFileDescriptor.MODE_READ_ONLY)
                val resourcesProvider = ResourcesProvider.loadFromApk(parcelFileDescriptor)
                val resourcesLoader = ResourcesLoader()
                resourcesLoader.addProvider(resourcesProvider)
                context.resources.addLoaders(resourcesLoader)
            } catch (t: Throwable) {
                xposedModule.log(Log.ERROR, "Util", "addAssetPath", t)
            }
        }
        result
    }
}

/*
三星 ROM 的 persist.log.semlevel = 0xFFFFFF00 会屏蔽进程名包含 .sec 、.samsung 的 VERBOSE/DEBUG
所以请使用 ASSERT/ERROR/INFO/WARN

tag 传入 null，框架会自动赋予默认 Tag（Vector 为 "VectorContext"，LSPosed 为 "LSPosedContext"）
这样才能命中 Vector/LSPosed 守护进程的 Tag 白名单，同时避免自定义 Tag 被过滤
 */
context(xposedModule: XposedModule)
fun xlog(
    message: Any?,
    throwable: Throwable? = null,
    priority: Int = Log.ERROR
) {
    val moduleTag = "[OneUIX]"
    val topBorder = "┌────────────────────────────────────────────────────────"
    val linePrefix = "│ "
    val bottomBorder = "└────────────────────────────────────────────────────────"

    // 过滤掉 UtilKt 自身的调用帧（包含默认参数生成的 synthetic $default 方法），定位到真正的调用方
    val caller = Throwable().stackTrace.firstOrNull { frame ->
        val name = frame.className
        name != "io.github.soclear.oneuix.hook.util.UtilKt" && !name.startsWith("io.github.soclear.oneuix.hook.util.UtilKt$")
    }?.let {
        "[${it.fileName}:${it.lineNumber}] "
    }.orEmpty()

    // 巧妙兼容：如果第一个参数传的是 Throwable，且没额外传第二个 throwable 参数，自动归位
    val actualThrowable = when {
        throwable != null -> throwable
        message is Throwable -> message
        else -> null
    }

    val sb = StringBuilder().apply {
        append("\n").append(moduleTag).append(" ").append(topBorder).append("\n")

        if (message is Throwable && throwable == null) {
            // 当只传了一个 Throwable 时：第一行展示代码位置以及异常信息
            val exceptionSummary = "${message.javaClass.name}${message.message?.let { ": $it" }.orEmpty()}"
            append(moduleTag).append(" ").append(linePrefix).append(caller).append(exceptionSummary).append("\n")
        } else {
            // 传普通内容（或 message + throwable）时：逐行展示文本
            val lines = (message?.toString() ?: "null").lines()
            append(moduleTag).append(" ").append(linePrefix).append(caller).append(lines.firstOrNull().orEmpty())
                .append("\n")
            for (i in 1 until lines.size) {
                append(moduleTag).append(" ").append(linePrefix).append(lines[i]).append("\n")
            }
            if (actualThrowable != null) {
                append(moduleTag).append(" ").append(linePrefix).append("Exception: ")
                    .append(actualThrowable.javaClass.name).append(": ").append(actualThrowable.message).append("\n")
            }
        }

        // 打印堆栈
        if (actualThrowable != null) {
            actualThrowable.stackTrace.take(15).forEach { frame ->
                append(moduleTag).append(" ").append(linePrefix).append("    at ").append(frame).append("\n")
            }
            if (actualThrowable.stackTrace.size > 15) {
                append(moduleTag).append(" ").append(linePrefix)
                    .append("    ... and ${actualThrowable.stackTrace.size - 15} more frames\n")
            }
        }
        append(moduleTag).append(" ").append(bottomBorder)
    }

    // tag 必须为 null，确保 Vector/LSPosed 守护进程的白名单能正常收集到 modules 日志
    if (actualThrowable != null) {
        android.util.Log.e("OneUIX", sb.toString(), actualThrowable)
        xposedModule.log(priority, null, sb.toString(), actualThrowable)
    } else {
        android.util.Log.e("OneUIX", sb.toString())
        xposedModule.log(priority, null, sb.toString())
    }
}
```
