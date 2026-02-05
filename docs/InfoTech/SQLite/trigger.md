# 触发器

在数据库开发中，我们经常需要在数据发生变化（插入、更新或删除）时自动执行某些操作。与其在应用程序代码中到处打补丁，不如使用数据库自带的强大功能—— **触发器（Triggers）** 。

本文将带您全面了解 SQLite 触发器，通过实战案例掌握如何利用它来实现自动化数据处理、审计日志和数据约束。

## 什么是触发器？

触发器是一种特殊的存储过程，它会在指定的数据库事件（INSERT、UPDATE 或 DELETE）发生 **之前（BEFORE）** 或 **之后（AFTER）** 自动执行。

你可以把它想象成数据库层面的“监听器”或“钩子函数”。

**为什么要用它？**

- **自动更新数据**：例如自动更新 `updated_at` 时间戳。
- **审计日志**：记录谁删除了数据，删除了什么。
- **数据验证**：在写入数据前进行复杂的逻辑检查。
- **级联操作**：当一个表变动时，自动同步修改另一个表。

## 基础语法

SQLite 创建触发器的基本语法如下：

```sql
CREATE TRIGGER trigger_name
[BEFORE | AFTER | INSTEAD OF]  -- 触发时机
[INSERT | UPDATE | DELETE]     -- 触发事件
ON table_name                  -- 监听的表
[FOR EACH ROW]                 -- SQLite 默认也是针对每一行
[WHEN condition]               -- 可选：仅在满足特定条件时触发
BEGIN
    -- 触发后执行的 SQL 语句 (分号结尾)
    UPDATE ...;
    INSERT ...;
END;
```

### 关键概念：NEW 和 OLD

在触发器逻辑中，我们使用两个特殊的关键字来引用数据：

| 关键字 | 描述 | 适用事件 |
| :--- | :--- | :--- |
| **NEW** | 代表即将插入或更新后的**新数据行** | INSERT, UPDATE |
| **OLD** | 代表被删除或更新前的**旧数据行** | DELETE, UPDATE |

## 实战案例

为了演示，我们假设有一个简单的 `users` 表：

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT,
    salary INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 场景一：自动更新 `updated_at` 时间戳

这是触发器最经典的应用场景。SQLite 不像 MySQL 那样支持 `ON UPDATE CURRENT_TIMESTAMP`，所以我们需要用触发器来实现。

```sql
CREATE TRIGGER update_user_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = OLD.id;
END;
```

**测试效果：**

```sql
INSERT INTO users (username, salary) VALUES ('Alice', 5000);
-- 等待几秒...
UPDATE users SET salary = 6000 WHERE username = 'Alice';
-- 查询发现 updated_at 已经自动变了
SELECT * FROM users;
```

### 场景二：审计日志（记录数据删除）

为了安全起见，当有人删除用户时，我们希望将删除的数据备份到一个日志表中。

**1. 创建日志表：**

```sql
CREATE TABLE deleted_users_log (
    log_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    username TEXT,
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**2. 创建删除触发器：**

```sql
CREATE TRIGGER log_user_deletion
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO deleted_users_log (user_id, username)
    VALUES (OLD.id, OLD.username);
END;
```

**测试效果：**

```sql
DELETE FROM users WHERE username = 'Alice';
-- 查看日志表，Alice 的信息已被存档
SELECT * FROM deleted_users_log;
```

### 场景三：数据校验（防止工资降低）

通常我们在应用层做校验，但在数据库层做是最后的防线。我们可以利用 `RAISE(ABORT, 'message')` 来阻止非法操作。

**需求**：禁止将用户的工资修改为比原来更低的值。

```sql
CREATE TRIGGER prevent_salary_reduction
BEFORE UPDATE OF salary ON users  -- 注意：这里指定了仅当 salary 列变化时触发
FOR EACH ROW
WHEN NEW.salary < OLD.salary      -- WHEN 子句：仅当新工资小于旧工资时执行
BEGIN
    SELECT RAISE(ABORT, 'Error: Salary cannot be reduced!');
END;
```

**测试效果：**

```sql
-- 尝试降低工资（假设当前是 6000）
UPDATE users SET salary = 4000 WHERE id = 1;
-- 结果：报错 "Error: Salary cannot be reduced!"，且更新失败。
```

## 管理触发器

### 1. 查看已有的触发器

SQLite 将触发器信息存储在系统表 `sqlite_master` 中。

```sql
SELECT name, tbl_name, sql 
FROM sqlite_master 
WHERE type = 'trigger';
```

### 2. 删除触发器

如果不再需要某个触发器，可以使用 `DROP` 命令。

```sql
DROP TRIGGER IF EXISTS update_user_timestamp;
```

## 进阶技巧与注意事项

### 1. `INSTEAD OF` 触发器

通常用于 **视图（Views）**。视图是只读的，但通过 `INSTEAD OF` 触发器，你可以拦截对视图的写入操作，转而修改底层的物理表，从而实现“可更新视图”。

### 2. 性能影响

触发器是同步执行的，且包含在事务中。

- 如果你批量插入 1000 条数据，且定义了 `FOR EACH ROW` 的触发器，那么触发器逻辑也会执行 1000 次。
- **建议**：避免在触发器中执行耗时过长的复杂计算。

### 3. 避免递归调用

如果一个 UPDATE 触发器内部又执行了 UPDATE 语句，且该语句又触发了同一个触发器，就会导致无限循环（SQLite 有递归深度限制，但仍需小心）。

- **解决**：在 `UPDATE` 语句中明确 `WHERE` 条件，或者利用 `WHEN` 子句排除自身。

### 4. 调试困难

触发器的逻辑是“隐式”的。对于新接手项目的开发者来说，可能会因为莫名其妙的数据变化（由触发器引起）而感到困惑。

- **建议**：一定要给触发器起清晰的名字，并在文档中注明。

## 总结

SQLite 触发器是一个强大的工具，它能帮助我们保证数据的完整性并减少应用程序的重复代码。

- **INSERT/UPDATE** 用 `NEW` 引用数据。
- **DELETE** 用 `OLD` 引用数据。
- **BEFORE** 用于验证或拦截。
- **AFTER** 用于日志或级联更新。

掌握好触发器，你的数据库将不再只是一个简单的存储容器，而是一个智能的数据管理中心。
