# 09. Side Effect

大家好，写给初学者的Jetpack Compose教程又更新了。

这是本系列教程的第9篇文章，我们也已经渐渐从学习Compose的基础知识慢慢转变成学习Compose的高级技巧了，而Side Effect（副作用）就是其中你必须要掌握的一环。

事实上，要理解Side Effect，还是得要先理解重组才行，因为其实就是因为有重组的存在，才会导致出现Side Effect。可以说重组就是整个Compose能够工作的最核心的机制。

对重组还不够了解的朋友，直接学习Side Effect肯定是非常困难的，建议还是先从本系统的第一篇文章开始看起 [写给初学者的Jetpack Compose教程，为什么要学习Compose？](../00.%20为什么要学习Compose？/index)

再往下看，就说明你已经非常了解重组概念了，那么我们就正式开始学习Side Effect。

## 什么是Side Effect？

官方文档对于Side Effect的定义描述还是比较抽象的，根据官方文档的说法，Side Effect指的就是，在一个Composable函数的内部发生了超出其作用域的状态变更。

要怎么理解这句话呢？我们来看下面这段代码：

```kotlin
private var mInit = false

@Composable
fun MyApp() {
    Initialize()
    MainScreen()
}

@Composable
fun Initialize() {
    mInit = true
}

@Composable
fun MainScreen() {
    if (mInit) {
        // 处理MainScreen逻辑
        ...
    }
}
```

这段代码的核心诉求还是比较好理解的，就是在MyApp()这个Composable函数的内部，我们先调用Initialize()函数对mInit变量进行初始化，完成了初始化之后再在MainScreen()函数中开始处理主页面的逻辑。

这种思维在传统的编程模式下是可以的，但是在Compose这种基于声明式UI的编程模式下是不行的。

上述对mInit变量的操作其实就是属于超出了各个Composable函数作用域的状态变更，因此一定会发生Side Effect。

