# DELETE 语句

在数据库管理中，删除数据是一项高风险操作。SQLite 提供了 `DELETE` 语句用于移除表中的行。与 `DROP TABLE`（删除整个表结构）不同，`DELETE` 仅删除表中的数据，保留表的结构、索引和触发器。

本文将详细介绍 `DELETE` 的基础语法、常见场景、以及在 SQLite 中特有的注意事项（如空间释放和自增主键重置）。

## 基础语法

`DELETE` 语句的基本结构非常简单：

```sql
DELETE FROM 表名 WHERE 条件;
```

* **表名**：指定要从中删除数据的表。
* **WHERE 条件**：指定哪些行应该被删除。如果省略此子句，**表中的所有行都将被删除**。

## 实战场景

### 场景一：删除指定行（最常用）

永远建议在执行删除前，先明确 `WHERE` 条件。

**示例：** 删除 `users` 表中 `id` 为 5 的用户。

```sql
DELETE FROM users WHERE id = 5;
```

**示例：** 删除 `orders` 表中状态为 'cancelled' 且创建时间早于 2023 年的所有订单。

```sql
DELETE FROM orders 
WHERE status = 'cancelled' AND created_at < '2023-01-01';
```

> **最佳实践技巧：**
> 在执行删除命令之前，建议先将 `DELETE` 替换为 `SELECT *` 运行一次，确认筛选出的数据确实是你想要删除的。
>
> ```sql
> -- 先查询确认
> SELECT * FROM users WHERE id = 5;
> -- 确认无误后再执行删除
> DELETE FROM users WHERE id = 5;
> ```

### 场景二：删除所有行（清空表）

如果你想保留表结构，但清空里面的所有数据。

**示例：**

```sql
DELETE FROM logs;
```

**注意：**
SQLite 标准语法中没有 MySQL 或 PostgreSQL 中的 `TRUNCATE TABLE` 命令。在 SQLite 中，使用不带 `WHERE` 子句的 `DELETE` 语句即可达到清空表的效果。虽然 SQLite 内部对这种全表删除进行了优化（直接清空文件页），但其行为细节（如自增ID）与标准 Truncate 略有不同，详见后文。

### 场景三：基于子查询删除

有时你需要根据另一个表的数据来删除当前表的数据。

**示例：** 删除所有在 `blacklist`（黑名单）表中的用户。

```sql
DELETE FROM users
WHERE name IN (SELECT name FROM blacklist);
```

## SQLite 特有的注意事项

这是 SQLite 与其他数据库差异最大的地方。

### 磁盘空间释放 (VACUUM)

当你执行 `DELETE` 删除大量数据后，查看数据库文件（.db），你会发现文件大小**并没有变小**。

**原因：**
SQLite 默认行为是将删除的数据页标记为“可用”，以便将来插入新数据时复用这些空间，而不是立即归还给操作系统。这可以减少磁盘碎片和IO操作。

**解决方案：**
如果你确实需要释放磁盘空间（例如删除了几 GB 的日志），需要手动执行 `VACUUM` 命令。

```sql
-- 重建整个数据库，释放未使用的空间
VACUUM;
```

*注意：`VACUUM` 操作会重建整个数据库文件，对于大型数据库可能需要一些时间，且操作期间需要额外的磁盘空间。*

### 自增主键 (Auto-increment) 的重置

如果你使用 `DELETE FROM table_name` 清空了表，SQLite **不会** 重置 `AUTOINCREMENT` 的计数器。也就是说，如果之前 ID 到了 100，清空表后插入的第一条新数据 ID 仍然是 101。

**解决方案：**
如果要重置自增 ID（让它从 1 开始），需要手动清理 SQLite 的系统表 `sqlite_sequence`。

```sql
-- 1. 清空表数据
DELETE FROM users;

-- 2. 重置自增计数器
DELETE FROM sqlite_sequence WHERE name = 'users';
```

### 外键约束 (Foreign Keys)

如果你的表开启了外键约束，并且设置了 `ON DELETE CASCADE`（级联删除），那么删除父表记录时，子表中关联的记录也会被自动删除。

**示例：**
假设 `orders` 表关联了 `users` 表。

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

当你执行 `DELETE FROM users WHERE id = 1;` 时，该用户在 `orders` 表中的所有订单也会被一并删除。

*注意：SQLite 默认外键支持是关闭的，需要执行 `PRAGMA foreign_keys = ON;` 才能生效。*

## 安全操作建议：使用事务

在生产环境中执行批量删除操作时，强烈建议包裹在事务中。这允许你在发现错误时回滚操作。

```sql
-- 1. 开启事务
BEGIN TRANSACTION;

-- 2. 执行删除
DELETE FROM users WHERE last_login < '2020-01-01';

-- 3. 检查影响行数（部分工具支持）或查询验证
-- SELECT count(*) FROM users;

-- 4. 如果一切正常，提交事务
COMMIT;

-- 5. 如果发现误删，回滚事务（数据恢复原状）
-- ROLLBACK;
```

## 总结

| 操作 | SQL 语法 | 备注 |
| :--- | :--- | :--- |
| **删除特定行** | `DELETE FROM 表 WHERE 条件` | 务必检查 WHERE 条件 |
| **清空表** | `DELETE FROM 表` | 等同于其他数据库的 TRUNCATE |
| **释放空间** | `VACUUM` | 删除数据后需手动执行 |
| **重置ID** | 操作 `sqlite_sequence` 表 | 清空表后如需 ID 归零时使用 |
