# Dagger组件依赖

## 1. 创建 `Scope`

UserScope.kt：

```kotlin
@Scope
@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
annotation class UserScope 
```

## 2. 创建组件 `UserCompentent`

- 使用第一步的 `@UserScope` 注解
- 组件依赖在 `dependencies` 里写上当前组件所依赖的组件
- 添加 `fun inject(mainActivity: MainActivity)`

UserCompentent.kt：

```kotlin
@UserScope
@Component(modules = [UserModule::class], dependencies = [ApplicationComponent::class])
interface UserComponent {

    fun inject(mainActivity: MainActivity)
}
```

## 3. 修改 `ApplicationComponent`

- 注释掉 `fun inject(mainActivity: MainActivity)`
- 声明出要使用的依赖对象（必须已经在 `NetModule 里提供了依赖`）

ApplicationComponent.kt：

```kotlin
// 您通常会创建一个位于应用类中的 Dagger 图。把ApplicationComponent当作IOC容器，
@MyScope
@Component(modules = [NetModule::class])
interface ApplicationComponent {
    // This tells Dagger that LoginActivity requests injection so the graph needs
    // to satisfy all the dependencies of the fields that LoginActivity is requesting.
    // 2. 告知 Dagger 要求注入依赖项的对象
//    fun inject(mainActivity: MainActivity)

    // 声明出要使用的依赖对象
    fun retrofit():Retrofit

    fun okHttpClient(): OkHttpClient

    fun apiService():ApiService

    fun context():Context

}
```

## 4. 修改 `MyApplication`

改为下述代码：

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        applicationComponent = DaggerApplicationComponent
            .builder()
            .netModule(NetModule(this))
            .build()
    }

    companion object {
        lateinit var applicationComponent: ApplicationComponent
            private set
    }
}
```

## 5. 修改 `MainActivity`

```kotlin
class MainActivity : ComponentActivity() {
    // 3. 注入到user
    @Inject lateinit var user1:User
    @Inject lateinit var user2:User
    @Inject lateinit var apiService1:ApiService
    @Inject lateinit var apiService2:ApiService
    @Inject lateinit var context:Context
    // 声明UserComponent
    lateinit var userComponent:UserComponent
    override fun onCreate(savedInstanceState: Bundle?) {
//        DaggerApplicationComponent.create().inject(this)
        // 执行注入动作
//        val a= (application as MyApplication).appComponent.apply { inject(this@MainActivity) }
//        DaggerUserComponent.builder().applicationComponent(a) .build() .inject(this)
//        val appComponent = (application as MyApplication).appComponent
        val appComponent = MyApplication.applicationComponent
        // 初始化UserComponent
        userComponent=DaggerUserComponent
            .builder()
            .applicationComponent(appComponent)
            .build()
            .apply {
                inject(this@MainActivity)
            }
        super.onCreate(savedInstanceState)
        Log.i("DI", "onCreate: $user1")
        Log.i("DI", "onCreate: $user2")
        Log.i("DI", "onCreate: $apiService1")
        Log.i("DI", "onCreate: $apiService2")
        Log.i("DI", "onCreate: $context")
    }
}
```

另注NetModule如下：

```kotlin
// dagger模块
@Module
class NetModule(private val application: MyApplication) {

    @Provides
    fun provideContext():Context = application.applicationContext

    // 使用@Provides告知dagger: OkHttpClient如何提供返回值类型的实例
    // 第三方库，例如使用构建器模式的第三方库
    @MyScope
    @Provides
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    // 第三方库
    @MyScope
    @Provides
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit =
        Retrofit.Builder().client(okHttpClient).baseUrl("https://www.baidu.com").build()

    // 接口（ApiService是一个接口）
    // @Singleton是Dagger提供的一种作用域实现
    // 作用域用来管理Component的对象实例的生命周期
    @MyScope
    @Provides
    fun provideApiService(retrofit: Retrofit): ApiService = retrofit.create(ApiService::class.java)
}
```

另注MyScope如下：

```kotlin
@Scope
@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
annotation class MyScope
```
