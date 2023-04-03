# 重复字符串n次

```kotlin
operator fun String.times(times: Int) = buildString {
    var n = times
    var string = this@times
    if (n <= 0) {
        return@buildString
    }
    while (true) {
        if (n and 1 == 1) {
            append(string)
        }
        n = n ushr 1
        if (n <= 0) {
            break
        }
        string += string
    }
}

operator fun Int.times(string: String) = string * this
```
