# 两数之和

## 题目

给定一个整数数组 `nums`和一个整数目标值 `target`，请你在该数组中找出 **和为目标值** _`target`_的那**两个**整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。

**示例 1：**

```text
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
```

**示例 2：**

```text
输入：nums = [3,2,4], target = 6
输出：[1,2]
```

**示例 3：**

```text
输入：nums = [3,3], target = 6
输出：[0,1]
```

**提示：**

<ul>
 <li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
 <li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>
 <li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>
 <li><strong>只会存在一个有效答案</strong></li>
</ul>

**进阶：** 你可以想出一个时间复杂度小于 <code>O(n<sup>2</sup>)</code> 的算法吗？

## 题解

用HashMap

kotlin

```kotlin
class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        // hashMap中Key是元素，Value是其索引
        val hashMap = HashMap<Int, Int>()
        // num是当前元素，index是它的索引
        nums.forEachIndexed { index, num ->
            // 如果hashMap的键中包含target-当前元素，即当前元素值+某个Key值==target
            if (hashMap.containsKey(target - num)) {
                // 返回索引
                return intArrayOf(hashMap[target - num]!!, index)
            }
            // 赋值，key是元素，value是索引
            hashMap[num] = index
        }
        return intArrayOf(-1, -1)
    }
}
``` 
