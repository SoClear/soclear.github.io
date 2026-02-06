# RETURNING

## 简介

在 SQLite 3.35.0（发布于 2021-03-12）版本中，官方引入了 `RETURNING` 子句。这一特性允许开发者在执行 `INSERT`、`UPDATE` 或 `DELETE` 语句后，直接返回受影响行的列值，而无需再次执行 `SELECT` 查询。

这一特性主要解决了以下两个问题：

1. **减少数据库往返次数**：在一次操作中完成写入和读取。
2. **保证数据原子性**：在并发环境下，确保返回的数据正是刚刚写入或修改的数据，避免因多线程竞态条件导致读取到错误的数据。

## 适用版本

- **SQLite 3.35.0** 及以上版本。

## 基本语法

`RETURNING` 子句添加在 DML（数据操作语言）语句的末尾。其语法逻辑与 `SELECT` 子句完全一致，支持列名、表达式、别名以及通配符 `*`。

```sql
-- INSERT 语法
INSERT INTO table_name (col1, col2) VALUES (val1, val2) 
RETURNING col1, col2, expression;

-- UPDATE 语法
UPDATE table_name SET col1 = new_val 
WHERE condition 
RETURNING col1, old_col2;

-- DELETE 语法
DELETE FROM table_name 
WHERE condition 
RETURNING deleted_col;
```

---

## 实战示例

为了演示，我们先创建一个简单的用户表：

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 1. INSERT ... RETURNING

**场景**：插入新用户，并立即获取数据库自动生成的 `id` 和默认的 `created_at` 时间戳。

**传统做法**：先执行 `INSERT`，然后调用 `last_insert_rowid()`，再 `SELECT` 查询时间戳。

**使用 RETURNING**：

```sql
INSERT INTO users (username, email) 
VALUES ('zhang_san', 'zhang@example.com')
RETURNING id, created_at;
```

**返回结果**：

| id | created_at |
| :--- | :--- |
| 1 | 2023-10-27 10:00:00 |

**优势**：直接获取了默认值和自增主键，无需额外查询。

### 2. UPDATE ... RETURNING

**场景**：更新用户信息，并希望确认更新后的状态，或者获取基于新值计算的结果。

```sql
UPDATE users 
SET email = 'new_email@example.com' 
WHERE username = 'zhang_san'
RETURNING id, email, username;
```

**返回结果**：

| id | email | username |
| :--- | :--- | :--- |
| 1 | <new_email@example.com> | zhang_san |

**注意**：对于 `UPDATE`，返回的值是更新**后**的值。

### 3. DELETE ... RETURNING

**场景**：删除数据，但需要保留被删除数据的备份，或者在应用层记录审计日志。

```sql
DELETE FROM users 
WHERE id = 1
RETURNING id, username, email;
```

**返回结果**：

| id | username | email |
| :--- | :--- | :--- |
| 1 | zhang_san | <new_email@example.com> |

**优势**：无需在删除前先查询一次数据以做备份。

---

## 进阶用法

### 1. 返回所有列

使用通配符 `*` 可以返回受影响行的所有列。

```sql
INSERT INTO users (username) VALUES ('li_si') RETURNING *;
```

### 2. 使用表达式和别名

你可以像在 `SELECT` 语句中一样使用表达式。

```sql
UPDATE product 
SET price = price * 1.1 
WHERE category = 'electronics'
RETURNING id, name, price AS new_price, price * 0.9 AS discounted_price;
```

### 3. 批量操作

当一条语句影响多行时，`RETURNING` 会返回多行数据。

```sql
DELETE FROM users 
WHERE email IS NULL
RETURNING id, username;
```

如果有 3 个用户的邮箱为空，该语句将返回 3 行包含这些用户 ID 和用户名的结果集。

---

## 局限性与注意事项

在使用 `RETURNING` 时，需注意以下限制：

1. **返回顺序**：
    `RETURNING` 子句返回行的顺序与 DML 语句处理行的顺序一致。但在没有明确排序规则的批量操作中，不应过度依赖此顺序。

2. **触发器（Triggers）的影响**：
    - `RETURNING` 返回的是行在**修改之后**、但在 `AFTER` 触发器执行**之前**的状态。
    - 如果存在 `INSTEAD OF` 触发器（通常用于视图），`RETURNING` 子句可能无法按预期工作，或者在某些版本中被禁止。

3. **虚拟表（Virtual Tables）**：
    并非所有虚拟表实现都支持 `RETURNING`。这取决于虚拟表本身的实现方式。

4. **子查询限制**：
    在早期的实现中，`RETURNING` 不能直接用于 CTE（公用表表达式）或子查询的内部，但在顶级语句中总是可用的。

5. **替代 API**：
    虽然 `sqlite3_last_insert_rowid()` C API 仍然有效，但它只能返回最后插入的一行 ID。如果在一个事务中批量插入多行，或者需要非主键列的值，`RETURNING` 是更好的选择。

## 总结

SQLite 的 `RETURNING` 子句是一个强大的功能，它让 SQL 交互变得更加简洁高效。通过减少查询次数和代码复杂度，它特别适合现代 Web 开发框架和高并发应用场景。建议在确认环境 SQLite 版本（>= 3.35.0）满足要求后，积极在项目中使用。
