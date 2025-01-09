# 以 Jetpack Compose 为例了解 Kotlin 的作用域机制

## 引言

Jetpack Compose 的某些API只能在指定的组件内部才能使用，但它的外部甚至它的子组件里都是被禁止的。

```kotlin
// 报错：Unresolved reference: align
Text("hello", Modifier.align(CenterVertically))
Row { 
    Text("hello", Modifier.align(CenterVertically))
    Column {
        // 报错：'fun Modifier. align(alignment: Alignment. Vertical): Modifier' can't be called in this context by implicit receiver. Use the explicit one if necessary
        Text("hello", Modifier.align(CenterVertically))
    }
}
```

这种规则很合理，但是有一个事实是 Compose 是用函数来写界面的，它的每个组件都是一个函数，而不是类。

类和接口要做这种访问性隔离是很容易的，而函数并不具备这样的功能。

你想限制某些公开的属性或者函数在特定的函数内部才能被使用。Kotlin 是没有提供这种功能的，Java 也没有。

那 Kotlin 是怎么做到的呢？聊一下 compose 的作用域机制。

"作用域"这个词在 Compose 底层原理的角度有它的单独的含义

它是用来讨论在界面结构的组合过程中，每个层级之间的关系的一个关键概念。不过今天咱们不聊这个，我们来借着 Compose 的躯壳聊一聊 Kotlin 语言层面的作用机制。

## Compose 和 DSL

Compose 的写法是声明式的，跟同为声明式的 Flutter  有一个很大的不同是：它的基本组件是用函数来写的，而不是用类。

用函数来写有一个很大的好处：写法可以做到极致的简洁，简洁到它可以被看作是一种 DSL （领域特定语言）

Jetpack Compose 也是一样的道理，它是一个定制化的专门用来写界面的DSL，但本质上它依然是 Kotlin 。

## Implicit Receiver

那么既然是 Kotlin ，它就可以完全享受 Kotlin 的所有功能，但也完全承受了 Kotlin 的限制。

比如我们在写传统的XML布局（android布局文件格式也是一种DSL）的时候，如果把属性写在不合适的位置，是会看到警告的。这是 Android Studio 会利用专门的 Lint 规则来自动检查文件结构。这就能在格式不对的时候给我们报警。这套规则我们不用写，但 Android 研发团队是花了精力去写它的。而 Jetpack Compose 是用 Kotlin 来写的，那么理论上就不需要专门再写 Lint 了，把代码设计好，直接利用 Kotlin 特性就能检查和报错了。

实际上 Compose 也是这么做的，但是具体到作用域就有一个问题：它的组件不是用类写的，而是用函数。函数并没有像类和接口那样的层级结构，成员属性和成员函数这些东西。

你可以写局部变量和局部函数，但这些东西是完全私有的，没法从外部调度，所以不是一回事

这样的话虽然用的是 Kotlin 但我们还是没法像传统布局文件那样对作用域做规则管理。直白点说就是你想限制某个属性或者函数只能在指定的函数内部被调用，这是做不到的

但是实际情况却不是这样。Compose 的 `Row()` 组件内部可以使用一个叫做 `align()` 的 `Modifier` 函数
，它可以设置 `Row()` 的 **内部**  每个组件的纵向对齐规则，比如纵向居中。而你如果在 `Row()` **外部** 尝试使用它就会报错。

这是为啥？这其实是利用了 Kotlin 的另一个概念，叫做 [Implicit Receiver](Implicit%20Receiver.md)，隐式的 receiver 。

Compose 把这个 `align()` 写成了 `RowScope` 的成员函数，来限制它只能在 `RowScope` 对象的内部被调用：

```kotlin
@LayoutScopeMarker
@Immutable
@JvmDefaultWithCompatibility
interface RowScope {
    // ...

    @Stable
    fun Modifier.align(alignment: Alignment.Vertical): Modifier

    // ...
}
```

同时它还给 `Row()` 组件的函数类型的参数，也就是 `content` 参数设置了一个 `RowScope` 类型的隐式 receiver。这就让 `Row()` 后面那个大括号里面有一个隐式的 `RowScope` 类型的 `this`：

```kotlin
@Composable
inline fun Row(
    modifier: Modifier = Modifier,
    horizontalArrangement: Arrangement.Horizontal = Arrangement.Start,
    verticalAlignment: Alignment.Vertical = Alignment.Top,
    content: @Composable RowScope.() -> Unit
) {
    val measurePolicy = rowMeasurePolicy(horizontalArrangement, verticalAlignment)
    Layout(
        content = { RowScopeInstance.content() },
        measurePolicy = measurePolicy,
        modifier = modifier
    )
}
```

这样最终效果就是，我们只能在 `Row()` 大括号 **里面** 调用这个 `align()` ，而在其它地方用不了。

通过这种方式 Compose 就实现了用函数而不是类也能进行作用域限制的目的。

## @DslMarker

不过这还没完，这套打法它只限制了不能在外部使用，却没有限制不能在内部的内部使用

比如我在 `Row()` 内部又摆了个 `Column()`，也就是纵向的线性布局。`Row()`组件的这种纵向对齐规则，它是只对直接子组件才有意义的，比如这个 `Text()` 和 `Column()` ，但对 `Column()` 内部的 `Text()` 设置这种纵向对齐就没有意义了，子组件的子组件隔着一层呢，怎么对齐啊是吧

```kotlin
// 报错：Unresolved reference: align
Text("hello", Modifier.align(CenterVertically))
Row { 
    // Text 有意义
    Text("hello", Modifier.align(CenterVertically))
    // Column 有意义
    Column {
        // 报错：'fun Modifier. align(alignment: Alignment. Vertical): Modifier' can't be called in this context by implicit receiver. Use the explicit one if necessary
        // 无意义
        Text("hello", Modifier.align(CenterVertically))
    }
}
```

