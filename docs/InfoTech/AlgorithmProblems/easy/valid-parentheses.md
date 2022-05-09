# 有效的括号

## 题目

给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串 `s` ，判断字符串是否有效。

有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。

**示例 1：**

```text
输入：s = "()"
输出：true
```

**示例 2：**

```text
输入：s = "()[]{}"
输出：true
```

**示例 3：**

```text
输入：s = "(]"
输出：false
```

**示例 4：**

```text
输入：s = "([)]"
输出：false
```

**示例 5：**

```text
输入：s = "{[]}"
输出：true
```

**提示：**

- `1 <= s.length <= 104`
- `s` 仅由括号 `'()[]{}'` 组成

## 题解

### 栈

判断括号的有效性可以使用「栈」这一数据结构来解决。

我们遍历给定的字符串 `s` 。当我们遇到一个左括号时，我们会期望在后续的遍历中，有一个相同类型的右括号将其闭合。由于**后遇到的左括号要先闭合**，因此我们可以将这个左括号放入栈顶。

当我们遇到一个右括号时，我们需要将一个相同类型的左括号闭合。此时，我们可以取出栈顶的左括号并判断它们是否是相同类型的括号。如果不是相同的类型，或者栈中并没有左括号，那么字符串 `s` 无效，返回 `false`。

在遍历结束后，如果栈中没有左括号，说明我们将字符串 `s` 中的所有左括号闭合，返回 `true` ，否则返回 `false`。

kotlin

```kotlin
class Solution {
    fun isValid(s: String): Boolean {
        val stack = Stack<Char>()
        s.forEach {
            // 如果是左括号就入栈
            if (it == '(' || it == '[' || it == '{') {
                stack.push(it);
            }
            // 如果遍历过程中，栈就空了，说明不匹配
            if (stack.isEmpty() ||
                // 因为后遇到的左括号要先闭合，所以碰见右括号时，如果不能与栈顶的左括号匹配就说明发生了错误。
                // 如果当前是右括号，但栈顶不是左括号，则不匹配
                it == ')' && stack.pop() != '(' ||
                it == ']' && stack.pop() != '[' ||
                it == '}' && stack.pop() != '{'
            ) {
                return false
            }
        }
        // 栈空才是全部匹配
        return stack.isEmpty()
    }
}
```

### 鬼才解法（但是较慢）

kotlin

```kotlin
class Solution {
    fun isValid(s: String): Boolean {
        var str=s
        while (true){
            str=str.replace("()","")
            str=str.replace("[]","")
            str=str.replace("{}","")
            if (str.length==s.length){
                return str.isEmpty()
            }
        }
    }
}
```
