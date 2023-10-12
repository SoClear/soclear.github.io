# 引用

```kotlin
class A {
    val a1 =1
    fun fn() {
        println("a")
    }
}

fun test(cb: (A) -> Unit) {

}

fun main(args: Array<String>) {
    // kFunction1 的类型是 KFunction1<A, Unit>
    // 也就是说 kFunction1 是 KFunction1<A, Unit> 类型的一个值
    // 也就是说 kFunction1 是 (A) -> Unit 类型的一个值
    // A是它的参数，Unit是它的返回值
    val kFunction1 = A::fn
    // 传入A类的对象，并调用
    kFunction1(A())
    // test函数需要一个A为参数，Unit为返回至的函数类型的值
    test(kFunction1)


    // 属性引用，其实引用的是它的getter
    val kProperty1 = A::a1
    // 获取属性a1的名字（字符串）
    println(kProperty1.name)
    // 两种获取其值的方式
    println(kProperty1(A()))
    println(kProperty1.get(A()))


    // 获得A类的构造函数的引用
    val kFunction0 = ::A
    // 通过kFunction0()调用A类的构造函数，返回的当然是A类的对象
    println(kFunction0().a1)


    // 类引用
    //  类型是 KClass<A>
    val kClass = A::class
    //  类型是 Class<A>
    val javaClass = A::class.java
}
```