它可以设置在它的父组件，也就是这个 `Column()` 里面的横向对齐规则

```kotlin
Row {
    // Text 有意义
    Text("hello", Modifier.align(CenterVertically))
    // Column 有意义
    Column {
        Text("hello", Modifier.align(CenterHorizontally))
    }
}
```

注意这里虽然函数名一样，但其实是另一个函数，它只接受横向对齐类型的参数。横向对齐没问题，但更外面的 `Row()` 所管理的纵向对齐，对于这个二级子组件的 `Text()` 是没有意义的。

所以按理说在这个 `Text()` 里，就也不应该允许调用那个纵向对齐的 `align()` 是吧。但是按照 Kotlin 的逻辑这么写却是被允许的

输入代码：

```kotlin
// 报错：Unresolved reference: align
Text("hello", Modifier.align(CenterVertically))
Row {
    Text("hello", Modifier.align(CenterVertically))
    // 'fun Modifier. align(alignment: Alignment. Vertical): Modifier' can't be called in this context by implicit receiver. Use the explicit one if necessary
    Column {
        Text("hello", Modifier.align(CenterVertically))
    }
}    // 报错：Unresolved reference: align
Text("hello", Modifier.align(CenterVertically))
Row {
    Text("hello", Modifier.align(CenterVertically))
    // 'fun Modifier. align(alignment: Alignment. Vertical): Modifier' can't be called in this context by implicit receiver. Use the explicit one if necessary
    Column {
        Text("hello", Modifier.align(CenterVertically))
    }
}
```

报错 `'fun Modifier. align(alignment: Alignment. Vertical): Modifier' can't be called in this context by implicit receiver. Use the explicit one if necessar`

诶？也不允许。这怎么做到的？

Kotlin 有一个特殊的注解叫 `DslMarker` ，这个限制就是靠它来实现的。这是个专门用来写 DSL 的注解吗？还真的是的，这个注解就是专门用来让我们设计 DSL 的时候用的。Compose 就是个 DSL 刚才我说过了是吧，不过咱刚才也说过了，DSL 是个指的广义的词，具体的有很多种 DSL，它们的定位和用法是完全不同的。而这个 `DslMarker` 只是实现了其中一种 DSL 的一种功能。

什么功能？就是咱们现在说的这种。Compose 通过高阶函数和隐式的receiver，实现了作用域向外的限制，只能在某个函数调用的大括号内部去访问某些属性和函数，在外面是不行的对吧。

而 `DslMarker` 的限制是向内的：就算在作用域内，就算是大括号的里面，如果你再套一层，那么在这个更内层的里面，我也不让你用。也就是咱们看到这个 `Row()` 的大括号里面可以用，但里面再套一层 `Column()` 之后，`Column()` 里面就不让用了。

```kotlin
// ❌ 不可以
Text("hello", Modifier.align(CenterVertically))
// ❌不可以
Row {
    // ✔️可以
    Text("hello", Modifier.align(CenterVertically))
    // ✔️可以
    Column {
        // ❌不可以
        Text("hello", Modifier.align(CenterVertically))
        // ❌不可以
    }
    // ✔️可以
}
// ❌不可以
```

这种向内切断作用于传递的工作，就是靠 `DslMarker` 来实现的，我们去看一下 `Row()` 和 `Column()` 所提供的隐式 Receiver 的类型，也就是 `RowScope()` 和 `ColumnScope()`

```kotlin
@LayoutScopeMarker
@Immutable
@JvmDefaultWithCompatibility
interface RowScope {

...

@LayoutScopeMarker
@Immutable
@JvmDefaultWithCompatibility
interface ColumnScope {
```

它们有一个共同的注解叫 `LayoutScopeMarker`，然后我再去看这个 `LayoutScopeMarker`，就能看到它是加了 `DslMarker` 的注解：

```kotlin
@DslMarker
annotation class LayoutScopeMarker
```

通过这种方式，我就把 `RowScope()` 和 `ColumnScope()` 标记为互相隔离作用域的。当我在 `RowScope()` 这里面套一层 `ColumnScope()` ，本来从 `ColumnScope()` 里面应该是能够访问到外面的 `RowScope()`。但加了这个 `LayoutScopeMarker` 之后，就没法访问了，`RowScope()`的所有属性和函数被强行禁止在它里面的 `ColumnScope()` 的内部使用了。同理如果 `ColumnScope()` 里面套一个 `RowScope()`，也是不能往外访问的。这种限制可以防止API的污染。
就像我们例子这种：既然某些 API 只在直接的内部有意义，而在内部的内部就失去了意义，那就干脆禁用这些API在 **内部的内部** 的访问，让我们不要被没用的 API 淹没。从而减少问题，也提升开发体验。

这就是 `DslMarker` 这个注解的作用：向内的隔离访问。

Compose 只是一个例子，在其它地方比如 Gradle 里也有类似的使用。

## 总结

Compose 是用 Kotlin 写的，它享受了 Kotlin 的便利，但也要承受 Kotlin 的限制。它用 Kotlin 的函数来实现了界面组件，就继承了函数不具备作用域的缺陷，但是通过高阶函数隐式 receiver 和 `DslMarker` 的注解。Compose 用这样综合的花活，解决了作用域管理的问题，还解决得挺好，它完全不依赖 Lint 规则，直接依靠 Kotlin 的功能和语法就全都搞定了。

来源：[扔物线](https://www.bilibili.com/video/BV16x4y1275f)
