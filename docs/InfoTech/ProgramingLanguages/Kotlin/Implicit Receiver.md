# Implicit Receiver

## 双重 this

内部类和外部类的双重 this :

java:

```java
public class OuterClass {
    int outerInt =1;
    int commonInt = 3;

    class InnerClass {
        int innerInt = 2;
        int commonInt = 4;

        public void   innerMethod() {
            System.out.println(innerInt);
            System.out.println(outerInt);
            // 内部类的this
            System.out.println(commonInt);
            // 外部类的this
            System.out.println(OuterClass.this.commonInt);
        }
    }
}
```

kotlin:

```kotlin
class OuterClass {
    var outerInt =1;
    var commonInt = 3;

    inner class InnerClass {
        var innerInt = 2;
        var commonInt = 4;

        fun innerMethod() {
            println(innerInt);
            println(outerInt);
            // 内部类的this
            println(commonInt);
            // 外部类的this
            println(this@OuterClass.commonInt);
        }
    }
}
```

## Kotlin 中的 Implicit Receiver

multiply() 是 Int类型的扩展函数，所以需要对 Int 类型的对象才能调用它

同时 multiply() 也是 IntMultiplier 的成员函数，所以要求 IntMultiplier 对象调用它

也就是说，这里需要的是双重 receiver ，既要直接的Int,又要外部的 IntMultiplier ，缺一不可

```kotlin
class IntMultiplier(var time: Int =2) {
    fun Int.multiply()= time * this
}

fun main() {
    // 报错
    1.multiply()
    val intMultiplier = IntMultiplier()
    // 报错
    intMultiplier.multiply()
}
```

那我怎样调用 `multiply()` 函数？

专门创建一个函数，并给它设置一个函数类型的参数，并给这个函数类型的参数设置 receiver 类型，在函数体内调用这个函数参数

```kotlin
class IntMultiplier(var time: Int =2) {
    fun Int.multiply()= time * this

    fun runAsOuter(block: IntMultiplier.()-> Unit){
        block()
    }
}

fun main() {
    val intMultiplier = IntMultiplier()
    // runAsOuter 的大括号里就有了一个 IntMultiplier 的 this 了
    intMultiplier.runAsOuter {  // this: IntMultiplier
        3.multiply()
    }
}
```

甚至你可以这样

```kotlin
class IntMultiplier(var time: Int =2) {
    fun Int.multiply()= time * this

    fun runAsOuter(block: IntMultiplier.()-> Unit){
        block()
    }
}

fun Int.runAsOuter(block: Int.()-> Unit){
    block()
}

fun main() {
    val intMultiplier = IntMultiplier()
    // runAsOuter 的大括号里就有了一个 IntMultiplier 的 this 了
    intMultiplier.runAsOuter {  // this: IntMultiplier
        3.runAsOuter {
            multiply()
        }
    }
}
```

这样

```kotlin
class IntMultiplier(var time: Int = 2) {
    fun Int.multiply() = time * this

    fun runAsOuter(block: IntMultiplier.() -> Unit) {
        block()
    }
}

fun runAsInt(int: Int, block: Int.() -> Unit) {
    int.block()
}

fun main() {
    val intMultiplier = IntMultiplier()
    intMultiplier.runAsOuter {  // this: IntMultiplier
        runAsInt(3) {
            multiply()
        }
    }
}
```
