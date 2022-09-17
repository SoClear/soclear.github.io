# 使用Dagger依赖注入简单示例

## 1. 添加依赖项

如需在项目中使用 Dagger，请在 `build.gradle` 文件中向应用添加以下依赖项。  
您可以[在此 GitHub 项目中](https://github.com/google/dagger/releases)找到最新版本的 Dagger。

```groovy
plugins {
  id 'kotlin-kapt'
}

dependencies {
    implementation 'com.google.dagger:dagger:2.x'
    kapt 'com.google.dagger:dagger-compiler:2.x'
}
```

## 2. 创建一个位于应用类中的 Dagger 图

```kotlin
// Definition of the Application graph
@Component
interface ApplicationComponent { ... }
```

## 3. 自定义 Application 类

由于生成 Dagger 图的接口（ `ApplicationComponent` ）带有 `@Component` 注解，
因此您可以将其命名为 `ApplicationComponent` 或 `ApplicationGraph`。  
您通常会将该组件的实例保留在自定义 `Application` 类中，并在每次需要应用图时调用该实例。

**首先 rebuild 项目** ，然后会自动生成 `DaggerApplicationComponent`类。

接下来，编写自定义 `Application` 类：

```kotlin
// appComponent lives in the Application class to share its lifecycle
class MyApplication: Application() {
    // Reference to the application graph that is used across the whole app
    val appComponent = DaggerApplicationComponent.create()
}
```

然后修改 manifests文件下的 `<application>` ：

```xml
<application
        android:name="你自定义的Application类的路径"
        ...>
        ...
<application>
```

## 4. 告知 Dagger 要求注入依赖项的对象

您需要告知 Dagger 要求注入依赖项的对象（在本例中为 MainActivity）。  
为此，您应提供一个函数，让该函数将请求注入的对象作为参数。

修改 `ApplicationComponent` 接口：

```kotlin
@Component
interface ApplicationComponent {
    // This tells Dagger that MainActivity requests injection so the graph needs
    // to satisfy all the dependencies of the fields that MainActivity is requesting.
    fun inject(activity: MainActivity)
}
```

此函数会告知 Dagger `MainActivity` 希望访问该图并请求注入。  
Dagger 需要满足 `MainActivity` 所需的所有依赖项。  
接口中的函数可以具有任何名称，但在它们以参数形式接收要注入的对象时将其称为 `inject()` 是 Dagger 中的一种惯例。

## 5. 告知 Dagger 如何提供依赖项

```kotlin
// 使用@Inject注解在构造方法上:就是告知Dagger可以通过构造方法来创建并获取到user的实例
class User @Inject constructor(private val userInfo: UserInfo) {
    fun getName() = userInfo.name
}

class UserInfo @Inject constructor() {
    val name: String = "hello di"
}
```

## 6. 注入 activity

1. 使用 `@Inject lateinit var` 声明要注入的字段，注入的字段不能为私有字段，这些字段的公开范围必须至少为软件包私有。

2. 在调用 `super.onCreate()` 之前在 activity 的 `onCreate()` 方法中注入 Dagger，
    即：`(application as MyApplication).appComponent.inject(this)`
    以避免出现 fragment 恢复问题。

```kotlin
class MainActivity : ComponentActivity() {
    // 字段注入，到user
    @Inject lateinit var user:User
    override fun onCreate(savedInstanceState: Bundle?) {
        // 执行注入动作
        (application as MyApplication).appComponent.inject(this)
        super.onCreate(savedInstanceState)
        // 验证是否注入成功
        Log.i("DI", "onCreate: ${user.getName()}")
        ...
```
