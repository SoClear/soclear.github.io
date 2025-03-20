# DataStore

Jetpack DataStore 是一种数据存储解决方案，允许您使用[协议缓冲区](https://developers.google.com/protocol-buffers?hl=zh-cn)存储键值对或类型化对象。DataStore 使用 Kotlin 协程和 Flow 以异步、一致的事务方式存储数据。

如果您目前是使用 [`SharedPreferences`](https://developer.android.com/reference/kotlin/android/content/SharedPreferences?hl=zh-cn) 存储数据的，请考虑迁移到 DataStore。

**注意**：如果您需要支持大型或复杂数据集、部分更新或参照完整性，请考虑使用 [Room](https://developer.android.com/training/data-storage/room?hl=zh-cn)，而不是 DataStore。DataStore 非常适合简单的小型数据集，但不支持部分更新或引用完整性。

## Preferences DataStore 和 Proto DataStore

DataStore 提供两种不同的实现：Preferences DataStore 和 Proto DataStore。

- **Preferences DataStore** 使用键存储和访问数据。此实现不需要预定义的架构，也不确保类型安全。
- **Proto DataStore** 将数据作为自定义数据类型的实例进行存储。此实现要求您使用[协议缓冲区](https://developers.google.com/protocol-buffers?hl=zh-cn)来定义架构，但可以确保类型安全。

## 正确使用 DataStore

为了正确使用 DataStore，请始终谨记以下规则：

1. **请勿在同一进程中为给定文件创建多个 `DataStore` 实例**，否则会破坏所有 DataStore 功能。如果给定文件在同一进程中有多个有效的 DataStore 实例，DataStore 在读取或更新数据时将抛出 `IllegalStateException`。

2. **DataStore 的通用类型必须不可变** 。更改 DataStore 中使用的类型会导致 DataStore 提供的所有保证都失效，并且可能会造成严重的、难以发现的 bug。强烈建议您使用可保证不可变性、具有简单的 API 且能够高效进行序列化的协议缓冲区。

3. **切勿对同一个文件混用 `SingleProcessDataStore` 和 `MultiProcessDataStore`** 。如果您打算从多个进程访问 `DataStore`，请始终使用 [`MultiProcessDataStore`](https://developer.android.com/topic/libraries/architecture/datastore?hl=zh-cn#multiprocess)。

## 设置

如需在您的应用中使用 Jetpack DataStore，请根据您要使用的实现向 Gradle 文件添加以下内容：

### Preferences DataStore

```kotlin
// Preferences DataStore (SharedPreferences like APIs)
dependencies {
    implementation("androidx.datastore:datastore-preferences:1.1.2")

    // optional - RxJava2 support
    implementation("androidx.datastore:datastore-preferences-rxjava2:1.1.2")

    // optional - RxJava3 support
    implementation("androidx.datastore:datastore-preferences-rxjava3:1.1.2")
}

// Alternatively - use the following artifact without an Android dependency.
dependencies {
    implementation("androidx.datastore:datastore-preferences-core:1.1.2")
}
```

### Proto DataStore

```kotlin
// Typed DataStore (Typed API surface, such as Proto)
dependencies {
    implementation("androidx.datastore:datastore:1.1.2")

    // optional - RxJava2 support
    implementation("androidx.datastore:datastore-rxjava2:1.1.2")

    // optional - RxJava3 support
    implementation("androidx.datastore:datastore-rxjava3:1.1.2")
}

// Alternatively - use the following artifact without an Android dependency.
dependencies {
    implementation("androidx.datastore:datastore-core:1.1.2")
}
```

**注意**：如果您将 `datastore-preferences-core` 工件与 Proguard 搭配使用，就必须手动将 Proguard 规则添加到 `proguard-rules.pro` 文件中，以免您的字段被删除。您可以点击[此处](https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:datastore/datastore-preferences/proguard-rules.pro?hl=zh-cn)查找必要的规则。

## 使用 Preferences DataStore 存储键值对

TODO: 待补充

## 使用 Proto DataStore 存储类型化对象

Proto DataStore 实现使用 DataStore 和[协议缓冲区](https://developers.google.com/protocol-buffers?hl=zh-cn)将类型化对象保留在磁盘上。

### 1. 导入依赖

`libs.versions.toml` :

```toml
[versions]
datastore = "1.1.2"
protobuf = "0.9.4"
protobuf-javalite = "4.29.3"


[libraries]
androidx-datastore = { group = "androidx.datastore", name = "datastore", version.ref = "datastore" }
protobuf-javalite = { group = "com.google.protobuf", name = "protobuf-javalite", version.ref = "protobuf-javalite" }
protobuf-protoc = { group = "com.google.protobuf", name = "protoc", version.ref = "protobuf-javalite" }


[plugins]
protobuf = { id = "com.google.protobuf", version.ref = "protobuf" }
```

模块的 `build.gradle.kts` :

```kotlin
plugins {
    // ...
    alias(libs.plugins.protobuf)
}

// ...

dependencies {
    // ...
    implementation(libs.protobuf.javalite)
}

protobuf {
    protoc {
        artifact = libs.protobuf.protoc.get().toString()
    }
    generateProtoTasks {
        all().forEach { task ->
            task.builtins {
                create("java") {
                    option("lite")
                }
            }
        }
    }
}
```

### 2. 定义架构

Proto DataStore 要求在 `app/src/main/proto/` 目录下的 proto 文件中保存预定义的架构。此架构用于定义您在 Proto DataStore 中保存的对象的类型。如需详细了解如何定义 proto 架构，请参阅 [protobuf 语言指南](https://developers.google.com/protocol-buffers/docs/proto3?hl=zh-cn)。

`settings.proto` ：

```proto
syntax = "proto3";

option java_package = "your.package.name";
option java_multiple_files = true;

message Settings {
  string user_name = 1;
  bool dark_theme_enabled = 2;
  int32 notification_count = 3;
}
```

**注意：** 所存储对象的类是在编译时基于 proto 文件中定义的 `message` 生成的。请务必重新构建您的项目。

每次更新 proto 文件后，必须重新构建 `Build` -> `Assemble 'app' Run Configuration` （ <kbd>CTRL</kbd> + <kbd>F9</kbd> ）。

### 3. 创建 Proto DataStore

创建 Proto DataStore 来存储类型化对象涉及两个步骤：

1. 定义一个实现 `Serializer<T>` 的类，其中 `T` 是 proto 文件中定义的类型。此序列化器类会告知 DataStore 如何读取和写入您的数据类型。请务必为该序列化器添加默认值，以便在尚未创建任何文件时使用。
2. 使用 `dataStore` 所创建的属性委托来创建 `DataStore<T>` 实例，其中 `T` 是在 proto 文件中定义的类型。在您的 Kotlin 文件顶层调用该实例一次，便可在应用的所有其余部分通过此属性委托访问该实例。`filename` 参数会告知 DataStore 使用哪个文件存储数据，而 `serializer` 参数会告知 DataStore 在第 1 步中定义的序列化器类的名称。

`SettingsDataStore.Kt` （建议放在 `app/src/main/java/your/package/name/data/` 下）:

```kotlin
object SettingsSerializer : Serializer<Settings> {
    override val defaultValue: Settings = Settings.getDefaultInstance()
    override suspend fun readFrom(input: InputStream): Settings {
        return try {
            Settings.parseFrom(input)
        } catch (exception: InvalidProtocolBufferException) {
            Log.d("SettingsSerializer", "Cannot read proto.")
            defaultValue
        }
    }

    override suspend fun writeTo(t: Settings, output: OutputStream) = t.writeTo(output)
}

val Context.settingsDataStore: DataStore<Settings> by dataStore(
    fileName = "settings.pb",
    serializer = SettingsSerializer
)
```

### 4. 读取和写入数据

`your/package/name/data/SettingsRepository` :

```kotlin
class SettingsRepository (private val settingsDataStore: DataStore<Settings>) {
    val settingsFlow = settingsDataStore.data
    // 更新数据
    suspend fun updateUserName(userName: String) {
        settingsDataStore.updateData { preferences ->
            preferences.toBuilder()
                .setUserName(userName)
                .build()
        }
    }

    suspend fun enableDarkTheme(enabled: Boolean) {
        settingsDataStore.updateData { preferences ->
            preferences.toBuilder()
                .setDarkThemeEnabled(enabled)
                .build()
        }
    }

    suspend fun incrementNotificationCount() {
        settingsDataStore.updateData { preferences ->
            preferences.toBuilder()
                .setNotificationCount(preferences.notificationCount + 1)
                .build()
        }
    }
}
```

`your/package/name/ui/MainViewModel` :

```kotlin
class MainViewModel(private val settingsRepository: SettingsRepository) : ViewModel() {
    val uiState = settingsRepository.settingsFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000L),
        initialValue = Settings.getDefaultInstance()
    )

    // 更新用户名
    fun updateUserName(name: String) {
        viewModelScope.launch {
            settingsRepository.updateUserName(name)
        }
    }

    // 切换深色主题
    fun toggleDarkTheme(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.enableDarkTheme(enabled)
        }
    }

    fun incrementNotificationCount() {
        viewModelScope.launch {
            settingsRepository.incrementNotificationCount()
        }
    }
}
```

`your/package/name/ui/MainScreen.kt` :

```kotlin
@Composable
fun MainScreen(viewModel: MainViewModel, modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxSize()) {
        val uiState by viewModel.uiState.collectAsStateWithLifecycle()

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("开关：")
            Switch(checked = uiState.darkThemeEnabled, onCheckedChange = viewModel::toggleDarkTheme)
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("加一：")
            Button(
                onClick = viewModel::incrementNotificationCount
            ) {
                Text(text = uiState.notificationCount.toString())
            }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("已保存的字符串值：")
            Text(text = uiState.userName)
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            var tempUserName by remember { mutableStateOf("") }
            TextField(value = tempUserName, onValueChange = { tempUserName = it })
            Button(onClick = { viewModel.updateUserName(tempUserName) }) {
                Text(text = "保存")
            }
        }
    }
}
```

`your/package/name/MainActivity.kt` :

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val viewModel:MainViewModel by viewModels {
            MainViewModelFactory(SettingsRepository(settingsDataStore))
        }
        setContent {
            TestTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    MainScreen(viewModel = viewModel,modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

class MainViewModelFactory(private val settingsRepository: SettingsRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(settingsRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
```

### 从 Proto DataStore 读取数据

使用 `DataStore.data` 显示所存储对象中相应属性的 `Flow`。

```kotlin
val notificationCountFlow: Flow<Int> = context.settingsDataStore.data
  .map { settings ->
    // The notificationCount property is generated from the proto schema.
    settings.notificationCount
  }
```

### 向 Proto DataStore 写入数据

Proto DataStore 提供了一个 [`updateData()`](https://developer.android.com/reference/kotlin/androidx/datastore/core/DataStore?hl=zh-cn#updatedata) 函数，用于以事务方式更新存储的对象。`updateData()` 为您提供数据的当前状态，作为数据类型的一个实例，并在原子读-写-修改操作中以事务方式更新数据。

```kotlin
suspend fun incrementCounter() {
  context.settingsDataStore.updateData { currentSettings ->
    currentSettings.toBuilder()
      .setNotificationCount(currentSettings.notificationCount + 1)
      .build()
    }
}
```

## 在同步代码中使用 DataStore

**注意**：请尽可能避免在进行 DataStore 数据读取时阻塞线程。阻塞界面线程可能会导致 [ANR](https://developer.android.google.cn/topic/performance/vitals/anr?hl=zh-cn) 或界面卡顿，而阻塞其他线程可能会导致[死锁](https://en.wikipedia.org/wiki/Deadlock)。

DataStore 的主要优势之一是异步 API，但可能不一定始终能将周围的代码更改为异步代码。如果您使用的现有代码库采用同步磁盘 I/O，或者您的依赖项不提供异步 API，可能就会如此。

Kotlin 协程提供 [`runBlocking()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html) 协程构建器，以帮助消除同步与异步代码之间的差异。您可以使用 `runBlocking()` 从 DataStore 同步读取数据。RxJava 提供了针对 `Flowable` 的阻塞方法。以下代码会阻塞发起调用的线程，直到 DataStore 返回数据：

```kotlin
val exampleData = runBlocking { context.dataStore.data.first() }
```

对界面线程执行同步 I/O 操作可能会导致 ANR 或界面卡顿。您可以通过从 DataStore 异步预加载数据来减少这些问题：

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    lifecycleScope.launch {
        context.dataStore.data.first()
        // You should also handle IOExceptions here.
    }
}
```

这样，DataStore 可以异步读取数据并将其缓存在内存中。以后使用 `runBlocking()` 进行同步读取的速度可能会更快，如果初始读取操作已经完成，或许还可以完全避免磁盘 I/O 操作。

## Json DataStore (Without Protobuf)

### 1. 导入依赖

`libs.versions.toml` :

```toml
[versions]
kotlin = "2.1.0"
datastore = "1.1.3"
kotlinxSerializationJson = "1.8.0"


[libraries]
androidx-datastore = { group = "androidx.datastore", name = "datastore", version.ref = "datastore" }
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinxSerializationJson" }


[plugins]
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

模块的 `build.gradle.kts` :

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlin.serialization)
}

// ...

dependencies {
    // ...
    implementation(libs.androidx.datastore)
    implementation(libs.kotlinx.serialization.json)
}
```

### 2. 定义架构

```kotlin
@Serializable
data class Settings(
    val theme: Theme = Theme.SYSTEM,
    val isDebugMode: Boolean = false,
    val count: Int = 0,
)

enum class Theme { SYSTEM, LIGHT, DARK }
```

### 3. 创建 Json DataStore

```kotlin
object SettingsSerializer : Serializer<Settings> {
    override val defaultValue: Settings = Settings()

    override suspend fun readFrom(input: InputStream): Settings {
        return try {
            Json.decodeFromString(
                deserializer = Settings.serializer(),
                string = input.readBytes().decodeToString()
            )
        } catch (exception: SerializationException) {
            exception.printStackTrace()
            defaultValue
        }
    }

    override suspend fun writeTo(t: Settings, output: OutputStream) {
        output.write(
            Json.encodeToString(
                serializer = Settings.serializer(),
                value = t
            ).encodeToByteArray()
        )
    }
}

val Context.settingsDataStore: DataStore<Settings> by dataStore(
    fileName = "settings.json", serializer = SettingsSerializer
)
```

### 4. 使用

```kotlin
Column(modifier = modifier.verticalScroll(rememberScrollState()).fillMaxSize()){
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val settings by context.settingsDataStore.data.collectAsStateWithLifecycle(
        initialValue = Settings()
    )

    Text(text = if (settings.isDebugMode) "DebugMode" else "ReleaseMode")
    Button(
        onClick = {
            scope.launch {
                context.settingsDataStore.updateData {
                    it.copy(isDebugMode = !it.isDebugMode)
                }
            }
        }
    ) {
        Text(text = "Toggle Mode")
    }

    Text(text = "the count is ${settings.count}")
    Button(
        onClick = {
            scope.launch {
                context.settingsDataStore.updateData {
                    it.copy(count = it.count + 1)
                }
            }
        }
    ) {
        Text(text = "+1")
    }
}
```

来源：

[DataStore](https://developer.android.google.cn/topic/libraries/architecture/datastore?hl=zh-cn)  
[Type-Safe Preferences With Proto DataStore (without Protobuf Files!) - Full Guide](https://www.youtube.com/watch?v=yMGAbm84iIY)  
[ProtoDataStoreGuide](https://github.com/philipplackner/ProtoDataStoreGuide)  
[Android开发拾遗：DataStore与JSON结合](https://github.com/Eliot00/elliot00.com/blob/master/posts/android-json-data-store.md)
