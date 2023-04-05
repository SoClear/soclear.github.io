# 重复字符串n次

我们知道，任意一个正整数都可以用2的幂的多项式表示，也就是二进制数表示十进制数的方法，

例如 11 = 1*(2^0) + 1*(2^1) + 0*(2^2) + 1*(2^3) ，其中括号前的常数就是11转成二进制1011，从低到高位的二进制数，所以代码中才有n & 1为1时才会做求和操作（n & 1相当于n对2取余，而这个余数正好是二进制数）

```javascript
function repeat (str, n) {
  let result = ''
  if (n > 0) {
    while (true) {
        // 相当于除以2取余数，为1则拼接字符串
      if (n & 1) { 
        result += str
      }
      // 无符号右移
      n >>>= 1
      if (n <= 0) break
      // str倍增
      str += str
    }
  }
  return result
}
```

```kotlin
operator fun String.times(times: Int) = buildString {
    if (times <= 0) {
        return@buildString
    }
    var n = times
    var string = this@times
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
