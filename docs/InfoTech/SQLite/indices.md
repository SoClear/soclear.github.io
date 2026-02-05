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

### 4.1 唯一索引 (Unique Index)

不仅提高查询速度，还强制列中的值必须唯一。通常用于用户名、邮箱等字段。

```sql
CREATE UNIQUE INDEX idx_users_username ON Users(username);
```

*尝试插入重复的 username 会抛出错误。*

### 4.2 多列索引 (Multi-column Index)

也称为复合索引。当你经常在 `WHERE` 子句中同时使用多个条件时非常有用。

```sql
CREATE INDEX idx_users_age_created ON Users(age, created_at);
```

**⚠️ 最左前缀原则 (Leftmost Prefix Rule)：**
SQLite 使用复合索引时，查询必须从索引的最左侧列开始匹配。

- ✅ `WHERE age = 30 AND created_at > '2023-01-01'` (使用索引)
- ✅ `WHERE age = 30` (使用索引)
- ❌ `WHERE created_at > '2023-01-01'` (不使用索引，因为跳过了 age)

### 4.3 隐式索引 (Implicit Index)

当你定义 `PRIMARY KEY` 或 `UNIQUE` 约束时，SQLite 会自动为你创建索引，无需手动添加。

## 5. SQLite 高级索引特性

这是 SQLite 区别于其他数据库的强大之处。

### 5.1 部分索引 (Partial Indexes)

如果你只关心满足特定条件的数据，可以创建一个只包含部分行的索引。这能显著节省磁盘空间并提高写入速度。

**场景**：你经常查询未被封禁的用户（`is_banned = 0`）的邮箱。

```sql
CREATE INDEX idx_active_users_email ON Users(email) WHERE is_banned = 0;
```

*这个索引不会包含被封禁用户的数据，因此体积更小。*

### 5.2 表达式索引 (Indexes on Expressions)

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

## 7. 索引的代价 (Trade-offs)

索引不是免费的午餐，它有副作用：

1. **写入变慢**：每次 `INSERT`、`UPDATE` 或 `DELETE` 时，SQLite 不仅要更新数据表，还要更新所有相关的索引。索引越多，写入越慢。
2. **占用磁盘空间**：索引文件可能会比数据文件本身还大。

## 8. 最佳实践总结

1. **高基数列 (High Cardinality) 适合索引**：包含许多不同值的列（如 ID、邮箱、时间戳）。
2. **低基数列 (Low Cardinality) 避免索引**：只有很少几个值的列（如 性别、布尔值状态）。数据库全表扫描通常比读索引再回表更快。
3. **不要过度索引**：只为经常出现在 `WHERE`、`ORDER BY` 或 `JOIN` 条件中的列创建索引。
4. **利用部分索引**：对于大表，如果只需查询活跃数据，务必使用 `WHERE` 子句创建部分索引。
5. **定期维护**：频繁更新后，运行 `ANALYZE;` 命令可以让 SQLite 的查询优化器做出更准确的索引选择。
