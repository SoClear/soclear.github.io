# inline noinline crossinline

## inline

`inline` 的作用是把函数体直接复制到调用处，而不是生成一个函数调用。这样相比普通函数，`inline` 函数少了一层调用栈，可以省去函数调用的开销，但同时会增加代码体积。

使用 **高阶函数** 会带来一定的运行时损失：每个函数都是一个对象，并且它捕获一个闭包。闭包是可以在函数体中访问的变量范围。内存分配（函数对象和类）和虚拟调用会引入运行时开销。

```kotlin
fun f1(p1: () -> Unit) {
    println("start")
    p1()
    println("end")
}

fun main() {
    f1 { 
        println("Hello World")
    }
}
```

在 IntelliJ IDEA 中，点击顶部的 `Tool -> Kotlin -> Show Kotlin Bytecode` 可以查看编译后的 Kotlin 字节码。再点击顶部的 `Decompile` 可以查看反编译后的 Java 字节码：

```java
import kotlin.Metadata;
import kotlin.Unit;
import kotlin.jvm.functions.Function0;
import kotlin.jvm.internal.Intrinsics;
import org.jetbrains.annotations.NotNull;

@Metadata(
   mv = {2, 0, 0},
   k = 2,
   xi = 48,
   d1 = {"\u0000\u0010\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\u001a\u0014\u0010\u0000\u001a\u00020\u00012\f\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00010\u0003\u001a\u0006\u0010\u0004\u001a\u00020\u0001¨\u0006\u0005"},
   d2 = {"f1", "", "p1", "Lkotlin/Function0;", "main", "test"}
)
public final class MainKt {
   public static final void f1(@NotNull Function0 p1) {
      Intrinsics.checkNotNullParameter(p1, "p1");
      String var1 = "start";
      System.out.println(var1);
      p1.invoke();
      var1 = "end";
      System.out.println(var1);
   }

   public static final void main() {
      f1(MainKt::main$lambda$0);
   }

   // $FF: synthetic method
   public static void main(String[] args) {
      main();
   }

   private static final Unit main$lambda$0() {
      String var0 = "Hello World";
      System.out.println(var0);
      return Unit.INSTANCE;
   }
}
```

从中可以看到，生成了一个 `Function0` 类的实例对象 `p1`，并在 `f1` 函数中调用 `p1.invoke()`。

查看 `Function0` 源码如下：

```kotlin
/** A function that takes 0 arguments. */
public interface Function0<out R> : Function<R> {
    /** Invokes the function. */
    public operator fun invoke(): R
}
/** A function that takes 1 argument. */
public interface Function1<in P1, out R> : Function<R> {
    /** Invokes the function with the specified argument. */
    public operator fun invoke(p1: P1): R
}
/** A function that takes 2 arguments. */
public interface Function2<in P1, in P2, out R> : Function<R> {
    /** Invokes the function with the specified arguments. */
    public operator fun invoke(p1: P1, p2: P2): R
}
```

这说明该 lambda 表达式实际上是生成了一个实现了 `Function0` 接口的对象，lambda 表达式的内容封装在 `invoke()` 方法中。

在 `JVM` 中，创建对象是创建在堆上的，相比创建在栈上开销较高。可以通过内联 lambda 表达式来消除这种开销。

下面显示的函数是这种情况的一个很好的例子。该函数在 ***使用处*** 内联。

Kotlin 源码：

```kotlin
inline fun f1(p1: () -> Unit) {
    println("start")
    p1()
    println("end")
}

fun main() {
    f1 {
        println("Hello World")
    }
}
```

反编译后的 Java 源码：

```java
import kotlin.Metadata;
import kotlin.jvm.functions.Function0;
import kotlin.jvm.internal.Intrinsics;
import kotlin.jvm.internal.SourceDebugExtension;
import org.jetbrains.annotations.NotNull;

@Metadata(
   mv = {2, 0, 0},
   k = 2,
   xi = 48,
   d1 = {"\u0000\u0010\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\u001a\u001a\u0010\u0000\u001a\u00020\u00012\f\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00010\u0003H\u0086\bø\u0001\u0000\u001a\u0006\u0010\u0004\u001a\u00020\u0001\u0082\u0002\u0007\n\u0005\b\u009920\u0001¨\u0006\u0005"},
   d2 = {"f1", "", "p1", "Lkotlin/Function0;", "main", "test"}
)
@SourceDebugExtension({"SMAP\nMain.kt\nKotlin\n*S Kotlin\n*F\n+ 1 Main.kt\ncool/cmg/MainKt\n*L\n1#1,14:1\n5#1,4:15\n*S KotlinDebug\n*F\n+ 1 Main.kt\ncool/cmg/MainKt\n*L\n11#1:15,4\n*E\n"})
public final class MainKt {
   public static final void f1(@NotNull Function0 p1) {
      Intrinsics.checkNotNullParameter(p1, "p1");
      int $i$f$f1 = 0;
      String var2 = "start";
      System.out.println(var2);
      p1.invoke();
      var2 = "end";
      System.out.println(var2);
   }

   public static final void main() {
      int $i$f$f1 = 0;
      String var1 = "start";
      System.out.println(var1);
      int var2 = 0;
      String var3 = "Hello World";
      System.out.println(var3);
      var1 = "end";
      System.out.println(var1);
   }

   // $FF: synthetic method
   public static void main(String[] args) {
      main();
   }
}
```

