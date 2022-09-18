# 使用Module提供对象实例


## 新建模块

```kotlin
// dagger模块
@Module
class NetModule {
    // 使用@Provides告知dagger如何提供返回值类型的实例

    // 第三方库，例如使用构建器模式的第三方库
    @Provides
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    // 第三方库
    @Provides
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit =
        Retrofit.Builder().client(okHttpClient).build()

    // 接口（ApiService是一个接口）
    @Provides
    fun provideApiService(retrofit: Retrofit): ApiService = retrofit.create(ApiService::class.java)
}
```

## 把模块添加进 Dagger 图

`@Component(modules = [NetModule::class])`

```kotlin
// 您通常会创建一个位于应用类中的 Dagger 图。把ApplicationComponent当作IOC容器，
@Component(modules = [NetModule::class])
interface ApplicationComponent {
    // This tells Dagger that LoginActivity requests injection so the graph needs
    // to satisfy all the dependencies of the fields that LoginActivity is requesting.
    // 2. 告知 Dagger 要求注入依赖项的对象
    fun inject(activity: MainActivity)
}
```
