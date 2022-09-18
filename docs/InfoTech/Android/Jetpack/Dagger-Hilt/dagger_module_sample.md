# 使用Module提供对象实例

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
