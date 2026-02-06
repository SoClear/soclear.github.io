# 主键 (Primary Key)

## 简介

主键（Primary Key）是关系型数据库中的核心概念，用于唯一标识表中的每一行记录。在 SQLite 中，主键不仅约束数据的唯一性，还在存储引擎层面扮演着重要角色。

与其他数据库（如 MySQL 或 PostgreSQL）相比，SQLite 的主键处理机制有一些独特的特性，特别是关于 `INTEGER PRIMARY KEY` 和 `ROWID` 的关系。

## 1. 定义主键

在 SQLite 中，可以在创建表（`CREATE TABLE`）时定义主键。主要有两种定义方式：列级定义和表级定义。

### 列级定义 (Column-level)

适用于单列主键，直接在列定义后添加 `PRIMARY KEY` 关键字。

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT
);
```

### 表级定义 (Table-level)

适用于单列或多列（复合）主键。在所有列定义之后，使用 `PRIMARY KEY (column_list)` 语法。

```sql
CREATE TABLE users (
    id INTEGER,
    username TEXT NOT NULL,
    email TEXT,
    PRIMARY KEY (id)
);
```

## 2. INTEGER PRIMARY KEY 的特殊性

这是 SQLite 中最重要的概念之一。

### ROWID 别名机制

默认情况下，SQLite 的每张表（非 `WITHOUT ROWID` 表）都有一个隐藏的列叫 `ROWID`，它是一个 64 位的有符号整数。

如果你将一列定义为 **`INTEGER PRIMARY KEY`**（必须完全匹配这三个单词，大小写不敏感），那么这一列就变成了 `ROWID` 的**别名**（Alias）。

- **存储效率**：该列实际上就是 `ROWID`，不会额外占用存储空间。
- **查询速度**：根据该列进行查找是 SQLite 中最快的查询方式（O(log N)）。
- **类型陷阱**：如果你定义的是 `INT PRIMARY KEY` 或 `BIGINT PRIMARY KEY`，由于类型亲和性（Type Affinity）规则，它**不会**成为 `ROWID` 的别名，且不具备自动增长特性。必须严格使用 `INTEGER`。

### 自动赋值

对于定义为 `INTEGER PRIMARY KEY` 的列：

1. 如果插入时未指定该列的值，或者指定为 `NULL`，SQLite 会自动分配一个未使用的整数值（通常是最大值 + 1）。
2. 这实际上实现了“自增”功能，而不需要使用额外的 `AUTOINCREMENT` 关键字。

```sql
CREATE TABLE logs (
    id INTEGER PRIMARY KEY,
    msg TEXT
);

-- id 会自动生成：1
INSERT INTO logs (msg) VALUES ('Error 1'); 

-- id 会自动生成：2
INSERT INTO logs (id, msg) VALUES (NULL, 'Error 2'); 
```

## 3. AUTOINCREMENT 关键字

许多开发者习惯性地使用 `INTEGER PRIMARY KEY AUTOINCREMENT`，但在 SQLite 中，通常**不需要**加 `AUTOINCREMENT`。

### 默认行为 vs. AUTOINCREMENT

- **默认 (仅 INTEGER PRIMARY KEY)**：如果删除了最大 ID 的行，后续插入可能会重用之前的 ID 值（只要该值当前未被使用）。它旨在高效地填补空缺或直接递增。
- **AUTOINCREMENT**：强制 ID 单调递增。即使最大 ID 的行被删除，新插入的 ID 也会比历史上存在过的最大 ID 大。它保证了 ID **永远不会被重用**。

### 性能代价

使用 `AUTOINCREMENT` 会引入额外的 CPU、内存、磁盘 I/O 开销，并且会向 `sqlite_sequence` 系统表中写入数据。

**建议**：除非业务逻辑严格要求 ID 绝对不可重复使用（例如某些财务记录或对外暴露的订单号），否则**不要**使用 `AUTOINCREMENT`。

## 4. 复合主键 (Composite Primary Key)

如果一行记录的唯一性由多列共同决定，需要使用复合主键。这必须使用表级约束语法。

```sql
CREATE TABLE enrollments (
    student_id INTEGER,
    course_id INTEGER,
    enrolled_at DATETIME,
    -- 联合主键：同一个学生在同一门课中只能有一条记录
    PRIMARY KEY (student_id, course_id)
);
```

**注意**：复合主键中的列即使类型是 `INTEGER`，也**不会**成为 `ROWID` 的别名。

## 5. NULL 值处理

这 是 SQLite 与标准 SQL 的一个主要区别。

- **标准 SQL**：主键列默认隐含 `NOT NULL` 约束。
- **SQLite**：
  - **INTEGER PRIMARY KEY**：总是 `NOT NULL`。尝试插入 `NULL` 会触发自动赋值。
  - **其他类型主键**：由于历史遗留原因，早期的 SQLite 允许主键为 `NULL`。但在现代应用中，这是被视为 bug 的行为。
  - **WITHOUT ROWID 表**：主键列不允许为 `NULL`。

**最佳实践**：除了 `INTEGER PRIMARY KEY` 外，定义其他类型的主键时，显式加上 `NOT NULL` 是个好习惯。

```sql
CREATE TABLE devices (
    uuid TEXT NOT NULL PRIMARY KEY, -- 显式声明 NOT NULL
    name TEXT
);
```

## 6. 修改主键

SQLite 对 `ALTER TABLE` 的支持有限。你不能直接通过 `ALTER TABLE` 添加或删除主键约束。

如果需要修改主键（例如从单列改为复合主键），必须遵循“迁移”模式：

1. 创建一个带有新主键结构的新表。
2. 将旧表的数据复制到新表。
3. 删除旧表。
4. 将新表重命名为旧表名。

```sql
BEGIN TRANSACTION;

-- 1. 创建新表
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY,
    name TEXT
);

-- 2. 复制数据
INSERT INTO users_new (id, name) SELECT id, name FROM users;

-- 3. 删除旧表
DROP TABLE users;

-- 4. 重命名
ALTER TABLE users_new RENAME TO users;

COMMIT;
```

## 总结

1. **推荐使用**：绝大多数表都应该有一个 `INTEGER PRIMARY KEY` 列作为主键，以利用 `ROWID` 的性能优势。
2. **慎用 AUTOINCREMENT**：除非绝对必要，否则只写 `INTEGER PRIMARY KEY` 即可，性能更好。
3. **类型拼写**：必须拼写为 `INTEGER`，不能是 `INT`。
4. **复合主键**：使用表级约束语法定义。
5. **不可修改**：设计表结构时需谨慎，因为后期修改主键比较麻烦。
