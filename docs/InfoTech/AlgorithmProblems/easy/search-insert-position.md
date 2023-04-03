# 搜索插入位置

## 题目

给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

请必须使用时间复杂度为 `O(log n)` 的算法。

**示例 1:**

```text
输入: nums = [1,3,5,6], target = 5
输出: 2
```

**示例 2:**

```text
输入: nums = [1,3,5,6], target = 2
输出: 1
```

**示例 3:**

```text
输入: nums = [1,3,5,6], target = 7
输出: 4
```

**提示:**

- `1 <= nums.length <= 104`
- `-104 <= nums[i] <= 104`
- `nums` 为 **无重复元素** 的 **升序** 排列数组
- `-104 <= target <= 104`

## 题解

因为要使用时间复杂度为`O(log n)`的算法，所以不能用从左到右的搜索方法（虽然用从左到右的搜索方法在力扣的几个例子里时间最短）。于是用二分查找。

## kotlin标准库

binarySearch函数，如果找到则返回索引，如果没找到则返回倒转后的插入点(-插入索引 - 1)

```kotlin
class Solution {
    fun searchInsert(nums: IntArray, target: Int): Int {
        val b = nums.binarySearch(target)
        return if (b >= 0) b else -(b + 1)
    }
}
```

## 手写二分查找

```kotlin
class Solution {
    fun searchInsert(nums: IntArray, target: Int): Int {
        var left = 0
        var right = nums.lastIndex
        while (left <= right) {
            // 左边left是初始偏移，右边(right - left) / 2 是取一半
            val mid = left + (right - left) / 2
            if (nums[mid] < target) left = mid + 1 else right = mid - 1
        }
        return left
    }
}
```
