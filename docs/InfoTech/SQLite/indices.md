# 索引

在数据库优化中，**索引（Index）** 是提升查询性能最有效的手段。

本文将带你深入了解 SQLite 索引的类型、用法、性能分析以及最佳实践。

## 1. 什么是索引？

比如在词典中查找单词 lite

- **没有索引**：你必须从第 1 页开始，一页一页地翻，直到找到为止（这叫全表扫描，Full Table Scan）。
- **有索引**：你打开目录或侧边的字母索引，直接跳到 'L' 开头的部分，通过二分查找迅速定位（这叫索引查找，Index Seek）。

在 SQLite 中，索引是一种特殊的数据结构（通常是 B-Tree），它存储了表中一列或多列的值以及指向实际数据行的指针。

## 2. 准备工作

为了演示，我们先创建一个简单的用户表并插入一些数据：

```sql
CREATE TABLE Users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT,
    age INTEGER,
    created_at DATETIME
);

-- 插入模拟数据
INSERT INTO Users (username, email, age, created_at) VALUES 
('alice', 'alice@example.com', 25, '2023-01-01'),
('bob', 'bob@google.com', 30, '2023-01-02'),
('charlie', 'charlie@example.com', 35, '2023-01-03');
```

## 3. 基础索引操作

### 创建索引 (Create Index)

如果你经常根据 `email` 查找用户，你应该为该列创建索引：

```sql
-- 语法: CREATE INDEX 索引名 ON 表名(列名);
CREATE INDEX idx_users_email ON Users(email);
```

### 删除索引 (Drop Index)

如果索引不再需要，或者它占用太多空间且很少被用到：

```sql
-- 语法: DROP INDEX 索引名;
DROP INDEX idx_users_email;
```

## 4. 索引的类型

SQLite 支持多种类型的索引，适用于不同的场景。

### 唯一索引 (Unique Index)

不仅提高查询速度，还强制列中的值必须唯一。通常用于用户名、邮箱等字段。

```sql
CREATE UNIQUE INDEX idx_users_username ON Users(username);
```

*尝试插入重复的 username 会抛出错误。*

### 多列索引 (Multi-column Index)

也称为复合索引。当你经常在 `WHERE` 子句中同时使用多个条件时非常有用。

```sql
CREATE INDEX idx_users_age_created ON Users(age, created_at);
```

**⚠️ 最左前缀原则 (Leftmost Prefix Rule)：**
SQLite 使用复合索引时，查询必须从索引的最左侧列开始匹配。

- ✅ `WHERE age = 30 AND created_at > '2023-01-01'` (使用索引)
- ✅ `WHERE age = 30` (使用索引)
- ❌ `WHERE created_at > '2023-01-01'` (不使用索引，因为跳过了 age)

### 隐式索引 (Implicit Index)

当你定义 `PRIMARY KEY` 或 `UNIQUE` 约束时，SQLite 会自动为你创建索引，无需手动添加。

## 5. SQLite 高级索引特性

这是 SQLite 区别于其他数据库的强大之处。

### 部分索引 (Partial Indexes)

如果你只关心满足特定条件的数据，可以创建一个只包含部分行的索引。这能显著节省磁盘空间并提高写入速度。

**场景**：你经常查询未被封禁的用户（`is_banned = 0`）的邮箱。

```sql
CREATE INDEX idx_active_users_email ON Users(email) WHERE is_banned = 0;
```

*这个索引不会包含被封禁用户的数据，因此体积更小。*

### 表达式索引 (Indexes on Expressions)

你可以对列的计算结果进行索引。这在处理大小写敏感或复杂计算时非常有用。

**场景**：用户登录时，邮箱通常不区分大小写查找。

```sql
CREATE INDEX idx_lower_email ON Users(lower(email));

-- 查询时必须使用相同的表达式才能命中索引
SELECT * FROM Users WHERE lower(email) = 'alice@example.com';
```

## 6. 如何确认索引是否生效？

仅仅创建索引是不够的，你需要确认 SQLite 是否真的在查询中使用了它。使用 `EXPLAIN QUERY PLAN` 命令。

**没有索引时：**

```sql
EXPLAIN QUERY PLAN SELECT * FROM Users WHERE age = 25;
-- 输出: SCAN TABLE Users
```

*`SCAN TABLE` 意味着全表扫描，性能较差。*

**有索引时：**

