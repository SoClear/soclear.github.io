# 不使用泛型的型变

## 协变

```kotlin
interface VendingMachine {
    fun purchase(money:Coin) :Snack
}

class SimpleVendingMachine : VendingMachine {
    override fun purchase(money: Coin): CandyBar = CandyBar()
}
```

可以看到 `SimpleVendingMachine` 比较 `VendingMachine` 更加具体，同时 `CandyBar` 比 `Snack` 更具体。 容器类和返回值都变得更加具体了，所以这叫做 **协变**。

## 逆变

```kotlin
interface VendingMachine {
    val purchase: (Coin) -> Snack
}

class SimpleVendingMachine : VendingMachine {
    override val purchase: (Money) -> CandyBar = { CandyBar() }
}
```

`SimpleVendingMachine` 比 `VendingMachine` 更加具体，但是 `Money` 比 `Coin` 更通用。容器类更具体而参数更通用，所以这叫做 **逆变**。

## 总结

在子类型中，返回值类型可以更加具体，称作协变；参数类型可以更加通用，称作逆变。

```kotlin
interface VendingMachine<in T, out R> {
    val purchase: (T) -> R
}
```

`VendingMachine` 接口有两个泛型参数，`T` 是输入类型，`R` 是输出类型。  
`in` 表示它只能用在输入参数上，是逆变；`out` 表示它只能用在返回值上，是协变。  
`T` 是输入类型，所以 `T` 可以更加通用，所以 `T` 是逆变的；`R` 是输出类型，所以 `R` 可以更加具体，所以 `R` 是协变的。

这样 `VendingMachine<Money, CandyBar>` 作为 `VendingMachine<Coin, Snack>` 的子类型是允许的。
