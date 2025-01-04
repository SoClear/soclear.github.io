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
val string = SystemFileSystem.source(Path("./h.html")).buffered().use { it.readString() }
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
jetbrains-kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinxSerializationJson" }
```

build.gradle.kts:

```kotlin
plugins {
    // ...
    alias(libs.plugins.jetbrains.kotlin.plugin.serialization)
}
// ...
dependencies {
    implementation(libs.jetbrains.kotlinx.serialization.json)
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
