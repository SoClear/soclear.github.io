# 修改表结构 (ALTER TABLE)

在软件开发过程中，随着需求的变化，我们经常需要修改数据库的表结构。相比于 MySQL 或 PostgreSQL，SQLite 的 `ALTER TABLE` 功能在历史上比较受限，但随着版本的更新，它已经越来越强大了。

在 SQLite 中，`ALTER TABLE` 命令主要用于以下四种操作：

- **重命名表** (`RENAME TO`)
- **重命名列** (`RENAME COLUMN`)
- **添加新列** (`ADD COLUMN`)
- **删除列** (`DROP COLUMN`) *（需要 SQLite 3.35.0+）*

## 重命名表 (Rename Table)

当你觉得当前的表名不再合适时，可以使用此命令。

**语法：**

```sql
ALTER TABLE 旧表名 RENAME TO 新表名;
```

**示例：**
将 `users` 表重命名为 `customers`：

```sql
ALTER TABLE users RENAME TO customers;
```

> **提示：** 重命名表后，SQLite 会自动更新所有引用该表的索引和触发器，但 **视图 (Views)** 或应用程序中的 SQL 语句需要你手动更新。

---

## 重命名列 (Rename Column)

> 要求版本：SQLite 3.25.0 +

用于修正拼写错误或使字段名更具描述性。

**语法：**

```sql
ALTER TABLE 表名 RENAME COLUMN 旧列名 TO 新列名;
```

**示例：**
将 `customers` 表中的 `addr` 字段改为 `address`：

```sql
ALTER TABLE customers RENAME COLUMN addr TO address;
```

## 添加新列 (Add Column)

这是最常用的操作之一。向现有表中追加一个新的字段。

**语法：**

```sql
ALTER TABLE 表名 ADD COLUMN 列名 数据类型 [约束];
```

**示例：**
给 `customers` 表增加一个 `email` 字段：

```sql
ALTER TABLE customers ADD COLUMN email TEXT;
```

给 `orders` 表增加一个带有默认值的 `status` 字段：

```sql
ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';
```

### 限制与注意事项

- 新增的列总是添加在表的**最后面**。
- 新增列**不能**是 `PRIMARY KEY` 或 `UNIQUE`（除非是表重建方式）。
- 如果声明了 `NOT NULL`，必须提供一个 `DEFAULT` 值（除非表是空的）。

## 删除列 (Drop Column)

> 要求版本：SQLite 3.35.0 +

在旧版本的 SQLite 中，删除列是非常麻烦的（需要重建表）。但在 3.35.0 版本之后，原生支持了删除列。

**语法：**

```sql
ALTER TABLE 表名 DROP COLUMN 列名;
```

**示例：**
删除 `customers` 表中的 `fax_number` 字段：

```sql
ALTER TABLE customers DROP COLUMN fax_number;
```

> **重要提示：** 删除列后，数据库文件的大小**不会立即变小**。SQLite 只是标记该空间可用。如果你想释放磁盘空间，需要执行 `VACUUM`

## 修改列类型或约束

SQLite 的 `ALTER TABLE` 命令 **不支持** 以下操作：

- 修改现有列的数据类型（例如从 `TEXT` 变为 `INTEGER`）。
- 修改列的约束（例如添加 `UNIQUE` 或移除 `NOT NULL`）。
- 改变列的顺序。

如果你需要做这些操作，或者你的 SQLite 版本低于 3.35 却想删除列，必须使用 **“重建表” (Recreate Table)** 的策略。

12 步标准操作流程（事务安全）：

假设我们要修改 `users` 表：

- 把 `age` 字段的数据类型从 `TEXT` 改为 `INTEGER`
- 为 `email` 字段添加唯一约束
- 重建索引
- 重建触发器
- 保持外键约束

```sql
-- 1. 开启事务：确保操作的原子性，要么全部成功，要么全部回滚
BEGIN TRANSACTION;

-- 2. 暂时关闭外键约束检查：防止在重建表期间因外键依赖导致报错
PRAGMA foreign_keys = OFF;

-- 3. 创建新表：使用你想要的最终结构（新类型、新约束、新列顺序等）
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,          -- 假设这里修改了类型
    email TEXT UNIQUE     -- 假设这里添加了约束
);

-- 4. 迁移数据：将旧表数据映射并插入到新表中
INSERT INTO users_new (id, name, age, email)
SELECT id, name, CAST(age AS INTEGER), email FROM users;

-- 5. 删除旧表：清理旧的结构
DROP TABLE users;

-- 6. 重命名新表：将新表改名为原表名，完成“偷梁换柱”
ALTER TABLE users_new RENAME TO users;

-- 7. 重建索引：在旧表上定义的索引不会自动迁移，必须在新表上重新创建
CREATE INDEX idx_users_email ON users(email);

-- 8. 重建触发器（如果原表有触发器）：如果旧表有 Trigger，需重新创建
-- CREATE TRIGGER ... 

-- 9. 验证数据：简单检查数据是否迁移成功
-- SELECT count(*) FROM users;

-- 10. 检查外键约束：在重新开启外键检查前，确保完整性
PRAGMA foreign_key_check;

-- 11. 提交事务：永久保存所有修改
COMMIT;

-- 12. 恢复外键约束：重新开启外键检查，保证数据库的一致性
PRAGMA foreign_keys = ON;
```

---

## 总结 / Cheat Sheet

| 操作 | SQL 语法 | 版本要求 |
| :--- | :--- | :--- |
| **重命名表** | `ALTER TABLE xxx RENAME TO yyy` | 所有版本 |
| **重命名列** | `ALTER TABLE xxx RENAME COLUMN a TO b` | 3.25.0+ |
| **添加列** | `ALTER TABLE xxx ADD COLUMN zzz TYPE` | 所有版本 |
| **删除列** | `ALTER TABLE xxx DROP COLUMN zzz` | 3.35.0+ |
| **改类型/约束** | 需使用 `CREATE NEW` -> `COPY` -> `DROP OLD` 流程 | 所有版本 |

---

### 建议

1. **备份！备份！备份！** 在对生产环境数据库执行 `ALTER TABLE`（尤其是删除列或重建表）之前，务必备份你的 `.db` 文件。
2. **检查版本：** 使用 `SELECT sqlite_version();` 查看你当前的 SQLite 版本，确保支持你想要执行的命令。
3. **工具推荐：** 如果你不喜欢写复杂的 SQL，可以使用 **DB Browser for SQLite** 等可视化工具，它们会在后台自动帮你执行上述的“重建表”脚本。
