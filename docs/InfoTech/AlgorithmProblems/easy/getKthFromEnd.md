# 单向链表倒第 k 个节点

给到一个单向链表，要求找出该链表中倒数第 k 个节点，要求只能遍历一次链表，且空间复杂度为 O(1)

## 题解

要在单向链表中找到倒数第 $k$ 个节点，且要求 **只能遍历一次链表** 和 **空间复杂度为 $O(1)$**，最经典的解法是使用 **双指针法（快慢指针）**。

### 算法思路

1. 定义两个指针：`fast`（快指针）和 `slow`（慢指针），初始都指向链表的头节点 `head`。
2. 先让 `fast` 指针向前移动 $k$ 步。
3. 此时 `fast` 和 `slow` 之间相隔了 $k$ 个节点。
4. 接着，让 `fast` 和 `slow` 同时每次向后移动一步，直到 `fast` 指向 `null`（即到达链表末尾）。
5. 因为两者的距离始终保持不变，当 `fast` 走到链表尽头时，`slow` 刚好停留在倒数第 $k$ 个节点上。

### Java 代码实现

```java
// 定义单向链表节点
class ListNode {
    int val;
    ListNode next;
    
    ListNode(int val) {
        this.val = val;
    }
}

public class Solution {
    
    /**
     * 获取链表中倒数第 k 个节点
     * @param head 链表头节点
     * @param k 倒数第 k 个位置
     * @return 倒数第 k 个节点，如果不存在则返回 null
     */
    public ListNode getKthFromEnd(ListNode head, int k) {
        // 处理边界条件
        if (head == null || k <= 0) {
            return null;
        }
        
        ListNode fast = head;
        ListNode slow = head;
        
        // 1. fast 指针先向前走 k 步
        for (int i = 0; i < k; i++) {
            // 如果链表长度小于 k，直接返回 null
            if (fast == null) {
                return null;
            }
            fast = fast.next;
        }
        
        // 2. fast 和 slow 同时向前走，直到 fast 指向 null
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }
        
        // 3. 此时 slow 指向的就是倒数第 k 个节点
        return slow;
    }
}
```