为了帮助大家更加清晰地了解上述代码犯下的错误，我们来看一看官网 [Think in Compose](https://developer.android.com/develop/ui/compose/mental-model) 这篇文章中描述的Compose重组可能具备哪些特性。

- 重组会尽可能跳过不必要的代码
- 重组会导致Composable函数频繁重复执行
- Composable函数可能会并行运行
- Composable函数可以以任意顺序执行

这几条特性都决定着上述代码是无法正常工作的，因为我们设想的Initialize()函数一定在MainScreen()函数之前执行这个前提条件在Compose中根本就不成立。

类似的Side Effect情况其实还有很多，比如说如果你想要在Compose中编写一个[计数器](https://so.csdn.net/so/search?q=%E8%AE%A1%E6%95%B0%E5%99%A8&spm=1001.2101.3001.7020)效果，并写出了如下代码：

```kotlin
@Composable
fun Counter(modifier: Modifier = Modifier) {
    var count = 0
    Column {
        Text(text = "$count")
        Button(onClick = { count++ }) {
            Text(text = "Click me")
        }
    }
}
```

很遗憾，这段代码也是无法正常运行的，因为这里对count变量的赋值又是属于超出了Composable函数作用域的状态变更，所以再次出现了Side Effect。

想要避免Side Effect其实并不难，Compose中引入的State概念就可以让Composable函数非常容易地管理各个变量的状态变更。对于State还不了解的朋友可以去参考 [写给初学者的Jetpack Compose教程，使用State让界面动起来](../03.%20State/index.md) 这篇文章。

但我们还是有可能会遇到一些特殊的Side Effect场景是State解决不了的。没有关系，Compose给开发者提供了非常丰富的Side-effect[s函数](https://so.csdn.net/so/search?q=s%E5%87%BD%E6%95%B0&spm=1001.2101.3001.7020)，专门用于解决各类特殊的Side Effect场景。

那么本篇文章，我们就将主要聚焦在这些Side-effects函数上，对它们的用法以及应用场景进行学习。

## LaunchedEffect

LaunchedEffect应该是最常用的一个Side-effects函数了，它主要用于解决两个问题。

第一，让你在Composable函数中的某些代码只执行一遍。

刚才我们有说到重组的其中一个特性，就是可能会导致Composable函数频繁重复执行。而如果有些代码你并不想让它们在每次重组的时候都重新执行一遍，就可以使用LaunchedEffect函数来解决。

比如说，我们有段初始化的代码，在整个Compose的生命周期里只需要执行一遍就行了，那么就可以这样写：

```kotlin
@Composable
fun MyApp() {
    LaunchedEffect(Unit) {
        // 对程序进行初始化
    }
    MainScreen()
}
```

这样，写在LaunchedEffect函数中的代码，就可以保证不会在每次MyApp()函数发生重组时重新执行，它只会执行一遍。

另外你可能发现了，LaunchedEffect函数怎么还接收了一个Unit参数？

其实基于这个参数的用法有很多，因为你可以传递任意类型的参数给LaunchedEffect函数。

而它的作用是，LaunchedEffect函数中的逻辑会在每次参数发生变化时重新执行。

如果参数发生变化时前一次LaunchedEffect函数中的逻辑还没有执行完，那么则会先取消前一次，然后再次执行LaunchedEffect函数中的逻辑。

基于这个特性虽然能做很多的事情，不过大多场景都比较小众。如果你想要的只是让你的某些代码只执行一遍，记得传入Unit就好了。

接下来我们再来看LaunchedEffect函数解决的第二个问题，就是在Composable函数中提供一个协程作用域。

Compose是基于Kotlin的一个声明式UI框架，既然是基于Kotlin的，那么就一定有很多代码是用协程写的，因此需要在协程作用域里面才能调用这些代码。

而Composable函数默认是不带协程作用域的，因此如果你想要在一个Composable函数中调用delay函数，那么将会直接编译报错：

```kotlin
@Composable
fun MyApp() {
    delay(1000) // 编译报错
    MainScreen()
}
```

所以，为了解决Composable函数没有协程作用域的难题，Compose提供了LaunchedEffect函数，当你有挂起函数需要在Composable函数中调用时，只需要这样写就可以了：

```kotlin
@Composable
fun MyApp() {
    LaunchedEffect(Unit) {
        delay(1000) //编译通过
        // 对程序进行初始化
    }
    MainScreen()
}
```

也就是说，LaunchedEffect函数中代码其实都是在协程作用域当中执行的。

这也就解释了为什么前面说当LaunchedEffect函数的参数发生变化时，会先取消前一次未执行完的逻辑。因为只有运行在协程中的代码才有可能被取消，不然一段正在运行的正常代码是无论如何无法被取消或中止的。

## rememberUpdatedState

rememberUpdatedState几乎总是配合着LaunchedEffect函数一起使用的，因此这里将它们俩放在一块讲解。

rememberUpdatedState函数主要用于解决，在使用LaunchedEffect函数时，可能存在的一些回调丢失的风险。

那么什么情况下会导致回调丢失呢？我们来看下面这个例子：

```kotlin
@Composable
fun Initialize(callback: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(1000)
        callback()
    }
}
```

这里我们在Initialize()函数中调用LaunchedEffect函数去进行[初始化操作](https://so.csdn.net/so/search?q=%E5%88%9D%E5%A7%8B%E5%8C%96%E6%93%8D%E4%BD%9C&spm=1001.2101.3001.7020)，由于初始化操作只需要执行一次就可以了，因此非常适合放在LaunchedEffect函数中去执行。然后在初始化结束之后，我们再调用参数中传入的callback对象来进行回调通知。

那么这段代码有没有什么问题呢？

其实是有的，因为在LaunchedEffect中的代码执行期间，callback参数随时是有可能改变的，如果LaunchedEffect函数还在初始化过程中，callback参数变动了，那么老的callback对象已经不存在了，自然无法回调成功，新的callback对象也无法得到回调，因为LaunchedEffect函数只会执行一次。

怎么解决这个问题呢？使用rememberUpdatedState函数就可以了。我们来直接看下用法吧：

```kotlin
@Composable
fun Initialize(callback: () -> Unit) {
    val currentCallback by rememberUpdatedState(callback)
    LaunchedEffect(Unit) {
        delay(1000)
        currentCallback()
    }
}
```

这里调用rememberUpdatedState函数，并将callback参数传递给它，从而得到了一个新的currentCallback参数。这个currentCallback可以保证永远是指向的是最新的callback参数。

然后，我们只需要在LaunchedEffect函数中的初始化任务执行结束后，调用这个currentCallback对象，就可以保证最新的回调不会丢失了。

## rememberCoroutineScope

rememberCoroutineScope这个Side-effects函数也是用于提供协程作用域的。

可能你会觉得，刚才LaunchedEffect函数已经能够提供协程作用域了，为什么还需要这个rememberCoroutineScope函数呢？

因为它们俩其实是一个互补关系，只要拥有这两个函数，基本就可以在Compose中覆盖所有的协程场景了。

先来说一下LaunchedEffect函数所存在的局限性，虽说LaunchedEffect函数能够提供协程作用域，但由于它本身是一个Composable函数，我们可以通过观察它的源码来确认这一点：

```kotlin
@Composable
@NonRestartableComposable
@OptIn(InternalComposeApi::class)
fun LaunchedEffect(
    key1: Any?,
    block: suspend CoroutineScope.() -> Unit
) {
    val applyContext = currentComposer.applyCoroutineContext
    remember(key1) { LaunchedEffectImpl(applyContext, block) }
}
```

可以看到，带了@Composable注解的就说明这是一个Composable函数。

而Composable函数只能在另一个Composable函数中调用，也就是说，如果我们要在一个非Composable函数中创建协程作用域的话，那么LaunchedEffect函数就无法做到了。

什么场景下会需要在非Composable函数中创建协程作用域呢？其实场景非常多，观察如下代码：

```kotlin
@Composable
fun MyButton() {
    Button(onClick = {
        delay(1000) // 这里会编译报错
    }) {
        Text(
            text = "This is Button",
            color = Color.White,
            fontSize = 26.sp
        )
    }
}
```

这里我们定义了一个Button，并且在Button的点击事件中调用了挂起函数delay()。

这段代码肯定是无法编译通过的，因为Button的点击事件回调中没有协程作用域，自然无法调用挂起函数。

这个时候你会失去发现用LaunchedEffect函数是解决不了问题的，因为Button的点击事件回调不属于Composable函数的作用域，你在这里根本无法调用LaunchedEffect函数。

所以这个时候就需要rememberCoroutineScope函数登场了，代码如下：

```kotlin
@Composable
fun MyButton() {
    val coroutineScope = rememberCoroutineScope()
    Button(onClick = {
        coroutineScope.launch {
            delay(1000) // 编译通过
        }
    }) {
        Text(
            text = "This is Button",
            color = Color.White,
            fontSize = 26.sp
        )
    }
}
```

首先我们通过调用rememberCoroutineScope函数能够得到一个CoroutineScope对象，这个CoroutineScope对象和我们在View系统中使用的CoroutineScope别无二致。

那么接下来就很简单了，调用CoroutineScope的launch函数开启一个协程，然后就能非常自由地调用挂起函数了。

注意LaunchedEffect和rememberCoroutineScope这两函数谁都无法取代时，它们的应用场景各不相同。

如果你觉得rememberCoroutineScope函数更加好用，想用来替代LaunchedEffect函数的话，那就错得离谱了。比如下面这段代码：

```kotlin
@Composable
fun Initialize(callback: () -> Unit) {
    val coroutineScope = rememberCoroutineScope()
    coroutineScope.launch {
        delay(1000)
        callback()
    }
}
```

这段代码会产生严重的Side Effect，因为每次Initialize()函数发生重组都会导致开启一个新的协程并触发一次回调，这绝对不是你想要的。

因此我们一定要在合适的场景下选择正确的Side-effects函数，不然反而可能会产生更严重的Side Effect，这就本末倒置了。

## DisposableEffect

DisposableEffect应该可以算是和LaunchedEffect对称的一个Side-effects函数，它的作用是对不再使用的资源进行安全合理地回收。

DisposableEffect函数的基本语法结构是这个样子的：

```kotlin
DisposableEffect(param) {
    onDispose {
    }
}
```

DisposableEffect函数允许接收一个或多个参数，在参数不变的情况下，DisposableEffect函数中的内容只会执行一次。从这点特性上来说，DisposableEffect和LaunchedEffect函数是非常类似的。

不同点在于，DisposableEffect函数不会提供协程作用域，同时DisposableEffect函数中必须要再提供一个onDispose函数。每当DisposableEffect函数的任意一个参数发生变化时，onDispose函数中的内容就会执行，我们可以在这里进行资源释放。然后DisposableEffect函数会使用新的参数内容再次重复上述逻辑。

下面我们来看一个具体的例子吧，DisposableEffect函数用的最多的场景就在是Composable函数中进行生命周期监听了，代码如下所示：

```kotlin
@Composable
fun MyApp() {
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_CREATE -> {
                    // Handle onCreate
                }
                Lifecycle.Event.ON_START -> {
                    // Handle onStart
                }
                Lifecycle.Event.ON_RESUME -> {
                    // Handle onResume
                }
                Lifecycle.Event.ON_PAUSE -> {
                    // Handle onPause
                }
                Lifecycle.Event.ON_STOP -> {
                    // Handle onStop
                }
                Lifecycle.Event.ON_DESTROY -> {
                    // Handle onDestroy
                } else -> {
                    // Handle other events
                }
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }
}
```

想要监听Activity的生命周期，我们可以使用AndroidX的Lifecycle组件，并通过给它添加Observer的方式来实现。

但是很明显我们不能直接在Composable函数中去添加Observer，不然每次只要一重组就会添加一个新的Observer，那监听器就要爆炸了。

虽然我们前面学习的LaunchedEffect函数可以解决这个问题，但是LaunchedEffect函数并不适用监听器的场景，因为它只负责添加，却不能删除，这样资源就无法回收了。

而DisposableEffect函数就是为了这种场景而设计的，我们可以看到上述代码中，lifecycleOwner作为参数传递给了DisposableEffect函数，并给Lifecycle组件添加了一个新的Observer。这样整个Activity的生命周期内，我们都是可以监听到诸如onStart、onResume这些生命周期回调的。

同时，如果我们离开了当前Activity，那么lifecycleOwner就会发生变化，此时会触发onDispose函数的执行。那么在这里，我们对刚才添加的Observer进行了移除，这样也就完成了资源释放。

## produceState

produceState函数的作用，是将一个非Compose的State转换成Compose的State，因此这是一个关于State的Side-effects函数。

如果你对Compose中的State概念还并不熟悉，一定要先去阅读 [写给初学者的Jetpack Compose教程，使用State让界面动起来](../03.%20State/index.md) 这篇文章。

下面我们来编写一个页面加载效果，分别有加载中、加载成功和加载失败这三种页面状态。代码如下所示：

```kotlin
@Composable
fun HomePage(success: Boolean) {
    var loadingStatus = 0
    LaunchedEffect(Unit) {
        loadingStatus = Status.LOADING
        delay(1000)
        loadingStatus = if (success) {
            Status.SUCCESS
        } else {
            Status.ERROR
        }
    }
    when (loadingStatus) {
        Status.LOADING -> {
            LoadingContent()
        }
        Status.SUCCESS -> {
            HomePageContent()
        }
        Status.ERROR -> {
            ErrorContent()
        }
    }
}
```

这段代码想表达的意图是，首先调用LaunchedEffect函数创造一个协程作用域，在这里执行加载逻辑。

一开始将状态设置为加载中，然后调用delay()函数延迟一下用于模拟加载的效果，之后再根据加载的结果将状态设置为成功或者是失败。当然这里只是模拟一下，所以加载的结果我就用参数的方式传入进来了，这样可以随时通过修改参数来模拟效果。

最后，再根据当前状态的值来决定是显示HomePageContent()、LoadingContent()还是ErrorContent()函数中的内容。

不用说，这段代码肯定是无法正常为工作的，因为再次出现了Side Effect。LaunchedEffect函数中对加载状态的修改，属于超出了Composable函数作用域的状态变更。

至于怎么解决这个问题，只要你看过了上面那篇文章就一定难不倒你，因为使用State就可以避免Side Effect的出现了。代码如下所示：

```kotlin
@Composable
fun HomePage(success: Boolean) {
    var loadingStatus by remember { mutableIntStateOf(0) }
    LaunchedEffect(Unit) {
        loadingStatus = Status.LOADING
        delay(1000)
        loadingStatus = if (success) {
            Status.SUCCESS
        } else {
            Status.ERROR
        }
    }
    when (loadingStatus) {
        Status.LOADING -> {
            LoadingContent()
        }
        Status.SUCCESS -> {
            HomePageContent()
        }
        Status.ERROR -> {
            ErrorContent()
        }
    }
}
```

这里我们通过mutableIntStateOf函数创建了一个Compose的State对象，之后所有的状态变更都是针对这个State对象进行操作的，这样自然就不会出现Side Effect了。

虽然上述代码确实可以解决问题，但是不代表我们不能把代码写得更好。而produceState函数就是用来优化这部分场景的。

刚才已经说了，produceState函数用于将一个非Compose的State转换成Compose的State。除此之外，produceState函数还将提供一个协程作用域。

因此，它完全可以替代上述代码中的mutableIntStateOf和LaunchedEffect这两部分内容。

下面我们来看看使用produceState函数优化过后的代码吧：

```kotlin
@Composable
fun HomePage(success: Boolean) {
    val loadingStatus by produceState(initialValue = Status.LOADING) {
        delay(1000)
        value = if (success) {
            Status.SUCCESS
        } else {
            Status.ERROR
        }
    }
    when (loadingStatus) {
        Status.LOADING -> {
            LoadingContent()
        }
        Status.SUCCESS -> {
            HomePageContent()
        }
        Status.ERROR -> {
            ErrorContent()
        }
    }
}
```

这段代码应该很好理解，因为主体结构和上面的代码是一致的。

但是相比之下，使用produceState函数的版本要更加清爽一些。

我们不用像刚才那样还需要在调用mutableIntStateOf函数时传入一个无意义的状态0用作于初始化。produceState函数允许通过initialValue参数来设置初始值，这样每个状态都是有意义的。

同时，使用produceState函数得到的转换后的State对象是可以声明成val的，这样可以避免一些加载状态被误改的情况，从而让代码变得更加安全。

另外，你还可以将produceState函数里的这段逻辑单独抽离成一个函数并放在任何你想放的位置，这样可以更好地将业务代码和UI代码分离开，如下所示：

```kotlin
@Composable
fun startLoading(success: Boolean): State<Int> {
    return produceState(initialValue = Status.LOADING) {
        delay(1000)
        value = if (success) {
            Status.SUCCESS
        } else {
            Status.ERROR
        }
    }
}

@Composable
fun HomePage(success: Boolean) {
    val loadingStatus by startLoading(success)
    when (loadingStatus) {
        Status.LOADING -> {
            LoadingContent()
        }
        Status.SUCCESS -> {
            HomePageContent()
        }
        Status.ERROR -> {
            ErrorContent()
        }
    }
}
```

## SideEffect

是的，讲了一整篇的Side Effect，你可能没有想到，还真有一个Side-effects函数的名字就叫做SideEffect。

这个函数应该是所有Side-effects函数里面最不常用的一个，我个人其实没想到太多实际应用的场景，所以待会我就用Android官方文档上的例子给大家讲解了。

首先说一下SideEffect函数的作用是什么吧，它可以让其函数中的代码在Composable函数每次重组的时候执行一次。

我们已经知道，重组的特性决定着Composable函数可能会非常频繁地执行。你不知道什么时候会发生重组，发生了多少次重组。

但有了SideEffect函数，我们就可以知道这些了。

所以我甚至觉得SideEffect函数最大的作用是用于当做学习理解重组概念的调试函数。

观察下面这段代码：

```kotlin
@Composable
fun MyButton() {
    var count by remember { mutableIntStateOf(0) }
    Button(onClick = {
        count++
    }) {
        Text(
            text = "Count is $count!",
        )
        SideEffect {
            Log.d("linguo2aaa", "Recomposition happened.")
        }
    }
}
```

这里我们给按钮增加了一个计数器功能，每点击一次按钮计数就会加1。

由于使用了State对象来控制计数，并通过Text控件对计数值进行了展示。因此我们可以知道，每点击一次按钮都会触发一次重组行为，以更新界面上的最新数据。

但之前我们只是知道而已，重组这个行为对于开发者而言仍然是看不见摸不着一般。除了界面上的数据已经更新，我们找不到其他什么证据来证明重组行为已经发生了。

现在有了SideEffect函数就不一样了，我们在函数中打印一行日志，就可以知道重组行为有没有发生了。

上述代码中，每点击一次按钮，Button和Text控件都会发生一次重组，但是MyButton不会发生重组。

将SideEffect函数放置在不同的位置，将更好地帮助你理解重组行为。

上面的例子是将SideEffect当成调试函数来使用的，那么在实际环境当中SideEffect函数又能起到什么作用呢？这里我就直接贴上Android官方的示例代码了：

```kotlin
@Composable
fun rememberFirebaseAnalytics(user: User): FirebaseAnalytics {
    val analytics: FirebaseAnalytics = remember {
        FirebaseAnalytics()
    }

    // On every successful composition, update FirebaseAnalytics with
    // the userType from the current User, ensuring that future analytics
    // events have this metadata attached
    SideEffect {
        analytics.setUserProperty("userType", user.userType)
    }
    return analytics
}
```

这是一段Firebase的数据上报代码。

这段代码想要实现的效果是，每次函数重组，我们都更新一下用户类型这个字段，以确保Firebase上统计到的用户类型数据是最新的。

至于为什么是每次函数重组的时候更新，我想可能是因为rememberFirebaseAnalytics函数只接受一个User参数，因此基本上只有当User参数发生变化的情况下才会触发rememberFirebaseAnalytics函数的重组。

这个例子我个人认为还是有点牵强的，因为想要实现类似功能有很多种写法，并不一定非要借助SideEffect函数来实现。

但这是官方文档中给出的例子，或许已经是SideEffect函数比较好的应用场景了。

## derivedStateOf

derivedStateOf这个函数非常有用，可以大幅改善Compose代码的运行效率。

其实我在之前就已经专门写过一篇文章讲解了derivedStateOf函数的详细用法，只是当时写的时候我还不知道derivedStateOf也是属于Side-effects函数中的一种，毕竟我也是Compose的初学者。

因此这里我就直接附上链接供大家参考吧，[写给初学者的Jetpack Compose教程，用derivedStateOf提升性能](../05.%20derivedStateOf/index.md) 。

好的，关于Side Effect所有要讲的内容就到这里，希望大家能掌握好本篇文章的知识，从而让自己的Compose代码摆脱副作用。

我们下篇文章再见。

___

Compose是基于Kotlin语言的声明式UI框架，如果想要学习Kotlin和最新的Android知识，可以参考我的新书 **《第一行代码 第3版》**，[点击此处查看详情](https://guolin.blog.csdn.net/article/details/105233078)。
