# 聚合函数 (Aggregate Functions)

## 1. 简介

聚合函数的作用是从一组数据（多行）中计算并返回单个值。它们通常与 `GROUP BY` 子句结合使用，用于生成统计报表，如计算总和、平均值或计数。

SQLite 支持标准 SQL 的聚合函数，并提供了一些特有的增强功能。

## 2. 示例数据环境

为了演示，假设我们需要分析一张 **sales (销售表)**：

| id | product | category | amount |
| :--- | :--- | :--- | :--- |
| 1 | 鼠标 | 电子 | 100 |
| 2 | 键盘 | 电子 | 200 |
| 3 | T恤 | 服装 | 50 |
| 4 | 牛仔裤 | 服装 | NULL |
| 5 | 显示器 | 电子 | 1000 |

*注意：第 4 行的 amount 为 NULL。*

## 3. 标准聚合函数

### 3.1 COUNT (计数)

计算行数或非 NULL 值的数量。

- `COUNT(*)`: 计算所有行，**包括** NULL 值。
- `COUNT(column)`: 计算指定列中**非 NULL** 的行数。

```sql
SELECT 
    COUNT(*) AS total_rows,        -- 结果: 5
    COUNT(amount) AS valid_sales   -- 结果: 4 (忽略了 NULL)
FROM sales;
```

### 3.2 SUM (求和)

计算数值列的总和。**自动忽略 NULL 值**。如果所有值均为 NULL，结果返回 NULL（而不是 0）。

```sql
SELECT SUM(amount) FROM sales; 
-- 结果: 1350 (100+200+50+1000)
```

### 3.3 AVG (平均值)

计算数值列的平均值。
**算法逻辑**：`SUM(column) / COUNT(column)`。它只统计非 NULL 的行作为分母。

```sql
SELECT AVG(amount) FROM sales;
-- 结果: 337.5 (1350 / 4)
-- 注意：不是除以 5，因为有一行是 NULL
```

### 3.4 MIN / MAX (极值)

查找一组数值中的最小值或最大值。也可用于文本（按字典序）或日期。

```sql
SELECT 
    MIN(amount) AS min_val,  -- 结果: 50
    MAX(amount) AS max_val   -- 结果: 1000
FROM sales;
```

## 4. 字符串聚合：GROUP_CONCAT

这是 SQLite 中非常实用且特有的函数（其他数据库可能有 `STRING_AGG`）。它将组内非 NULL 的字符串连接成一个长字符串。

**语法：** `group_concat(column, separator)`

- `separator` 默认为逗号 `,`。

**场景：** 列出每个分类下包含的所有产品名称。

```sql
SELECT 
    category,
    group_concat(product, ' | ') AS products_list
FROM sales
GROUP BY category;
```

**结果：**

| category | products_list |
| :--- | :--- |
| 电子 | 鼠标 \| 键盘 \| 显示器 |
| 服装 | T恤 \| 牛仔裤 |

*注意：输出顺序通常是不确定的，除非在子查询中预先排序。*

## 5. 核心搭档：GROUP BY 和 HAVING

聚合函数的真正威力在于配合分组使用。

### 5.1 GROUP BY

将结果集按一个或多个列进行分组，聚合函数将分别计算每个组的值。

**场景：** 计算每个分类的销售总额。

```sql
SELECT category, SUM(amount) AS total
FROM sales
GROUP BY category;
```

### 5.2 HAVING

`WHERE` 子句过滤**行**（在分组前执行）。
`HAVING` 子句过滤**分组后的结果**（在分组后执行）。

**场景：** 找出销售总额超过 500 的分类。

```sql
SELECT category, SUM(amount) AS total
FROM sales
GROUP BY category
HAVING total > 500;
```

## 6. DISTINCT 去重统计

聚合函数可以与 `DISTINCT` 关键字结合，先去除重复值再进行计算。

**场景：** 统计有多少个不同的销售金额（即去掉重复的价格）。

```sql
SELECT COUNT(DISTINCT amount) FROM sales;
-- 结果: 3 (分别是 100, 200, 50, 1000)
-- 注意：原始数据中有两个 100，这里只算一次。
```

## 7. 进阶特性：FILTER 子句 (SQLite 3.30+)

在 SQLite 3.30.0（2019年发布）及更高版本中，聚合函数支持标准的 SQL `FILTER` 子句。这允许你在聚合函数内部直接添加条件，而不需要复杂的 `CASE WHEN` 语句。

**场景：** 在一条 SQL 中同时统计“电子产品总销量”和“服装总销量”。

**旧写法 (CASE WHEN):**

```sql
SELECT 
    SUM(CASE WHEN category='电子' THEN amount ELSE 0 END) AS elec_sum,
    SUM(CASE WHEN category='服装' THEN amount ELSE 0 END) AS cloth_sum
FROM sales;
```

**新写法 (FILTER):**

```sql
SELECT 
    SUM(amount) FILTER (WHERE category='电子') AS elec_sum,
    SUM(amount) FILTER (WHERE category='服装') AS cloth_sum
FROM sales;
```

这种写法更易读，且意图更清晰。

## 8. 常见陷阱与注意事项

1. **NULL 值的传播**：
    除了 `COUNT(*)`，大多数聚合函数都会忽略 NULL。但要注意，`SUM` 如果遇到全是 NULL 的组，结果是 NULL，如果希望结果是 0，可以使用 `TOTAL()` 函数（SQLite 特有），或者 `COALESCE(SUM(col), 0)`。
    - `TOTAL(column)`：总是返回浮点数，且遇到全 NULL 时返回 0.0。

2. **SELECT 列表中的非聚合列**：
    SQLite 有一个著名的“怪癖”（Quirk）。在 `GROUP BY` 查询中，如果你 SELECT 了不在 `GROUP BY` 列表中的列，且没有对其使用聚合函数，SQLite 会从该组中**随机**选择一行返回该列的值（通常是第一行，但不保证）。
    - **建议**：在标准 SQL 模式下，SELECT 列表中的列必须要么在 GROUP BY 中，要么包含在聚合函数中。

    ```sql
    -- 不推荐的写法（结果不可预测）
    SELECT category, product, SUM(amount) 
    FROM sales GROUP BY category;
    -- product 列会随机显示该分类下的某一个产品
    ```

## 9. 总结

- 使用 `COUNT`、`SUM`、`AVG`、`MIN`、`MAX` 进行基础统计。
- 使用 `GROUP_CONCAT` 进行字符串合并。
- 使用 `GROUP BY` 进行分组，使用 `HAVING` 过滤分组结果。
- 使用 `FILTER` 子句（SQLite 3.30+）进行更灵活的条件聚合。
- 务必注意 `NULL` 值在聚合计算中的表现。
