# 作用域

- 使用作用域注解，可以将某个对象的生命周期限定为其组件的生命周期。  
    这样也就意味着，在作用域范围内，使用同一实例。
- `@Singleton`是Dagger提供的一种默认的作用域注解，其意义表示一个单例对象。  
    也就是实例的生命周期和程序运行的生命周期保持一致。
- 使用`@Scope`实现自定义作用域注解。
- 作用域注解使用在`@Inject`、`@Provides`、`@Binds`、`@Module`、`@Component`注解上，表示其产生作用的范围。

## 简单示例

### 1. 将对象实例作用域更为 Singleton

```kotlin
// dagger模块
@Module
class NetModule {
    // 使用@Provides告知dagger如何提供返回值类型的实例

    // 第三方库，例如使用构建器模式的第三方库
    @Singleton
    @Provides
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    // 第三方库
    @Singleton
    @Provides
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit =
        Retrofit.Builder().client(okHttpClient).build()

    // 接口（ApiService是一个接口）
    // @Singleton是Dagger提供的一种作用域实现
    // 作用域用来管理Component的对象实例的生命周期
    @Singleton
    @Provides
    fun provideApiService(retrofit: Retrofit): ApiService = retrofit.create(ApiService::class.java)
}
```

### 2. 将Module对应的Component的作用域改为 Singleton

```kotlin
// 您通常会创建一个位于应用类中的 Dagger 图。把ApplicationComponent当作IOC容器，
@Singleton
@Component(modules = [NetModule::class])
interface ApplicationComponent {
    // This tells Dagger that LoginActivity requests injection so the graph needs
    // to satisfy all the dependencies of the fields that LoginActivity is requesting.
    // 2. 告知 Dagger 要求注入依赖项的对象
    fun inject(activity: MainActivity)
}
```