从反编译后的 Java 源码的 `main()` 函数中可以看到，`f1` 函数被内联了，直接把 lambda 表达式中的内容复制到调用处。

但是如果给一个不含有函数类型形参的函数加上 `inline` 关键字，那么编译器会提示警告：`Expected performance impact from inlining is insignificant. Inlining works best for functions with parameters of functional types`，意思是 “内联对性能的预期影响微不足道。内联最适合具有函数类型参数的函数”，这说明如果一个函数没有函数类型的参数，那么内联不会带来任何性能上的提升。也就是说，`inline` 作用在具有函数类型参数的函数上才有意义。

所以说没有 inline 关键字的具有函数类型参数的函数，少数几次的调用，性能影响不会太大；如果放在大量循环里调用，不断的创建销毁对象，可能对性能有一定影响。使用 inline 关键字虽然可能带来一定的性能提升，但同时也增大了字节码体积。是否添加 inline 关键字，需要根据实际情况来考虑。

## noinline

如果你不想让传递给内联函数的所有 lambda 都内联，可以用 `noinline` 修饰符标记一些函数参数：

```kotlin
inline fun foo(inlined: () -> Unit, noinline notInlined: () -> Unit) { ... }
```

内联 lambdas 只能在内联函数内调用或作为内联参数传递。然而，noinline lambdas 可以以任何你喜欢的方式进行操作，包括存储在字段中或传递。

```kotlin
inline fun hello(preAction: () -> Unit, postAction: () -> Unit): () -> Unit {
    preAction()
    println("hello")
    postAction()
    // 报错 ：Illegal usage of inline-parameter 'postAction' 
    // in 'public inline fun hello(preAction: () -> Unit, postAction: () -> Unit): () -> Unit defined in file Main. kt'.
    // Add 'noinline' modifier to the parameter declaration
    return postAction
}

fun main() {
    hello(
        preAction = { println("preAction") },
        postAction = { println("postAction") }
    )
}
```

如果能编译，编译后的代码应该类似：

```kotlin
fun main() {
    println("preAction")
    println("hello")
    println("postAction")
    postAction
}
```

这里 `postAction` 不是 `postAction` 的引用，而是 `postAction` 的值。编译后的 `postAction` 并没有定义它的地方，所以 `hello()` 函数里我们不能这样直接返回 `postAction` 。

我们可以在 `postAction` 前添加 `noinline` 来关闭 `postAction` 的内联，让它真正创建一个函数对象，以此实现返回 `postAction` 的引用。

```kotlin
inline fun hello(preAction: () -> Unit, noinline postAction: () -> Unit): () -> Unit {
    preAction()
    println("hello")
    postAction()
    return postAction
}

fun main() {
    hello(
        preAction = { println("preAction") },
        postAction = { println("postAction") }
    )
}
```

编译后的代码应该类似：

```kotlin
fun main() {
    println("preAction")
    println("hello")
    val postAction = ({ println("postAction") }).invoke()
    postAction
}
```

这样括 `postAction` 就可以存储在字段中或作为值来传递了。

> 如果内联函数没有可内联的函数参数和具体化的类型参数，编译器将发出警告，因为内联此类函数不太可能有益（如果您确定需要内联，可以使用 `@Suppress("NOTHING_TO_INLINE")` 注解来抑制警告）。

## 非局部跳转表达式

### 非局部返回（non-local returns）

在Kotlin中，你只能使用普通的、无条件的返回来退出命名函数或匿名函数。要退出lambda，请使用标签。lambda 内部禁止裸返回，因为 lambda 不能使封闭函数返回：

```kotlin
fun foo() {
    ordinaryFunction {
        return // ERROR: cannot make `foo` return here
    }
}
```

但是，如果传递 lambda 的函数是内联的，则返回（ `return` ）也可以内联。即 ***调用处的内联函数的函数类型的参数（lambda 表达式）里可以使用 `return`*** ，这叫做 **非局部返回（non-local returns）** 。

因此，允许：

```kotlin
fun foo() {
    inlined {
        return // OK: the lambda is inlined
    }
}
```

