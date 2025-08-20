# 杂记

## invoke方法

```kotlin
fun main() {
    A()()()()()()()()()()()()()()()()()()()()()()()()()()()()()
    val a = A()
    // 等价于a.invoke()
    a()
}

class A {
    operator fun invoke(): A {
        println("A")
        return A()
    }
}
```

## 柯里化

```kotlin
fun main() {
    ::log.curried()("myTag")(System.out)("this is a message")
    // 引用
    ::add
    // 函数后面的括号是调用，add(1)的值是函数引用
    val add1 = add(1)
    val sum = add(1)(2)(3)
    println(sum)
}

fun log(tag: String, target: OutputStream, message: Any?) {
    target.write("[$tag] $message\n".toByteArray())

}


fun <P1, P2, P3, R> Function3<P1, P2, P3, R>.curried() =
    fun(p1: P1) = fun(p2: P2) = fun(p3: P3) = this(p1, p2, p3)



fun add(x: Int): (y: Int) -> (z: Int) -> Int = { y: Int ->
    { z: Int ->
        x + y + z
    }
}
```

## 深递归

```kotlin
fun main() {
    class Tree(val left: Tree? = null, val right: Tree? = null)

    val deepTree = generateSequence(Tree()) { Tree(it) }.take(100_000).last()

//    fun depth(t: Tree?): Int = if (t == null) 0 else max(depth(t.left), depth(t.right)) + 1
//    println(depth(deepTree))

    val depth = DeepRecursiveFunction<Tree?, Int> { t ->
        if (t == null) 0 else max(callRecursive(t.left), callRecursive(t.right)) + 1
    }
    
    println(depth(deepTree)) // Ok
}
```

## 函数内写类

```kotlin
fun main() {
    realFun()
}

fun realFun(){
    class Hello{
        init {
            println("hello")
        }
    }

    Hello()

    open class Person(val name:String)

    val tom = object: Person("Tom") {
        val age : Int = 3
    }

    println(tom.name)
    println(tom.age)

}
```

## 接口与实现与代理

```kotlin
package c

fun main() {
    val a = A()
}


class A : IB by BImpl(), IC by CImpl(), ID by DImpl

class B : IBC by BCImpl

class C(ic: IC): IC by ic

interface IB {
    fun sayHello()
}

class BImpl : IB {
    override fun sayHello() {
        println("hello")
    }
}

interface IC {
    fun sayHalo()
}

class CImpl : IC {
    override fun sayHalo() {
        println("halo")
    }
}


private interface IBC : IB, IC

object BCImpl : IBC {
    override fun sayHello() {
        println("1")
    }

    override fun sayHalo() {
        println("2")
    }
}


interface ID {
    val a: String

    fun eat() {
        println("eat")
    }
}

object DImpl : ID {
    override val a: String
        get() = "hello"
}
```

## kotlinx-io

引入

```toml
kotlinx-io = { group = "org.jetbrains.kotlinx", name = "kotlinx-io-core", version.ref = "kotlinx-io" }
```

使用

```kotlin
// 读取
val string = SystemFileSystem.source(Path("index.html")).buffered().use { it.readString() }
// 写入
SystemFileSystem.sink(Path("log.txt")).buffered().use { it.writeString("some string") }
```

## kotlinx-coroutines

引入

```toml
kotlinx-coroutines-core = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-core", version.ref = "coroutines" }
```

使用

```kotlin
coroutineScope {
    launch {
        // ...
    }
}
```

## ktor

引入

```toml
ktor-client-core = { group = "io.ktor", name = "ktor-client-core", version.ref = "ktor" }
ktor-client-cio = { group = "io.ktor", name = "ktor-client-cio", version.ref = "ktor" }
ktor-client-serialization = { group = "io.ktor", name = "ktor-client-serialization", version.ref = "ktor" }
ktor-client-content-negotiation = { group = "io.ktor", name = "ktor-client-content-negotiation", version.ref = "ktor" }
ktor-serialization-kotlinx-json = { group = "io.ktor", name = "ktor-serialization-kotlinx-json", version.ref = "ktor" }
```

## kotlinx-serialization

引入

toml:

```toml
[versions]
kotlin = "2.1.0"
kotlinxSerializationJson = "1.8.0"

[libraries]
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinxSerializationJson" }

[plugins]
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

build.gradle.kts:

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlin.serialization)
}
// ...
dependencies {
    implementation(libs.kotlinx.serialization.json)
}
```

## Kotlin-jvm 调用命令行

