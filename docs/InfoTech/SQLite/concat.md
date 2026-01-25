# 拼接字段

在 SQLite 中，拼接字段的情况稍微特殊一点，因为它在很长一段时间里只支持操作符，直到最近的版本才加入了标准的拼接函数。

以下是针对 **SQLite** 的 `||` 操作符和 `CONCAT` 相关函数的详细讲解：

## 1. 核心操作符：双竖线 `||` (最常用、兼容性最好)

这是 SQLite 中最传统、最基础的拼接方式。无论你的 SQLite 版本多老（包括 Android 或 iOS 内置的老版本），这个方法都一定能用。

### 基本用法

```sql
SELECT 'Hello' || ' ' || 'World'; 
-- 结果: 'Hello World'

SELECT FirstName || ' ' || LastName FROM Customers;

SELECT FirstName || ' ' || LastName AS FullName FROM Customers;
```

### 特性与坑点

1. **自动类型转换**：
    SQLite 是弱类型的，如果你拼接数字，它会自动把数字转成字符串处理，不会像 SQL Server 那样报错。

    ```sql
    SELECT 'Order No: ' || 1001;
    -- 结果: 'Order No: 1001'
    ```

2. **致命的 NULL 传播**：
    这是 `||` 最大的痛点。**只要拼接的内容里有一个是 NULL，整个结果就是 NULL**。

    ```sql
    SELECT 'User: ' || NULL;
    -- 结果: NULL (而不是 'User: ')
    ```

### 解决方案 (处理 NULL)

如果你想避免 NULL 吞掉整个字符串，必须使用 `IFNULL()` 或 `COALESCE()` 函数包裹字段：

```sql
-- 如果 MiddleName 是 NULL，就用空字符串 '' 代替
SELECT FirstName || IFNULL(MiddleName, '') || LastName 
FROM Users;
```

---

## 2. 新增函数：`CONCAT()` 和 `CONCAT_WS()`

**注意：** 这两个函数是 **SQLite 3.44.0** (发布于 2023年11月) 才加入的。
如果你在使用较老的系统（如旧版 Android、旧 Linux 发行版），这两个函数可能**报错说找不到**。

### A. `CONCAT(X, Y, ...)`

它的作用和 `||` 类似，但有一个巨大的改进：**它会把 NULL 视为空字符串**，而不是让整个结果变 NULL。

* **用法：**

    ```sql
    -- 假设 Table 中 field_b 是 NULL
    SELECT CONCAT('Field A: ', field_a, ', Field B: ', field_b);
    ```

    *结果会正常显示 field_a 的内容，直接忽略 field_b 的 NULL。*

### B. `CONCAT_WS(separator, X, Y, ...)`

WS = With Separator (带分隔符)。这是拼接多个字段最优雅的方式。

* 第一个参数是分隔符。
* 自动忽略 NULL 值（跳过不拼）。

* **用法：**

    ```sql
    -- 拼接地址，用逗号隔开
    SELECT CONCAT_WS(', ', City, State, ZipCode) FROM Addresses;
    ```

    *如果 State 是 NULL，结果会自动变成 "City, ZipCode"，不会多出一个逗号。*

---

## 3. 聚合拼接：`GROUP_CONCAT()`

这是 SQLite 中非常强大的一个函数，用于将**多行**数据合并成**一行**字符串（例如：把一个订单下的所有商品名拼在一起）。这个函数在所有 SQLite 版本中都可用。

### 基本用法

`GROUP_CONCAT(字段名, 分隔符)`

```sql
-- 假设有一个 Tags 表
-- +---------+-------+
-- | post_id | tag   |
-- +---------+-------+
-- | 1       | SQL   |
-- | 1       | Code  |
-- | 2       | Java  |
-- +---------+-------+

SELECT post_id, GROUP_CONCAT(tag, ', ') 
FROM Tags
GROUP BY post_id;
```

**结果：**

| post_id | GROUP_CONCAT(tag, ', ') |
| :--- | :--- |
| 1 | SQL, Code |
| 2 | Java |

*如果不指定第二个参数（分隔符），默认使用逗号 `,`。*

---

## 总结：我该用哪个？

| 场景 | 推荐方式 | 原因 |
| :--- | :--- | :--- |
| **通用简单拼接** | `\|\|` | 所有版本都支持，代码移植性最强。 |
| **字段可能含 NULL** | `\|\|` + `IFNULL()` | 为了兼容老版本，这是最稳妥的写法。 |
| **确定环境较新 (3.44+)** | `CONCAT()` | 写法更简洁，自动处理 NULL。 |
| **带分隔符拼接** | `CONCAT_WS()` | (需新版本) 逻辑最清晰，自动处理多余分隔符。 |
| **多行变一行** | `GROUP_CONCAT()` | 聚合查询的唯一选择。 |

**一句话建议：**
如果你在开发移动端 App（Android/iOS）或者嵌入式设备，除非你能确定内置的 SQLite 库非常新，否则**请坚持使用 `||` 配合 `IFNULL`**，这样能避免程序崩溃。
