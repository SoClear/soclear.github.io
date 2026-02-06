# INTERSECT

## 1. 概述

`INTERSECT` 是 SQLite 中的一种集合运算符。它用于比较两个 `SELECT` 语句的结果集，并返回同时存在于两个结果集中的行。

简单来说，它的作用是**集合交集**（Set Intersection）。如果你有两个列表 A 和 B，`A INTERSECT B` 的结果就是既属于 A 又属于 B 的公共部分。

## 2. 语法

基本语法如下：

```sql
SELECT column1, column2, ...
FROM table1
[WHERE conditions]
INTERSECT
SELECT column1, column2, ...
FROM table2
[WHERE conditions];
```

## 3. 运行机制与规则

在使用 `INTERSECT` 时，必须遵守以下规则：

1. **列数相同**：参与运算的两个 `SELECT` 语句必须返回相同数量的列。
2. **数据类型兼容**：对应位置的列的数据类型应当兼容。
3. **自动去重**：`INTERSECT` 运算符会自动去除结果集中的重复行（隐含了 `DISTINCT` 的行为）。即使两张表中都有多条相同的记录，结果中也只会出现一次。
4. **列名来源**：最终结果集的列名通常由第一个 `SELECT` 语句决定。
5. **排序**：`ORDER BY` 子句必须放在整个查询的最后。

## 4. 实战演示

为了演示 `INTERSECT` 的用法，我们沿用之前的 `books_a` 和 `books_b` 表结构与数据。

### 4.1 数据准备

如果你尚未创建表，请执行以下 SQL：

```sql
-- 创建表
CREATE TABLE books_a (
    id INTEGER PRIMARY KEY,
    title TEXT
);

CREATE TABLE books_b (
    id INTEGER PRIMARY KEY,
    title TEXT
);

-- 插入数据
-- 书单 A: 1, 2, 3
INSERT INTO books_a (id, title) VALUES (1, 'SQLite 基础教程');
INSERT INTO books_a (id, title) VALUES (2, 'Python 编程指南');
INSERT INTO books_a (id, title) VALUES (3, 'Web 开发实战');

-- 书单 B: 2, 4
INSERT INTO books_b (id, title) VALUES (2, 'Python 编程指南');
INSERT INTO books_b (id, title) VALUES (4, '算法导论');
```

**当前数据状态：**

- **books_a**: [1, 2, 3]
- **books_b**: [2, 4]
- **公共数据**: ID 为 2 的记录。

### 4.2 示例 1：基础查询

**需求**：找出两个书单中都存在的书籍 ID。

```sql
SELECT id FROM books_a
INTERSECT
SELECT id FROM books_b;
```

**结果：**

| id |
| :--- |
| 2 |

**解析**：

- 只有 ID 2 同时存在于两张表中，因此被返回。
- ID 1, 3 仅在 A 中，ID 4 仅在 B 中，均被排除。

### 4.3 示例 2：多列比较

**需求**：找出 ID 和 标题 都完全相同的书籍。

```sql
SELECT id, title FROM books_a
INTERSECT
SELECT id, title FROM books_b;
```

**结果：**

| id | title |
| :--- | :--- |
| 2 | Python 编程指南 |

### 4.4 示例 3：结合 ORDER BY 排序

虽然本例数据较少，但在实际业务中，我们通常需要对交集结果进行排序。

```sql
SELECT id, title FROM books_a
INTERSECT
SELECT id, title FROM books_b
ORDER BY id DESC;
```

## 5. 进阶：INTERSECT 与 NULL 值

SQLite 的集合运算符对 `NULL` 值的处理非常独特。在 `INTERSECT` 中，`NULL` 被视为与其他 `NULL` 相等。

- 如果表 A 中有一行数据为 `NULL`。
- 如果表 B 中对应也有一行数据为 `NULL`。
- `INTERSECT` 运算会将这两个 `NULL` 视为匹配，并将其包含在结果集中。

这与标准的比较运算符（如 `=`）不同，后者 `NULL = NULL` 的结果通常不是 True。

## 6. INTERSECT 与 INNER JOIN 的区别

虽然 `INTERSECT` 和 `INNER JOIN` 都可以用来查找两张表的公共数据，但它们有本质区别：

1. **去重机制**：
    - `INTERSECT` 总是返回唯一行。如果两张表中都有 5 条相同的记录，`INTERSECT` 只返回 1 条。
    - `INNER JOIN` 不会自动去重。如果两张表都有 5 条相同的记录，`JOIN` 可能会产生 25 条记录（笛卡尔积），除非显式使用 `DISTINCT`。
2. **NULL 处理**：
    - `INTERSECT` 会匹配 `NULL` 值。
    - `INNER JOIN` 在使用 `ON a.col = b.col` 条件时，不会匹配 `NULL`，因为 SQL 中 `NULL = NULL` 为假（或未知）。
3. **列的灵活性**：
    - `INTERSECT` 要求两个查询的列结构必须一致（类似上下堆叠）。
    - `INNER JOIN` 可以横向拼接不同表的列（例如：`SELECT a.id, b.remark ...`）。

## 7. 总结

- 使用 `INTERSECT` 查找两个数据集的**共同部分**。
- 它对结果集执行隐式的 `DISTINCT` 操作，不包含重复项。
- 它将 `NULL` 值视为相等。
- 在仅比较数据存在性而不需提取其他表字段时，`INTERSECT` 语法通常比 `INNER JOIN` 更简洁直观。
