# 查询分析 (EXPLAIN)

## 1. 简介

在 SQLite 中，编写 SQL 语句只是第一步，确保语句高效执行则是更高级的技能。`EXPLAIN` 命令是用于分析 SQL 性能的核心工具。

它不会真正执行查询，而是向开发者展示 SQLite 数据库引擎将**如何**执行这条查询。通过分析输出结果，你可以判断是否需要创建索引、是否发生了全表扫描，以及 JOIN 操作的效率。

SQLite 提供了两种分析模式：

1. **EXPLAIN QUERY PLAN**（推荐）：提供高级别的执行逻辑描述，易于理解，主要用于性能调优。
2. **EXPLAIN**：显示底层的虚拟机（VDBE）字节码指令，通常用于调试 SQLite 引擎本身，对普通开发者来说过于底层。

**本文重点介绍 `EXPLAIN QUERY PLAN`。**

## 2. 准备工作

为了演示，假设我们有以下表结构：

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    age INTEGER,
    city TEXT
);

-- 在 age 字段上创建一个索引
CREATE INDEX idx_user_age ON users(age);
```

## 3. 基本语法

在任何 SQL 语句（SELECT, INSERT, UPDATE, DELETE）之前加上 `EXPLAIN QUERY PLAN` 即可。

```sql
EXPLAIN QUERY PLAN SELECT * FROM users WHERE id = 1;
```

输出通常包含以下列：

- `id`: 查询节点ID
- `parent`: 父节点ID
- `detail`: 执行计划的详细描述（重点关注此列）

## 4. 常见输出术语解析

在 `detail` 列中，你会遇到以下几个关键术语，它们直接反映了查询效率：

### 4.1 SCAN TABLE (扫描表)

这是性能最差的操作之一（除非表很小）。这意味着数据库必须逐行读取整个表来寻找匹配的数据。

**示例：**

```sql
EXPLAIN QUERY PLAN SELECT * FROM users WHERE city = 'Beijing';
```

**输出：** `SCAN TABLE users`
**分析：** 因为 `city` 字段没有索引，SQLite 必须查看每一行来判断 `city` 是否等于 'Beijing'。如果表有 100 万行，它就读 100 万次。

### 4.2 SEARCH TABLE (搜索表)

这是理想的操作。意味着数据库正在使用索引或主键（B-Tree）直接跳转到特定的行。

**示例 A (使用主键)：**

```sql
EXPLAIN QUERY PLAN SELECT * FROM users WHERE id = 10;
```

**输出：** `SEARCH TABLE users USING INTEGER PRIMARY KEY (rowid=?)`
**分析：** 效率最高，直接定位。

**示例 B (使用普通索引)：**

```sql
EXPLAIN QUERY PLAN SELECT * FROM users WHERE age = 25;
```

**输出：** `SEARCH TABLE users USING INDEX idx_user_age (age=?)`
**分析：** 效率很高，SQLite 使用了我们创建的 `idx_user_age` 索引。

### 4.3 USING COVERING INDEX (使用覆盖索引)

这是性能优化的极致。意味着查询所需的所有数据都在索引中就能找到，根本不需要去回查主表（Main Table）。

**示例：**

```sql
EXPLAIN QUERY PLAN SELECT age FROM users WHERE age = 25;
```

**输出：** `SEARCH TABLE users USING COVERING INDEX idx_user_age (age=?)`
**分析：** 查询只请求 `age`，而 `age` 就在索引里。SQLite 此时只读取索引文件，不读取数据文件，I/O 开销最小。

### 4.4 USE TEMP B-TREE (使用临时 B 树)

这通常发生在排序（ORDER BY）或分组（GROUP BY）时。如果字段没有索引，SQLite 必须将结果集复制到内存或磁盘上的临时结构中进行排序。这会消耗额外的内存和 CPU。

**示例：**

```sql
EXPLAIN QUERY PLAN SELECT * FROM users ORDER BY city;
```

**输出：** `SCAN TABLE users; USE TEMP B-TREE FOR ORDER BY`
**分析：** 这是一个性能警示。如果你经常按 `city` 排序，应该在 `city` 上加索引。

## 5. 复杂查询分析示例

### 5.1 自动索引 (AUTOINDEX)

有时你会看到 `USING AUTOMATIC COVERING INDEX`。这表示 SQLite 认为创建一个临时索引比全表扫描更快，于是它在查询执行期间临时建立了一个索引并在结束后销毁。虽然比全表扫描好，但这通常意味着你应该手动创建一个永久索引。

### 5.2 多表连接 (JOIN)

对于 JOIN 查询，EXPLAIN 会显示表的扫描顺序。

```sql
EXPLAIN QUERY PLAN 
SELECT * FROM users u 
JOIN orders o ON u.id = o.user_id 
WHERE u.age > 30;
```

**可能输出：**

1. `SEARCH TABLE users AS u USING INDEX idx_user_age (age>?)`
2. `SCAN TABLE orders AS o`

**分析：**

- SQLite 首先利用索引筛选出符合条件的 `users`。
- 然后对 `orders` 表进行了全表扫描来匹配 `user_id`。
- **优化建议：** 应该在 `orders(user_id)` 上建立索引，将 `SCAN TABLE orders` 变为 `SEARCH TABLE orders`。

## 6. 命令行工具技巧

如果你使用 SQLite 的命令行工具 (`sqlite3`)，可以开启自动显示查询计划功能，无需每次手动输入 EXPLAIN。

```bash
sqlite> .eqp on
sqlite> SELECT * FROM users WHERE age = 20;
QUERY PLAN
`--SEARCH TABLE users USING INDEX idx_user_age (age=?)
```

`.eqp on` 会让之后的每次查询都自动输出执行计划，非常适合调试会话。

## 7. 底层 EXPLAIN (VDBE Bytecode)

*注意：本节仅作了解，通常不需要使用。*

如果不加 `QUERY PLAN`，直接运行 `EXPLAIN SELECT ...`，你会看到类似这样的输出：

| addr | opcode | p1 | p2 | p3 | ... |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | Init | 0 | 10 | 0 | ... |
| 1 | OpenRead | 0 | 2 | 0 | ... |
| 2 | Rewind | 0 | 9 | 0 | ... |

这是 SQLite 虚拟机的汇编指令。除非你在开发 SQLite 扩展或深入研究数据库内核，否则请坚持使用 `EXPLAIN QUERY PLAN`。

## 8. 总结与优化步骤

使用 `EXPLAIN QUERY PLAN` 的最佳实践流程：

1. **识别慢查询：** 找到应用程序中响应慢的 SQL。
2. **获取计划：** 在 SQL 前加上 `EXPLAIN QUERY PLAN` 运行。
3. **寻找 SCAN：** 检查结果中是否有 `SCAN TABLE`。如果表数据量大，这是一个红色警报。
4. **寻找 TEMP B-TREE：** 如果有排序或分组，检查是否有临时 B 树生成。
5. **创建索引：** 根据 WHERE、JOIN 和 ORDER BY 的字段创建索引。
6. **验证：** 再次运行 `EXPLAIN QUERY PLAN`，确认 `SCAN` 变成了 `SEARCH`。
