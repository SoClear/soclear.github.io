# EXCEPT

## 1. 概述

`EXCEPT` 是 SQLite 中的一种集合运算符。它用于比较两个 `SELECT` 语句的结果集，并返回存在于第一个 `SELECT` 语句中但**不**存在于第二个 `SELECT` 语句中的唯一行。

简单来说，它的作用是**集合减法**（Set Subtraction）。如果你有两个列表 A 和 B，`A EXCEPT B` 的结果就是属于 A 但不属于 B 的部分。

**注意：** 在某些其他数据库（如 Oracle）中，此功能称为 `MINUS`。在 SQLite 中，请使用 `EXCEPT`。

## 2. 语法

基本语法如下：

```sql
SELECT column1, column2, ...
FROM table1
[WHERE conditions]
EXCEPT
SELECT column1, column2, ...
FROM table2
[WHERE conditions];
```

## 3. 运行机制与规则

在使用 `EXCEPT` 时，必须遵守以下规则：

1. **列数相同**：两个 `SELECT` 语句返回的列数必须完全相同。
2. **数据类型兼容**：对应位置的列的数据类型应当兼容（虽然 SQLite 是弱类型的，但为了逻辑正确性，建议类型一致）。
3. **自动去重**：`EXCEPT` 运算符会自动去除结果集中的重复行（隐含了 `DISTINCT` 的行为）。
4. **列名来源**：最终结果集的列名由第一个 `SELECT` 语句决定。
5. **排序**：如果需要对结果排序，`ORDER BY` 子句必须放在最后一个 `SELECT` 语句之后。

## 4. 实战演示

为了演示 `EXCEPT` 的用法，我们将创建两个模拟表：`books_a`（书单 A）和 `books_b`（书单 B）。

### 4.1 数据准备

请在 SQLite 命令行或客户端中执行以下 SQL 语句来初始化数据：

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
-- 书单 A 包含 ID 1, 2, 3
INSERT INTO books_a (id, title) VALUES (1, 'SQLite 基础教程');
INSERT INTO books_a (id, title) VALUES (2, 'Python 编程指南');
INSERT INTO books_a (id, title) VALUES (3, 'Web 开发实战');

-- 书单 B 包含 ID 2, 4
INSERT INTO books_b (id, title) VALUES (2, 'Python 编程指南');
INSERT INTO books_b (id, title) VALUES (4, '算法导论');
```

**当前数据状态：**

- **books_a**: [1, 3, 2]
- **books_b**: [2, 4]
- **重叠数据**: ID 为 2 的记录。

### 4.2 示例 1：基础查询

**需求**：找出存在于 `books_a` 中，但不存在于 `books_b` 中的书籍 ID。

```sql
SELECT id FROM books_a
EXCEPT
SELECT id FROM books_b;
```

**结果：**

| id |
| :--- |
| 1 |
| 3 |

**解析**：

- ID 1 在 A 中，不在 B 中 -> 保留。
- ID 2 在 A 中，也在 B 中 -> 排除。
- ID 3 在 A 中，不在 B 中 -> 保留。
- ID 4 仅在 B 中 -> 与 A 无关，忽略。

### 4.3 示例 2：多列比较

`EXCEPT` 比较的是整行数据。如果指定了多列，只有当所有列的值都匹配时，该行才会被排除。

**需求**：比较两张表的 ID 和 Title。

```sql
SELECT id, title FROM books_a
EXCEPT
SELECT id, title FROM books_b;
```

**结果：**

| id | title |
| :--- | :--- |
| 1 | SQLite 基础教程 |
| 3 | Web 开发实战 |

### 4.4 示例 3：结合 ORDER BY 排序

**需求**：找出 A 中独有的书，并按 ID 降序排列。

```sql
SELECT id, title FROM books_a
EXCEPT
SELECT id, title FROM books_b
ORDER BY id DESC;
```

**注意**：`ORDER BY` 只能出现一次，并且必须放在整个语句的末尾。

## 5. 进阶：EXCEPT 与 NULL 值

在 SQLite 的 `EXCEPT` 运算中，`NULL` 值被认为是相等的。

假设表 A 有一行数据为 `NULL`，表 B 也有对应的一行数据为 `NULL`，那么 `A EXCEPT B` 会将该行排除。这与标准的比较运算符（如 `=` 或 `<>`）不同，后者在遇到 `NULL` 时通常返回 Unknown。

## 6. EXCEPT 与 NOT IN 的区别

虽然 `EXCEPT` 和 `NOT IN` 子句常用于解决类似的问题，但它们有以下区别：

1. **去重**：`EXCEPT` 总是返回唯一值（去重）；`NOT IN` 如果不配合 `DISTINCT` 使用，可能会返回重复值。
2. **NULL 处理**：
    - `EXCEPT` 对 `NULL` 友好，认为两个 `NULL` 相等。
    - `NOT IN` 如果子查询结果中包含任何 `NULL` 值，整个查询可能不会返回任何结果（取决于具体的逻辑实现），因为 `x <> NULL` 的结果是 Unknown。
3. **列匹配**：`EXCEPT` 可以轻松处理多列组合的差集；`NOT IN` 通常用于单列比较（尽管部分数据库支持元组比较，但在 SQLite 中使用 `EXCEPT` 处理多列更直观）。

**性能建议**：在处理大数据集时，根据具体的数据分布，两者的执行计划可能不同，建议使用 `EXPLAIN QUERY PLAN` 进行分析。

## 7. 总结

- 使用 `EXCEPT` 来查找“在一个列表中而不在另一个列表中”的数据。
- 确保两个查询的列数和类型一致。
- `EXCEPT` 自动执行去重操作。
- 结果集的列标题源自第一个查询。