```kotlin
data class CommandResult(val output: String, val error: String)

fun runCommand(
    command: List<String>,
    workingDir: File = File("."),
    timeoutAmount: Long? = null,
    timeoutUnit: TimeUnit = TimeUnit.SECONDS,
    charset: Charset = Charsets.UTF_8
): CommandResult = ProcessBuilder(command)
    .directory(workingDir)
    .redirectOutput(ProcessBuilder.Redirect.PIPE)
    .redirectError(ProcessBuilder.Redirect.PIPE)
    .start()
    .run {
        if (timeoutAmount != null) {
            waitFor(timeoutAmount, timeoutUnit)
        }
        CommandResult(
            inputStream.bufferedReader(charset).readText(),
            errorStream.bufferedReader(charset).readText()
        )
    }

fun runCommand(
    vararg command: String,
    workingDir: File = File("."),
    timeoutAmount: Long? = null,
    timeoutUnit: TimeUnit = TimeUnit.SECONDS,
    charset: Charset = Charsets.UTF_8
): CommandResult = runCommand(
    command.toList(),
    workingDir,
    timeoutAmount,
    timeoutUnit,
    charset
)
```

## 静态代码检查

[Konsist](https://github.com/LemonAppDev/konsist)

[ktlint](https://github.com/pinterest/ktlint)

[detekt](https://github.com/detekt/detekt)

## runCatching

```kotlin
val result= runCatching {
    File("a.txt")
}

result.isFailure
result.isSuccess
result.getOrNull()
result.onSuccess { println(it.name) }
result.onFailure { println(it.message) }
```

## 匿名函数不是 lambda 表达式

有些语言的匿名函数是 lambda 表达式，但是 Kotlin 的匿名函数不是 lambda 表达式。

匿名函数的特点

像命名函数：

- 语法
- return
- 返回值类型

又像 lambda 表达式：

- 是表达式
- 参数类型

```kotlin
// currying
fun greet(greeting: String) = fun(name: String) {
    println("$greeting, $name")
}

// currying，等价于 greet 函数，
fun greetLambda(greeting: String) = { name: String ->
    println("$greeting, $name")
}

fun processList(process: (String)-> Unit) {
    println("start")
    listOf("hello", "world!", "from", "kotlin").forEach (process)
    println("end")
}

fun main() {
    greet("Hello")("Dave")

    val goodbye = greet("Goodbye")
    goodbye("Dave")


    processList { line:String ->
        if (line.endsWith("!")){
            // 非内联 lambda 中的返回必须加标签
            return@processList
        }
        println(line)
    }

    processList(fun (line:String){
        if (line.endsWith("!")){
            // 可以直接return
            return
        }
        println(line)
    })
}
```

## 扩展函数

```kotlin
fun String.method1(i: Int) {
    println(this)
}

fun method2(s: String, i: Int) {
    println(s)
}

fun main() {
    val a: String.(Int) -> Unit = String::method1
    val b: (String, Int) -> Unit = String::method1
    val c: (String, Int) -> Unit = a
    val d: String.(Int) -> Unit = b

    val e: (String, Int) -> Unit = ::method2
    val f: String.(Int) -> Unit = ::method2

    "hello".method1(1) // 原本可以调用
    "hello".b(2) // 报错，不允许这样调用
}
```

## Nothing

### throw

首先讲一个知识，Kotlin 规定抛出异常就可以忽略返回值（不返回值），这不是 `Nothing` 的规定，是 Kotlin 语言的规定，如

```kotlin
fun hello(name: String?): String {
    val validName = name ?: throw Exception("name is null")
    return "Hello $validName"
}
```

`Nothing` 的源码：`public actual class Nothing private constructor()`

`Nothing` 是一个 **类** ，是所有 **类** 的  **子类型** ，但却不是 **子类** 。关于类与类型的区别见 [类与类型](../../Concepts/misc.md#类与类型)

`Nothing` 的构造方法是私有的，所以不能通过正常手段创建任何它的实例对象。

另外 `throw` 关键字在 Kotlin 下层逻辑里实际是有返回值，它的返回值类型是 `Nothing`

那看这句代码 `val validName = name ?: throw Exception("name is null")` ， 因为 `Nothing` 类是 `String?` 的子类型，
所以 `throw Exception("name is null")` 可以被赋值给 `validName`。

抛出异常会跳出函数，结束函数的执行，
所以 `hello` 函数返回值类型即使不是 `String` 也可以用 `throw` 。

因为 `throw` 的是 `Nothing` 类的实例对象，
所以返回给 `hello` 函数的是 `Nothing` 类的实例对象，它又是所有类的子类型，这样就连 `throw` 也符合类型安全。

`throw` 不会真正地返回，但在语法层面说得通了

所以，在 Kotlin 里可以这样写：

```kotlin
val nothing1: Nothing = throw RuntimeException("抛异常")
val nothing2: String = throw RuntimeException("抛异常")
```

这样写

```kotlin
fun hello(name: String?): String {
    val validName = name ?: throw Exception("name is null")
    return "Hello $validName"
}
```

这样写

`TODO()` 源码：

```kotlin
public inline fun TODO(): Nothing = throw NotImplementedError()
```

使用：

```kotlin
fun getName():String {
    TODO()
}
```

### return

`return` 也是被规定为返回 `Nothing` 类型的实例对象，所以：

```kotlin
fun sayMyName(first:String, second:String) {
    val name = if (first == "Walter" && second == "White") {
        "Heisenberg"
    }  else {
        // 语法层面的返回值类型为 Nothing ，赋值给 name
        return
    }
    println(name)
}
```
