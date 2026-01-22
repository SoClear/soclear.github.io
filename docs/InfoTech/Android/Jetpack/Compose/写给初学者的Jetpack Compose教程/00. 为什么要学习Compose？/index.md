# 00. 为什么要学习Compose？

> 本文同步发表于我的[微信公众号](https://so.csdn.net/so/search?q=%E5%BE%AE%E4%BF%A1%E5%85%AC%E4%BC%97%E5%8F%B7&spm=1001.2101.3001.7020)，扫一扫文章底部的二维码或在微信搜索 郭霖 即可关注，每个工作日都有文章更新。

终于下定决心要写这个系列了。

前段时间刚在公众号上分享了一篇关于 [Jetpack Compose动画](https://mp.weixin.qq.com/s/Ppbrf7D9X1XwDkqMxee-bQ) 的文章，看到了评论区有这样一条留言。

> 为什么要学 Jetpack Compose？

不管这个问题是疑问还是反问，其实类似的观点我也着实看过不少。因此，在正式开始写这个系列的文章之前，我觉得有必要先写一篇序章，我们真的就来纯粹地聊一聊，到底为什么要学习Jetpack Compose？

事实上，Jetpack Compose对于我来说是必写的一个系列，只是时间早晚的问题。

想一想，之前大家还经常会吐槽Google怎么又又又出新技术了，直呼跟不上了，学不动了之类的。而现在，随着[移动开发](https://so.csdn.net/so/search?q=%E7%A7%BB%E5%8A%A8%E5%BC%80%E5%8F%91&spm=1001.2101.3001.7020)热度的逐渐降低，有没有发现其实Android已经挺长时间没什么重大的新技术让我们学习了。

即使Android系统仍然还是保持每年一个版本的更新，但现在基本都是一些隐私和安全性上的提升，很少再能看到有什么重大的功能突破了。

而Jetpack Compose可以说是近几年里Android开发领域最大的一次更新，且未来的Android程序开发一定会全面向Jetpack Compose转型。只要你还在从事Android开发工作，这就是你必然不可能跳过的知识。

当然，严格意义上讲，Jetpack Compose也不能算是新鲜技术了。Google最早在2019年的I/O大会上就推出了Jetpack Compose的首个alpha版，并于2021年发布了1.0正式版。如今算下来，也已经有四个年头了。

我记得我应该是在很早的阶段就对Jetpack Compose进行了尝鲜，但当时体验下来的结果让我直摇头。

首先，alpha版的Jetpack Compose性能很差，开发工具兼容得也不好，记得当时必须得用Canary版的Android Studio进行开发。

当然，这都不算什么，最重要的是，API极其不稳定。

要知道，那个时候网上关于Jetpack Compose的资料还很少，好不容易找到一篇讲解的文章，照着去实现的时候发现API已经变了，按文章中的写法连编译都过不去。因此，我当时也就打消了写Jetpack Compose文章的念头。

但是现在一切都不一样了。

经过四年多的迭代，Jetpack Compose现在已经相当成熟和稳定，并且绝大多数使用View能完成的效果，现在使用Jetpack Compose同样都能够完成。

再加上考虑到现在国内Jetpack Compose的普及率仍然很低，因此我觉得现在是时候开始写写Compose相关的文章了。

我给这个系列起名叫“写给初学者的Jetpack Compose教程”，这是因为我自己就是初学者。我希望能够完全站在初学者的角度上边学边写，看完这个系列后大家能对Jetpack Compose有一个比较全面的认识。

简单起见，从这里开始，我们将Jetpack Compose简称为Compose。

本篇文章是这个系列的第一篇文章。

第一篇文章我并不打算直接去讲Compose很细节的知识点，我们先从比较宏观的角度认识一下什么是Compose？以及什么我们要使用Compose？

首先解释一下什么是Compose。

Compose是一个由Google Android团队官方推出的声明式UI框架，它的本质就是用来编写界面以及处理与用户交互相关的逻辑的，你可以理解成它是View的替代品。

声明式的UI框架和传统的View区别非常大，但是具体的区别我感觉无法在这里进行详细的描述，因为对于初学者来说可能很难看懂这些纯概念性的描述。等随着后面具体的学习，大家就能直观性地感觉到声明式UI框架与View的巨大区别了。

接下来我们讨论一下，为什么要使用Compose？

有不少朋友可能在之前就已经或多或少了解过Compose，也有读者朋友也跟我反馈过，并不喜欢Compose的这种声明式写法，以前的View用得好好的，为什么Google还要再发明一个新的UI框架来替代View？

那么我们可以先来审视一下，View真的是好好的吗？

首先，站在开发者的角度，View有一个不太友好的地方，就是界面通常都是使用XML来编写的，而系统先需要读取并解析每一个XML文件，然后再将它们展示到界面上。

读取并解析XML是需要时间的，在主线程中进行这个操作还有可能会造成ANR，因此Google为此还推出了像AsyncLayoutInflater这样的API来异步加载解析XML。

而如果你尝试完全不用XML，全部都是通过在代码中手写UI布局，具体有多么难写相信大家都是知道的。

所以其实你也可以将Compose理解成是Google官方提供了一个允许我们以纯代码的形式手写UI布局的方式。

其次，站在Google的角度，View也并不是好好的。我们都知道，View是Android系统中的一个极其重要的组件，它是随着系统发布的。而随着系统发布的组件都会有一个头疼的问题，更新和维护会非常困难。

举一个具体的例子，ImageView就是随系统发布的一个View，我们无须引入任何第三方库就能直接使用它。但是，Google如果现在想要对ImageView的功能进行更新怎么办？你会发现，除了升级操作系统外是没有任何其他办法更新的。

但即使是升级了操作系统，旧版系统上的ImageView仍然还是老的，为此Google就只好推出像ImageViewCompat这样的API，Android里各种Compat的API相信大家也都见过不少。

所以，后来Google就很少再推出随系统发布的View了，更多都是随着AndroidX发布的，而Compose当然也是属于AndroidX的一部分。如果想要了解更多关于AndroidX的内容，可以参考我的这篇文章 [总是听到有人说AndroidX，到底什么是AndroidX？](https://guolin.blog.csdn.net/article/details/97142065) 。

最后，View真的已经太老太老了，它是随着Android 1.0系统发布的，至今已经过去了十几个年头。View的历史包袱太重，维护起来也变得越来越困难。因此，Google无论如何都觉得应该推出一套全新的UI框架了，而这就是Compose。

刚才有说过，Compose是一个声明式的UI框架。不管你喜不喜欢这种声明式的形式，这都不是Google首创的，Google只是顺应了时代的潮流。

至于谁是引领时代潮流的声明式UI框架？那首先肯定不可能是Compose，当然也不会是隔壁的SwiftUI。大家最先想到的或许会是Flutter，毕竟这个名气很大，用的人也很多，Compose和SwiftUI在很大程度上还是借鉴的Flutter。

但实际上，前端框架React早在10年前就已经开始使用这种声明式的语法理念，并且逐渐将它发扬光大。

那么说了这么久的声明式，那么到底什么才是声明式呢？

我们可以将声明式理解成是一种编程思维，只要你的UI框架是基于这种编程思维来使用的，那么就可以称之为声明式UI框架。

具体是什么编程思维呢？我们还是拿View来进行举例。

View肯定不是声明式的，它更多是一种过程式的思维。我们在描述一个View的时候是不会描述它的状态的，或者只会描述它的初始状态。

那么后期想要更新这个View的状态怎么办呢？这个大家一定熟悉，就是先调用findViewById()方法来获取到这个View的实例，然后再通过setXXX来更改它的状态，如setVisibility、setBackground等等。

这种就是过程式的思维。

那这种编程思维有什么不好的吗？好不好其实都是对比出来的，在没有声明式之前我也没有觉得这种过程式的思维有什么问题，待会我们会看具体的比较示例。

那声明式的思维又是什么样的呢？

它的工作流程有点像是刷新网页一样。即我们仍然正常地去描述一个控件，但这次要附带上它的状态。然后当有任何状态需要发生改变时，只需要像刷新网页一样，让整个界面上的所有元素全部刷新一遍，那么自然所有状态都能得到更新了。

如果你是初次听到这种逻辑，一定会感到震惊。什么？为了更新一个控件的状态，让整个界面上的所有元素全部刷新一遍？那这程序的运行效率不得卡到完全没办法使用？

没错，如果不做任何优化的话，确实会是这个样子，但很明显Google不会让这样的事情发生。

事实上，所有的声明式UI框架在这里都会采取相似的优化策略，那就是在刷新界面的时候只会去更新那些状态有变化的控件，而那些状态没有变化的控件在界面刷新的时候则会跳过执行。

空口讲了这么久，我们现在稍微看一段简单的代码来理解一下这部分逻辑吧：

```kotlin
@Composable
fun HelloCompose(date: String, weather: String) {
    Column {
        Text("$date")
        Text("$weather")
    }
}
```

这是一段Compose代码，在这里我们放置了两个Text控件用来显示两行文字，其中date用于显示日期，weather用于显示天气。

那么当界面内容发生更新的时候，只需要对这个HelloCompose()函数进行刷新，并传入相应的参数即可。但是请注意，如果传入的参数和上次并没有发生变化，那么就没有任何控件会发生更新。如果date有变化，而weather没有，那么就只有第一个Text控件会发生更新，第二个Text控件丝毫不会受影响，反之亦然。

重新刷新界面以此来更新界面内容的这个过程我们称之为重组。Compose会保证，每次重组永远都只会去更新那些必要的控件，状态没有发生变化的控件是不会更新的，以此来保证运行效率。

至于Compose是如何做到这点的，它的基本原理是利用观察者的机制来去记录哪些控件需要更新，但如果想要详细地解释清楚会非常复杂。我觉得作为初学者，能使用好Compose就已经很不错了，暂时没有必要去卷它底层的工作原理。等到了这个系列的后期，我可能会再去写一写这方面的内容。

现在，你已经对Compose和声明式UI有一点点的了解了。刚才我们有说到，要对过程式和声明式的写法进行一下对比，现在就来看看吧。

比如用户进入我们App的首页，首页内容的加载是需要一些时间的，通常这个时候我们会先显示一个加载框或者是占位图给用户，等首页内容加载完成之后，再把加载框隐藏掉，将正常的首页呈现给用户。而如果加载过程中遇到了一些问题，比如说用户的手机没网，这个时候就展示一个错误页面给用户。

这是一个非常常见的需求，那么长久以来我们都是如何实现这个功能的呢？代码如下所示：

```kotlin
fun refreshHomePageVisibility(Status status) {
    when (status.current) {
        Status.SUCCESS -> {
            homePageView.visibility = View.VISIBLE
            loadingView.visibility = View.GONG
            errorView.visibility = View.GONG
        }
        Status.LOADING -> {
            loadingView.visibility = View.VISIBLE
            homePageView.visibility = View.GONG
            errorView.visibility = View.GONG
        }
        Status.ERROR -> {
            errorView.visibility = View.VISIBLE
            loadingView.visibility = View.GONG
            homePageView.visibility = View.GONG
        }
    }
}
```

可以看到，这里我们通过一个refreshHomePageVisibility()函数来去刷新首页可见控件的状态。homePageView表示正常的首页内容，loadingView表示加载等待框，errorView表示错误页面。

当首页内容加载成功的时候，我们将homePageView设置成VISIBLE，将loadingView和errorView设置成GONE。

当正在加载首页内容的时候，我们将loadingView设置成VISIBLE，将homePageView和errorView设置成GONE。

当首页内容加载失败的时候，我们将errorView设置成VISIBLE，将loadingView和homePageView设置成GONE。

有没有觉得这段代码真的很繁琐，而且如果不细心的话还很容易写错，从而会导致应该显示的View和应该隐藏的View出现混乱。

这种代码其实我们经常会写，但是没有人会去指出这有什么问题，因为不这么写还能怎么写呢？过程式的思维就只能是这个样子。

但是有了Compose就一样了，用声明式的思维来去编写这类UI界面，你会发现逻辑会变得特别清晰明了。代码如下所示：

```kotlin
@Composable
fun HomePage(Status status) {
    when (status.current) {
        Status.SUCCESS -> {
            HomePageContent()
        }
        Status.LOADING -> {
            LoadingContent()
        }
        Status.ERROR -> {
            ErrorContent()
        }
    }
}
```

这里的HomePageContent()、LoadingContent()和ErrorContent()都是Compose函数，分别用来显示正常的首页内容、加载等待框和错误页面。

然后我们在HomePage()函数中只需要根据参数中传入的状态来决定是调用HomePageContent()、LoadingContent()还是ErrorContent()函数即可。

为什么使用Compose来实现同样的功能逻辑会变得这么简单？因为这就是声明式UI的特点。当HomePage()函数传入的参数发生变化时，这个函数就会触发重组，从而对界面内容进行刷新。那么界面都刷新了，首页内容、加载等待框和错误页面的可见性自然都会调整为正确的状态，所以不需要我们再去手动设置visibility属性了。

另外效率的事情大家也完全不用担心，刚才已经说了，重组永远都只会去更新那些必要的控件。HomePageContent()、LoadingContent()和ErrorContent()这3个函数都没有接收任何参数，因此它们内部的控件在重组过程中都不会被更新，只有最外层控件的可见性状态会发生改变，效率等同于我们刚才手动设置visibility属性的方式。

这样，我们就通过一个非常简单的例子比较直观地理解了Compose的优越性，希望这能回答许多人心中的“为什么要学习Compose”的疑问。

当然，Compose的优越性远不止这些，但是也不要因为这一个例子就觉得Compose很美好。因为这个例子实在太简单了，而Compose总体上来说仍然是非常庞大的一套系统，想要把它完全搞懂并不容易，还是要花很大的功夫的。

今天的这篇文章是这个系列的序章，我们还并没有通过一个实际可运行的例子来去学习如何编写Compose程序，但是希望这篇文章能提起大家对Compose的兴趣，我们会在本系列后续的文章当中慢慢上手Compose编程。

Compose是基于Kotlin语言的声明式UI框架，如果想要学习Kotlin和最新的Android知识，可以参考我的新书 **《第一行代码 第3版》**，[点击此处查看详情](https://guolin.blog.csdn.net/article/details/105233078)。
