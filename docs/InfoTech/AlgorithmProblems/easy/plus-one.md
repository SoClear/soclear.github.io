# 加一

## 题目

给定一个由 **整数** 组成的 **非空** 数组所表示的非负整数，在该数的基础上加一。

最高位数字存放在数组的首位， 数组中每个元素只存储**单个**数字。

你可以假设除了整数 0 之外，这个整数不会以零开头。

**示例 1：**

```text
输入：digits = [1,2,3]
输出：[1,2,4]
解释：输入数组表示数字 123。
```

**示例 2：**

```text
输入：digits = [4,3,2,1]
输出：[4,3,2,2]
解释：输入数组表示数字 4321。
```

**示例 3：**

```text
输入：digits = [0]
输出：[1]
```

**提示：**

- `1 <= digits.length <= 100`
- `0 <= digits[i] <= 9`

## 题解

```kotlin
class Solution {
    fun plusOne(digits: IntArray): IntArray {
        // 倒着遍历
        for (i in digits.indices.reversed()) {
            if (digits[i] == 9) {
                // 是9变为0
                digits[i] = 0
            } else {
                // 不是9 则加一 返回
                digits[i]++
                return digits
            }
        }
        // 能走到这里说明全是9，加一为1后面带着digit位数的0
        return IntArray(digits.size + 1).apply {
            this[0] = 1
        }
    }
}
```
