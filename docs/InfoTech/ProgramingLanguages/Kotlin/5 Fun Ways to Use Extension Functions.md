# 5种有趣的扩展函数

## 1. Destructure Anything

```kotlin
import java.time.LocalDate

fun main() {
    operator fun LocalDate.component1(): Int = year
    operator fun LocalDate.component2(): Int = monthValue
    operator fun LocalDate.component3(): Int = dayOfMonth

    val today = LocalDate.now()
    val (year, month, day) = today
    println("$year-$month-$day")
}
```

## 2. Call Any Object

```kotlin
fun main() {
    operator fun Any?.invoke() {
        println(this)
    }
    "Hello, Kotlin!".invoke()
    1()
    true()
    null()
}
```

```kotlin
fun main() {
    operator fun Int.invoke(other: Int) = this + other
    val result = 3(2 + 5)
    println(result)
}
```

## 3. Index Anything

```kotlin
fun main() {
    val double: (Int) -> Int = { it * 2 }

    operator fun <T, R> ((T) -> R).get(param: T): R = this(param)

    operator fun <T, R> ((T) -> R).invoke(paramProvider: () -> T): R = this(paramProvider())

    val result = double(12)
    val result2 = double[12]
    val result3 = double { 12 }

    println(result)
    println(result2)
    println(result3)
}
```

```kotlin
fun main() {
    operator fun <K, V> TreeMap<K, V>.get(index: Int): V? {
        return this.values.elementAt(index)
    }

    val map = TreeMap<String, String>()

    map["b"] = "bravo"
    map["a"] = "alpha"
    map["d"] = "delta"
    map["e"] = "echo"
    map["c"] = "charlie"

    println(map["d"])
    println(map[3])
}
```

## 4. Create Factory Functions

```kotlin
class User(val name: String) {
    companion object
}

class UserRecord(val firstName: String, val lastName: String)

// 扩展 Companion
operator fun User.Companion.invoke(userRecord: UserRecord): User {
    return User("${userRecord.firstName} ${userRecord.lastName}")
}

// 当然，实现上述功能更常见的方式是
fun User(userRecord: UserRecord): User {
    return User("${userRecord.firstName} ${userRecord.lastName}")
}
```

```kotlin
operator fun Int.Companion.get(vararg items: Int): IntArray = intArrayOf(*items)

fun main() {
    val evenNumbers = Int[2, 4, 6, 8, 10]
    evenNumbers.forEach { println(it) }
}
```

## 5. Check "in" on Things

```kotlin
import java.time.LocalDate
import java.time.Month

fun main() {
    val date = LocalDate.parse("2016-02-15")
    operator fun Month.contains(date: LocalDate): Boolean = date.month == this
    operator fun Int.contains(date: LocalDate): Boolean = date.year == this
    println(date in Month.MARCH)
    println(date in Month.FEBRUARY)
    println(date in 2016)
    println(date in 2017)

    infix fun Month.of(year: Int): Pair<Month, Int> = this to year

    operator fun Pair<Month, Int>.contains(date: LocalDate): Boolean = date in first && date in second

    println(date in Month.FEBRUARY of 2016)
}
```

apple in basket 等价于 basket contains apple
