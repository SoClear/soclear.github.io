# 控制反转和依赖注入

1996年，Michael Mattson 在一篇有关探讨面向对象框架的文章中，首先提出了 **控制反转**（IOC，Inversion of Control）这个概念，大体是这样的：借助于“第三方”实现具有依赖关系的对象之间的解耦。

2004年，Martin Fowler探讨了同一个问题，既然IOC是控制反转，那么到底是“哪些力面的控制被反转了呢?”，
经过详细地分析和论证后，他得出了答案：
“获得依赖对象的过程被反转了”。  
控制被反转之后，获得依赖对象的过程由自身管理变为了由IOC容器主动注入。  
于是，他给“ **控制反转** ”取了一个更合适的名字叫做“ **依赖注入** ”。他的这个答案实际上给出了 **实现IOC的方法:依赖注入** 。

依赖项注入 (DI) 是一种广泛用于编程的技术，非常适用于 Android 开发。遵循 DI 的原则可以为良好的应用架构奠定基础。

实现依赖项注入可为您带来以下优势：

- 重用代码
- 易于重构
- 易于测试

## 依赖项注入基础知识

在专门介绍 Android 中的依赖项注入之前，本页提供了依赖项注入工作原理的总体概览。

### 什么是依赖项注入？

类通常需要引用其他类。例如，`Car` 类可能需要引用 `Engine` 类。  
这些必需类称为依赖项，在此示例中，`Car` 类依赖于拥有 `Engine` 类的一个实例才能运行。

类可通过以下三种方式获取所需的对象：

1. 类构造其所需的依赖项。  
    在以上示例中，`Car` 将创建并初始化自己的 `Engine` 实例。
2. 从其他地方抓取。  
    某些 Android API（如 `Context` getter 和 `getSystemService()`）的工作原理便是如此。
3. 以参数形式提供。  
    应用可以在构造类时提供这些依赖项，或者将这些依赖项传入需要各个依赖项的函数。  
    在以上示例中，`Car` 构造函数将接收 `Engine` 作为参数。

第三种方式就是依赖项注入！  
使用这种方法，您可以获取并提供类的依赖项，而不必让类实例自行获取。

下面是一个示例。在不使用依赖项注入的情况下，要表示 `Car` 创建自己的 `Engine` 依赖项，代码如下所示：

```kotlin
class Car {

    private val engine = Engine()

    fun start() {
        engine.start()
    }
}

fun main(args: Array) {
    val car = Car()
    car.start()
}
```

![不使用依赖项注入的 Car 类](ioc_di_1.png)

这并非依赖项注入的示例，因为 `Car` 类构造了自己的 `Engine`。  
这可能会有问题，原因如下：

- `Car` 和 `Engine` 密切相关  
    `Car` 的实例使用一种类型的 `Engine`，并且无法轻松使用子类或替代实现。  
    如果 `Car` 要构造自己的 `Engine`，您必须创建两种类型的 `Car`，
    而不是直接将同一 `Car` 重用于 `Gas` 和 `Electric` 类型的引擎。