这样的返回（位于lambda中，但退出封闭函数）称为非局部返回。这种构造通常发生在循环中，内联函数通常包含：

```kotlin
fun hasZeros(ints: List<Int>): Boolean {
    ints.forEach {
        if (it == 0) return true // returns from hasZeros
    }
    return false
}
```

请注意，一些内联函数可能会调用作为参数传递给它们的 lambdas，这些参数不是直接从函数体传递的，而是从另一个执行上下文传递的，例如本地对象或嵌套函数。在这种情况下，lambdas中也不允许非本地控制流。为了表明内联函数的lambda参数不能使用非局部返回，请用 `crossinline` 修饰符标记lambda参数：

```kotlin
inline fun f(crossinline body: () -> Unit) {
    val f = object: Runnable {
        override fun run() = body()
    }
    // ...
}
```

### 非局部 Break and continue

> This feature is currently [In preview](https://kotlinlang.org/docs/inline-functions.html#break-and-continuekotlin-evolution-principles.html#pre-stable-features). We're planning to stabilize it in future releases. To opt in, use the `-Xnon-local-break-continue` compiler option. We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-1436).

与非局部返回类似，您可以在作为参数传递给包含循环的内联函数的 lambdas 中应用 break 和 continue 跳转表达式：

```kotlin
fun processList(elements: List<Int>): Boolean {
    for (element in elements) {
        val variable = element.nullableMethod() ?: run {
            log.warning("Element is null or invalid, continuing...")
            continue
        }
        if (variable == 0) return true
    }
    return false
}
```

## crossinline

来看另一个 crossinline 的例子

```kotlin
inline fun hello(postAction: () -> Unit) {
    println("hello")
    runOnUiThread {
        // 报错：Can't inline 'postAction' here: it may contain non-local returns.
        // Add 'crossinline' modifier to parameter declaration 'postAction'
        postAction()
    }
    println("world")
}

fun main() {
    hello { 
        println("bye")
        return
    }
}
```

发现报错：不能在此处内联“postAction”：它可能包含非局部返回。在参数声明“postAction”中添加“crossinline”修饰符

看报错提示说是因为它可能包含非局部返回。为什么 `postAction()` 可能包含非局部返回就不允许我这样嵌套调用呢？

这种不直接在 `hello()` 函数里调用，而是在 `hello()` 里的 `runOnUiThread()` 函数里嵌套调用 `postAction()` ，这样就改变了 `postAction()` 的调用上下文。

如果仍然允许 `return` 存在于调用处的 `postAction()` 中，那 `return` 是从 `runOnUiThread()` 返回，继续执行 `println("world")` 呢？还是直接结束 `main()` 函数呢？

答案：都不是，这是因为 ***Kotlin 规定声明处的内联函数里的函数类型的参数默认不允许嵌套调用*** 。

那我就是需要这种嵌套调用呢？看报错，我们可以为这个函数类型的参数加上 `crossinline` 修饰符。

```kotlin
inline fun hello(crossinline postAction: () -> Unit) {
    println("hello")
    runOnUiThread {
        postAction()
    }
}

fun main() {
    hello {
        println("bye")
        // 报错：'return' is not allowed here
        return
    }
}
```

这样会带来另一个报错：不允许在这里 ‘return’

这是说使用了 `crossinline` 修饰符的函数类型的参数，`postAction()` 不能使用非局部返回。

声明处的函数类型参数的嵌套使用 和 调用处的 lambda 表达式里的非局部返回 二者只能取其一

在函数类型的参数加上 `crossinline` 修饰符，以允许声明处的函数类型参数的嵌套使用，并禁止调用处的 lambda 表达式里的非局部返回。不加 `crossinline` 修饰符，则允许调用处的 lambda 表达式里的非局部返回，并禁止声明处的函数类型参数的嵌套使用。

## 总结

作用范围：

- `inline`: 用在有函数类型参数的函数上
- `noinline` 和 `crossinline` 用在该内联函数的函数类型参数上

区别

- `inline`: 通过内联 （即函数内容直插到调用处） 的方式来编译函数，避免创建对象的性能开销
- `noinline`: 局部关掉这个优化, 来摆脱「不能把函数类型的参数当对象使用」的限制
- `crossinline`: 让内联函数里的函数类型的参数可以被嵌套调用, 代价是不能在 Lambda 表达式里使用 return

声明处的函数类型参数的嵌套使用 和 调用处的 lambda 表达式里的非局部返回 二者只能取其一

对比表格：

| 特性 | 默认的 inline | noinline | crossinline |
| :---: | :---: | :---: | :---: |
|内联在字节码里|✓|✓|✘|
|可以非局部返回|✓|✘|✘|
|声明处的嵌套调用|✘|✓|✓|
|可以被引用|✘|✘|✓|
