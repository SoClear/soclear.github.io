# 最大子数组和

## 题目

给你一个整数数组 `nums` ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

**子数组** 是数组中的一个连续部分。

**示例 1：**

```text
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6 。
```

**示例 2：**

```text
输入：nums = [1]
输出：1
```

**示例 3：**

```text
输入：nums = [5,4,-1,7,8]
输出：23
```

**提示：**

- `1 <= nums.length <= 105`
- `-104 <= nums[i] <= 104`

**进阶：**如果你已经实现复杂度为 `O(n)` 的解法，尝试使用更为精妙的 **分治法** 求解。

## 题解

### 动态规划

假设 `nums` 数组的长度是 `n`，下标从 `0` 到 `n-1`。

我们用 `f(i)` 代表以第 `i` 个数结尾的「连续子数组的最大和」，那么很显然我们要求的答案就是：

<p class="katex-block"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><munder><mo><mi>max</mi><mo>⁡</mo></mo><mrow><mn>0</mn><mo>≤</mo><mi>i</mi><mo>≤</mo><mi>n</mi><mo>−</mo><mn>1</mn></mrow></munder><mo stretchy="false">{</mo><mi>f</mi><mo stretchy="false">(</mo><mi>i</mi><mo stretchy="false">)</mo><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\max_{0 \leq i \leq n-1} \{ f(i) \}
</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.572843em;vertical-align:-0.822843em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.43055999999999994em;"><span style="top:-2.372336em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0</span><span class="mrel mtight">≤</span><span class="mord mathdefault mtight">i</span><span class="mrel mtight">≤</span><span class="mord mathdefault mtight">n</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.822843em;"><span></span></span></span></span></span><span class="mopen">{</span><span class="mord mathdefault" style="margin-right:0.10764em;">f</span><span class="mopen">(</span><span class="mord mathdefault">i</span><span class="mclose">)</span><span class="mclose">}</span></span></span></span></span></p>

因此我们只需要求出每个位置的 `f(i)`，然后返回 `f` 数组中的最大值即可。那么我们如何求 `f(i)` 呢？我们可以考虑 `nums[i]` 单独成为一段还是加入 f(i-1)f(i−1) 对应的那一段，这取决于 `nums[i]` 和 `f(i-1) + nums[i]` 的大小，我们希望获得一个比较大的，于是可以写出这样的动态规划转移方程：

<p class="katex-block"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>i</mi><mo stretchy="false">)</mo><mo>=</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">{</mo><mi>f</mi><mo stretchy="false">(</mo><mi>i</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo>+</mo><mtext mathvariant="italic">nums</mtext><mo stretchy="false">[</mo><mi>i</mi><mo stretchy="false">]</mo><mo separator="true">,</mo><mtext mathvariant="italic">nums</mtext><mo stretchy="false">[</mo><mi>i</mi><mo stretchy="false">]</mo><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">f(i) = \max \{ f(i-1) + \textit{nums}[i], \textit{nums}[i] \} 
</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathdefault" style="margin-right:0.10764em;">f</span><span class="mopen">(</span><span class="mord mathdefault">i</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2777777777777778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">max</span><span class="mopen">{</span><span class="mord mathdefault" style="margin-right:0.10764em;">f</span><span class="mopen">(</span><span class="mord mathdefault">i</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222222222222222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord textit">nums</span></span><span class="mopen">[</span><span class="mord mathdefault">i</span><span class="mclose">]</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.16666666666666666em;"></span><span class="mord text"><span class="mord textit">nums</span></span><span class="mopen">[</span><span class="mord mathdefault">i</span><span class="mclose">]</span><span class="mclose">}</span></span></span></span></span></p>

不难给出一个时间复杂度 `O(n)`、空间复杂度 `O(n)` 的实现，即用一个 `f` 数组来保存 `f(i)` 的值，用一个循环求出所有 `f(i)`。考虑到 `f(i)` 只和 `f(i-1)` 相关，于是我们可以只用一个变量 `pre` 来维护对于当前 `f(i)` 的 `f(i-1)` 的值是多少，从而让空间复杂度降低到 `O(1)`，这有点类似「滚动数组」的思想。

kotlin

```kotlin
class Solution {
    fun maxSubArray(nums: IntArray): Int {
        var previous = 0
        var maxAnswer = nums.first()
        nums.forEach {
            previous = max(previous + it, it)
            maxAnswer = max(maxAnswer, previous)
        }
        return maxAnswer
    }
}
```
