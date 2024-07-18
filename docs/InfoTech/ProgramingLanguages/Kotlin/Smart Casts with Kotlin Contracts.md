# contact用于智能类型转换的例子

```kotlin
sealed class User() {
    @OptIn(ExperimentalContracts::class)
    fun isAuthenticated(): Boolean {
        contract {
            returns(true) implies (this@User is Authenticated)
            returns(false) implies (this@User is Anonymous)
        }
        return this is Authenticated
    }

    object Anonymous : User() {
        fun promptToSignIn() = println("Please sing in.")
    }

    class Authenticated(private val username: String) : User() {
        fun greet() = println("Welcome, $username")
    }
}

fun onScreenLoaded(user: User) = if (user.isAuthenticated()) user.greet() else user.promptToSignIn()
```

`implies` 左侧是结果（Effect），右侧是条件（Condition）。

这样 `onScreenLoaded` 函数中 `else` 之后的代码也能正常编译。
