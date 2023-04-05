# 最后一个单词的长度

## 题目

给你一个字符串 s，由若干单词组成，单词前后用一些空格字符隔开。返回字符串中 最后一个 单词的长度。

单词 是指仅由字母组成、不包含任何空格字符的最大子字符串。

**示例 1：**

```text
输入：s = "Hello World"
输出：5
解释：最后一个单词是“World”，长度为5。
```

**示例 2：**

```text
输入：s = "   fly me   to   the moon  "
输出：4
解释：最后一个单词是“moon”，长度为4。
```

**示例 3：**

```text
输入：s = "luffy is still joyboy"
输出：6
解释：最后一个单词是长度为6的“joyboy”。
```

## 题解

### 直接的split

此方法效率较低

```kotlin
class Solution {
    fun lengthOfLastWord(s: String): Int {
        return s.split(' ').last { it.isNotBlank() }.length
    }
}
```

### 调用标准库

```kotlin
class Solution {
    fun lengthOfLastWord(s: String): Int {
        // 去除前后空格
        val str = s.trim()
        // 再求长度减去最后一个空格的索引值再减一
        return str.length - str.lastIndexOf(' ') - 1
    }
}
```

### 正经的反向遍历

题目要求得到字符串中最后一个单词的长度，可以反向遍历字符串，寻找最后一个单词并计算其长度。

由于字符串中至少存在一个单词，因此字符串中一定有字母。首先找到字符串中的最后一个字母，该字母即为最后一个单词的最后一个字母。

从最后一个字母开始继续反向遍历字符串，直到遇到空格或者到达字符串的起始位置。遍历到的每个字母都是最后一个单词中的字母，因此遍历到的字母数量即为最后一个单词的长度。

```kotlin
class Solution {
    fun lengthOfLastWord(s: String): Int {
        var index = s.length - 1
        while (s[index] == ' ') {
            index--
        }
        var wordLength = 0
        while (index >= 0 && s[index] != ' ') {
            wordLength++
            index--
        }
        return wordLength
    }
}
```

复杂度分析

时间复杂度：O(n)，其中 n 是字符串的长度。最多需要反向遍历字符串一次。

空间复杂度：O(1)。
