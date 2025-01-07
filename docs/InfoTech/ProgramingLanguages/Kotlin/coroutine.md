# coroutine

## call, return, yield

`A(B())` A 函数调用了 B 函数

||方向|执行|状态
|-|-|-|-
|call| A -> B | 暂停A执行 | 保存A的状态
|yield| B -> A | 暂停B执行 | 保存B的状态
|return| B -> A | 完成B的执行 | 消除B的状态

暂停当前函数执行，保存当前函数的状态，并返回到调用者是协程想要达成的效果。

```kotlin
import kotlin.coroutines.Continuation
import kotlin.coroutines.EmptyCoroutineContext
import kotlin.coroutines.intrinsics.COROUTINE_SUSPENDED
import kotlin.coroutines.intrinsics.createCoroutineUnintercepted
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine


val feedChickens = suspend {
    var chicken = 0
    println("Feeding chicken #${++chicken}")
    suspendCoroutine<Unit> { COROUTINE_SUSPENDED }
    println("Feeding chicken #${++chicken}")
    suspendCoroutine<Unit> { COROUTINE_SUSPENDED }
    println("Feeding chicken #${++chicken}")
    suspendCoroutine<Unit> { COROUTINE_SUSPENDED }
    println("Feeding chicken #${++chicken}")
    suspendCoroutine<Unit> { it.resume(Unit) }
}.createCoroutineUnintercepted(Continuation(EmptyCoroutineContext) {})

fun main() {
    var cow = 0
    println("Milking cow #${++cow}")
    feedChickens.resume(Unit)
    println("Milking cow #${++cow}")
    feedChickens.resume(Unit)
    println("Milking cow #${++cow}")
    feedChickens.resume(Unit)
    println("Milking cow #${++cow}")
    feedChickens.resume(Unit)
}
```

执行结果为

```txt
Milking cow #1
Feeding chicken #1
Milking cow #2
Feeding chicken #2
Milking cow #3
Feeding chicken #3
Milking cow #4
Feeding chicken #4
```