- 对 `Engine` 的强依赖使得测试更加困难。  
    `Car` 使用 `Engine` 的真实实例，
    因此您无法使用[测试替身](https://en.wikipedia.org/wiki/Test_double)针对不同的测试用例修改 `Engine`。

如果使用依赖项注入，代码是什么样子的呢？  
`Car` 的每个实例在其构造函数中接收 `Engine` 对象作为参数，而不是在初始化时构造自己的 `Engine` 对象：

```kotlin
class Car(private val engine: Engine) {
    fun start() {
        engine.start()
    }
}

fun main(args: Array) {
    val engine = Engine()
    val car = Car(engine)
    car.start()
}
```

![使用依赖项注入的 Car 类](ioc_di_2.png)

`main` 函数使用 `Car`。  
由于 `Car` 依赖于 `Engine`，因此应用会创建 `Engine` 的实例，然后使用它构造 `Car` 的实例。  
这种基于 DI 的方法具有以下优势：

- 重用 `Car`。  
    您可以将 `Engine` 的不同实现传入 `Car`。  
    例如，您可以定义一个想要 `Car` 使用的名为 `ElectricEngine` 的新 `Engine` 子类。  
    如果您使用 DI，只需传入更新后的 `ElectricEngine` 子类的实例，`Car` 仍可正常使用，无需任何进一步更改。

- 轻松测试 `Car`。  
    您可以传入测试替身以测试不同场景。例如，您可以创建一个名为 `FakeEngine` 的 `Engine` 测试替身，并针对不同的测试进行配置。

Android 中有两种主要的依赖项注入方式：

- **构造函数注入**  
    这就是上面描述的方式。您将某个类的依赖项传入其构造函数。

- **字段注入（或 setter 注入）**  
    某些 Android 框架类（如 activity 和 fragment）由系统实例化，因此无法进行构造函数注入。  
    使用字段注入时，依赖项将在创建类后实例化。
    代码如下所示：

    ```kotlin
    class Car {
        lateinit var engine: Engine

        fun start() {
            engine.start()
        }
    }

    fun main(args: Array) {
        val car = Car()
        car.engine = Engine()
        car.start()
    }
    ```

### 自动依赖项注入

在上一个示例中，您自行创建、提供并管理不同类的依赖项，而不依赖于库。  
这称为手动依赖项注入或人工依赖项注入。  
在 `Car` 示例中，只有一个依赖项，但依赖项和类越多，手动依赖项注入就越繁琐。  
手动依赖项注入还会带来多个问题：

- 对于大型应用，获取所有依赖项并正确连接它们可能需要大量样板代码。  
    在多层架构中，要为顶层创建一个对象，必须提供其下层的所有依赖项。  
    例如，要制造一辆真车，可能需要引擎、传动装置、底盘以及其他部件；而要制造引擎，则需要汽缸和火花塞。

- 如果您无法在传入依赖项之前构造依赖项（例如，当使用延迟初始化或将对象作用域限定为应用流时），则需要编写并维护管理内存中依赖项生命周期的自定义容器（或依赖关系图）。

有一些库通过自动执行创建和提供依赖项的过程解决此问题。它们归为两类：

- 基于反射的解决方案，可在运行时连接依赖项。

- 静态解决方案，可生成在编译时连接依赖项的代码。

[Dagger](https://dagger.dev/) 是适用于 Java、Kotlin 和 Android 的热门依赖项注入库，
由 Google 进行维护。  
Dagger 为您创建和管理依赖关系图，从而便于您在应用中使用 DI。  
它提供了完全静态和编译时依赖项，解决了基于反射的解决方案（如 [Guice](https://en.wikipedia.org/wiki/Google_Guice)）的诸多开发和性能问题。

## 依赖项注入的替代方法

依赖项注入的替代方法是使用[服务定位器](https://en.wikipedia.org/wiki/Service_locator_pattern)。  
服务定位器设计模式还改进了类与具体依赖项的分离。  
您可以创建一个名为服务定位器的类，该类创建和存储依赖项，然后按需提供这些依赖项。

```kotlin
object ServiceLocator {
    fun getEngine(): Engine = Engine()
}

class Car {
    private val engine = ServiceLocator.getEngine()

    fun start() {
        engine.start()
    }
}

fun main(args: Array) {
    val car = Car()
    car.start()
}
```

服务定位器模式与依赖项注入在元素使用方式上有所不同。  
使用服务定位器模式，类可以控制并请求注入对象；  
使用依赖项注入，应用可以控制并主动注入所需对象。

与依赖项注入相比：

- 服务定位器所需的依赖项集合使得代码更难测试，因为所有测试都必须与同一全局服务定位器进行交互。

- 依赖项在类实现中编码，而不是在 API Surface 中编码。
    因此，很难从外部了解类需要什么。  
    所以，更改 `Car` 或服务定位器中可用的依赖项可能会导致引用失败，从而导致运行时或测试失败。

- 如果您想将作用域限定为除了整个应用的生命周期之外的任何区间，就会更难管理对象的生命周期。

## 在 Android 应用中使用 Hilt

[Hilt](https://developer.android.google.cn/training/dependency-injection/hilt-android)
是推荐用于在 Android 中实现依赖项注入的 Jetpack 库。  
Hilt 通过为项目中的每个 Android 类提供容器并自动为您管理其生命周期，定义了一种在应用中执行 DI 的标准方法。

Hilt 在热门 DI 库
[Dagger](https://developer.android.google.cn/training/dependency-injection/dagger-basics)
的基础上构建而成，
因而能够受益于 Dagger 提供的编译时正确性、运行时性能、可伸缩性和 Android Studio 支持。

如需详细了解 Hilt，请参阅[使用 Hilt 实现依赖项注入](https://developer.android.google.cn/training/dependency-injection/hilt-android)。

## 总结

依赖项注入会为您的应用提供以下优势：

- 重用类以及分离依赖项：更容易换掉依赖项的实现。由于控制反转，代码重用得以改进，并且类不再控制其依赖项的创建方式，而是支持任何配置。

- 易于重构：依赖项成为 API Surface 的可验证部分，因此可以在创建对象时或编译时进行检查，而不是作为实现详情隐藏。

- 易于测试：类不管理其依赖项，因此在测试时，您可以传入不同的实现以测试所有不同用例。

如需充分了解依赖项注入的优势，您应该按照[手动依赖项注入](https://developer.android.google.cn/training/dependency-injection/manual)中的说明在应用中手动试用。

## 其他资源

[依赖项注入 - Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection)
