# 附加数据库 (ATTACH DATABASE)

SQLite 的一个强大特性是允许在同一个数据库连接中同时访问多个独立的数据库文件。这通过 `ATTACH DATABASE` 语句实现。

## 1. 为什么要附加数据库？

- **跨库查询**：你可以在一个 SQL 语句中关联（JOIN）不同数据库文件中的表。
- **数据归档**：可以将旧数据移动到单独的文件中，需要时再挂载查询。
- **临时操作**：将一个临时的数据库文件附加到当前会话中进行数据处理。

## 2. 语法

```sql
ATTACH DATABASE '文件路径' AS 别名;
```

或者简写为：

```sql
ATTACH '文件路径' AS 别名;
```

## 3. 示例

假设你当前连接在 `main.db`，现在想把 `logs.db` 里的数据也纳入查询范围：

```sql
-- 将 logs.db 附加为别名 "daily_logs"
ATTACH DATABASE '/path/to/logs.db' AS daily_logs;

-- 现在你可以跨库查询了
-- 比如：查询 main.db 中的 users 表和 logs.db 中的 errors 表
SELECT u.username, e.error_msg
FROM main.users u
JOIN daily_logs.errors e ON u.id = e.user_id;
```

### 2.4 关键点

- **main 和 temp**：每个 SQLite 连接默认都有两个数据库：`main`（主数据库文件）和 `temp`（用于存储临时表）。
- **文件路径**：文件名必须用引号括起来。
- **别名唯一性**：别名不能与现有的数据库别名（如 `main` 或 `temp`）冲突。
- **限制**：SQLite 限制了同时附加数据库的数量（编译时默认通常是 10 个或 62 个，具体取决于版本）。