```sql
CREATE INDEX idx_age ON Users(age);
EXPLAIN QUERY PLAN SELECT * FROM Users WHERE age = 25;
-- 输出: SEARCH TABLE Users USING INDEX idx_age (age=?)
```

*`SEARCH TABLE` 意味着使用了索引，性能好。*

### 覆盖索引 (Covering Index)

如果索引中包含查询所需的所有列，SQLite 甚至不需要去读取主数据表，直接从索引树返回结果。这是最快的查询方式。

```sql
-- 索引包含 age 和 email
CREATE INDEX idx_age_email ON Users(age, email);

-- 查询只请求 age 和 email
EXPLAIN QUERY PLAN SELECT email FROM Users WHERE age = 25;
-- 输出: SEARCH TABLE Users USING COVERING INDEX idx_age_email (age=?)
```

## 7. 强制索引 (INDEXED BY)

通常情况下，SQLite 的查询优化器（Query Optimizer）非常智能，它会自动分析统计数据，决定是全表扫描还是使用某个特定的索引。但在极少数情况下，优化器可能会“犯傻”，选错了索引，或者你为了调试性能，想要强行指定 SQLite 使用某一个索引。

这时，你可以使用 `INDEXED BY` 子句。

它是一条指令，告诉 SQLite：“ **不要自己思考，必须使用我指定的这个索引。如果用不了，就直接报错。** ”

### 语法与示例

假设我们有一个索引 `idx_users_age`：

```sql
CREATE INDEX idx_users_age ON Users(age);
```

**普通查询（由 SQLite 决定）：**

```sql
SELECT * FROM Users WHERE age > 25;
```

**强制使用索引（人工干预）：**

```sql
-- 语法: FROM 表名 INDEXED BY 索引名
SELECT * FROM Users INDEXED BY idx_users_age WHERE age > 25;
```

### 注意

使用 `INDEXED BY` 是一把双刃剑，**请务必谨慎使用**：

- **查询失败风险**：如果你强制使用的索引无法用于当前的查询（例如 `WHERE` 条件中没有涉及该索引的列），SQLite 不会退回到全表扫描，而是直接抛出错误：`Error: no query solution`。
- **维护成本高**：如果你将来更改了索引的名字或删除了该索引，所有使用了 `INDEXED BY` 的 SQL 代码都会报错。
- **性能倒退**：随着数据量的变化，原本最优的索引可能不再是最优的。如果你写死了 `INDEXED BY`，SQLite 就无法自动切换到更快的执行计划。

什么时候使用？

- **性能调试**：当你怀疑 SQLite 选错了索引，想对比不同索引的性能差异时。
- **回归测试**：确保某个关键查询在版本更新后依然使用特定的索引。
- **修复优化器 Bug**：在极个别情况下，优化器可能因为数据分布极其不均而选择了全表扫描，此时可以用它来“手动挡”驾驶。

### 扩展：NOT INDEXED

如果你想反其道而行之，强制 SQLite **不使用任何索引**（即强制全表扫描），可以使用 `NOT INDEXED`：

```sql
SELECT * FROM Users NOT INDEXED WHERE age > 25;
```

*这通常用于验证全表扫描在小数据量下是否比索引更快，或者用于测试性能基准。*

## 8. 索引的代价 (Trade-offs)

索引不是免费的午餐，它有副作用：

1. **写入变慢**：每次 `INSERT`、`UPDATE` 或 `DELETE` 时，SQLite 不仅要更新数据表，还要更新所有相关的索引。索引越多，写入越慢。
2. **占用磁盘空间**：索引文件可能会比数据文件本身还大。

## 9. 最佳实践总结

1. **高基数列 (High Cardinality) 适合索引**：包含许多不同值的列（如 ID、邮箱、时间戳）。
2. **低基数列 (Low Cardinality) 避免索引**：只有很少几个值的列（如 性别、布尔值状态）。数据库全表扫描通常比读索引再回表更快。
3. **不要过度索引**：只为经常出现在 `WHERE`、`ORDER BY` 或 `JOIN` 条件中的列创建索引。
4. **利用部分索引**：对于大表，如果只需查询活跃数据，务必使用 `WHERE` 子句创建部分索引。
5. **定期维护**：频繁更新后，运行 `ANALYZE;` 命令可以让 SQLite 的查询优化器做出更准确的索引选择。
