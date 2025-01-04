# Intersection Types

Kotlin 并不支持交叉类型，但是有旁门左道实现类似效果：

```kotlin
interface Named {
    val name: String
}

interface Addressable {
    val url: String
}

fun processAny(item: Any) {
    if (item is Named && item is Addressable) {
        println(item.name)
        println(item.url)
    }
}

fun <T> processWhereT(item: T) where T : Named, T : Addressable {
    println(item.name)
    println(item.url)
}
```

`processAny()` 函数和 `processWhereT()` 函数都是可以处理 `Named` 和 `Addressable` 类型的，但是 `processWhereT()` 函数比 `processAny()` 函数限制了类型，更为可取。

当然最常见的方式是新建一个接口继承 `Named` 和 `Addressable` 接口：`interface NamedAndAddressable : Addressable, Named`
