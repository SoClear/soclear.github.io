# 回调转 Coroutine 或者 Flow

## 回调转 Coroutine

Kotlin提供了非常易用的协程API，但是在开发过程中遇到第三方SDK通过Java暴露出来的接口全是通过回调处理数据的情况。接口使用流程大致是：

```kotlin
val listener = object : ISomeInfoListener {
    override fun onInfoUpdate(info: Info) {
    }
}

SDK.getInstance().registerListener(listener)

SDK.getInstance().unregisterListener(listener)
```

当多个操作/数据之间存在先后依赖关系时，就容易陷入回调地狱，写起来非常不舒服。

比如想在导航结束后，收集终点信息，存入数据库，使用回调的形式写：

```kotlin
val listener = object : IGuidanceListener {
    override fun onCompleted() {
        val destinationInfoListener = object : IDestinationInfoListener {
            override fun onArrived(info: Info) {
                scope.launch {
                    saveToDb(info)
                }
            }
        }
        SDK.getInstance().registerListener(destinationInfoListener)
    }
}

SDK.getInstance().registerListener(listener)
```

以上还是高度简化后的代码，实际场景下流程更复杂，代码可读性很低，修改起来也很麻烦。那么有没有办法把一个回调操作封装成 `suspend` ，以同步方式来组织呢？

可以使用 `suspendCancellableCoroutine` 来做。例如上面的操作，可以转化为：

```kotlin
suspend fun getSomeInfo(): Info = suspendCancellableCoroutine { continuation ->
    val listener = object : ISomeInfoListener {
        override fun onInfoUpdate(info: Info) {
            continuation.resume(info)
        }
    }

    SDK.getInstance().registerListener(listener)

    continuation.invokeOnCancellation { SDK.getInstance().unregisterListener(listener) }
}
```

在我使用的 Kotlin 2.1.0 版本中， `continuation.resume` 的函数签名发生了一点变化：

```kotlin
continuation.resume(resourceToResumeWith) { cause, resourceToClose, context ->
    // resourceToResumeWith 和 resourceToClose 實際上是同一個值
    resourceToClose.close()
}
```

需要传入一个 `onCancellation` 的回调，如果 `resume` 了一个需要关闭的 `Resource` ，可以用这个回调来处理。

## 回调转 Flow

例如：

```kotlin
// 创建监听器
val listener = OnSharedPreferenceChangeListener { sp, key ->
    // ...
}

// 注册监听器
sp.registerOnSharedPreferenceChangeListener(listener)

// 移除监听器
sp.unregisterOnSharedPreferenceChangeListener
```

可以转化为：

```kotlin
// ViewModel 里的 stateIn() 的 started 参数要选 SharingStarted.Lazily，即不停止
val settingFlow: Flow<Setting> = callbackFlow<String> {
    // 创建监听器
    val listener = OnSharedPreferenceChangeListener { _, key ->
        if (key != null) {
            trySend(key)
        }
    }

    // 注册监听器
    sp.registerOnSharedPreferenceChangeListener(listener)

    // 当流被取消收集时，移除监听器
    awaitClose {
        sp.unregisterOnSharedPreferenceChangeListener(listener)
    }
}.scan(initial = initialSetting) { previousSetting, key ->
    previousSetting.copy(key)
}

private fun Setting.copy(key: String): Setting = when (key) {
    // ...
}
```
