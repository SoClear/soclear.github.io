# lambda

lambda表达式返回最后一行的值

```kotlin
// lambda
// 声明lambda函数k的类型为(e:Int) -> Int
// e为参数名，可以省略
val k: (e: Int) -> Int
// 为k赋值，也即实现lambda函数k
k = {
    // lambda函数的参数只有一个时，在实现中可以用it代替
    it + 1
}
// 因为k声明为 val ，所以k不能再被赋值了，下行报错
//    k = {
//        it + 2
//    }
```

```kotlin
// 第一步简化：声明类型的同时并赋值
val k: (e: Int) -> Int = {
        // lambda函数的参数只有一个时，在实现中可以用it代替
        it + 1
    }
```

```kotlin
// 第二步简化：省略了参数名，在圆括号内只写类型
val k: (Int) -> Int = {
        // lambda函数的参数只有一个时，在实现中可以用it代替
        it + 1
    }
```

```kotlin
// 第三步简化：不写lambda表达式的类型，即不写冒号及其后的类型，让编译器自动推断
// 此时需要写参数名及类型
val k = { e: Int ->
        e + 1
    }
```
