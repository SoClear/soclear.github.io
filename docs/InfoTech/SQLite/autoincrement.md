# 自增 (AUTOINCREMENT)

## 1. 简介

在大多数关系型数据库中，我们习惯为表的主键设置“自增”属性，以便每插入一行数据，ID 就会自动加 1。

在 SQLite 中，处理自增的机制与其他数据库略有不同。SQLite 使用 `ROWID` 机制，而在某些特定场景下，才需要显式使用 `AUTOINCREMENT` 关键字。

## 2. 默认行为：INTEGER PRIMARY KEY

在 SQLite 中，如果你定义一个列为 `INTEGER PRIMARY KEY`，那么该列会自动成为该表的 `ROWID` 的别名。

即使**不**使用 `AUTOINCREMENT` 关键字，SQLite 也会自动为该列生成唯一的、递增的整数。

### 示例

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT
);

INSERT INTO users (name) VALUES ('Alice');
INSERT INTO users (name) VALUES ('Bob');
```

查询结果：

| id | name |
| :--- | :--- |
| 1 | Alice |
| 2 | Bob |

### 默认算法规则

1. **取最大值加 1**：新行的 ID 通常是当前表中最大 ID 值加 1。
2. **ID 重用**：如果表中的最大 ID 行被删除了，SQLite **会重用** 这个 ID。
    - 例如：插入 ID 为 1, 2, 3 的行。删除 ID=3 的行。再插入新行，新行的 ID 将会是 3。

## 3. AUTOINCREMENT 关键字的作用

`AUTOINCREMENT` 关键字只能用于 `INTEGER PRIMARY KEY` 字段。它改变了 ID 生成的算法，强制 ID **单调递增**，且**永不重用**。

### 语法

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT
);
```

### AUTOINCREMENT 的核心规则

1. **全局单调性**：新生成的 ID 必定大于该表中曾经存在过的最大 ID。
2. **防止重用**：即使删除了表中的最后一行（最大 ID），新插入的数据也不会使用被删除的 ID，而是继续向后累加。

### 行为对比示例

假设我们执行以下操作序列：

1. 插入行 A (ID=1)
2. 插入行 B (ID=2)
3. 删除行 B
4. 插入行 C

#### 场景 1：未使用 AUTOINCREMENT

- 行 C 的 ID 将是 **2** 。
- 原因：当前表最大 ID 是 1，所以下一个是 1+1=2。

#### 场景 2：使用 AUTOINCREMENT

- 行 C 的 ID 将是 **3** 。
- 原因：SQLite 记住了历史最大 ID 是 2，所以下一个是 2+1=3。

## 4. sqlite_sequence 表

当你第一次在数据库中创建一个包含 `AUTOINCREMENT` 字段的表时，SQLite 会自动创建一个名为 `sqlite_sequence` 的系统表。

这个表用于跟踪所有使用了 `AUTOINCREMENT` 的表的历史最大 ID。

### 表结构

`sqlite_sequence` 包含两列：

- `name`: 表名
- `seq`: 当前已生成的最大序号

### 查询与修改

你可以查询这个表来查看当前的自增进度：

```sql
SELECT * FROM sqlite_sequence;
```

**重置自增 ID：**
如果确实需要重置自增序列（例如清空表后希望 ID 从 1 开始），你可以更新或删除该表中的记录：

```sql
UPDATE sqlite_sequence SET seq = 0 WHERE name = 'orders';
-- 或者
DELETE FROM sqlite_sequence WHERE name = 'orders';
```

## 5. 何时应该使用 AUTOINCREMENT？

SQLite 官方文档明确建议：**除非你有严格的业务需求，否则不要使用 AUTOINCREMENT。**

### 为什么不推荐？

1. **性能开销** ：使用 `AUTOINCREMENT` 会增加 CPU、内存和磁盘 I/O 的开销。因为每次插入时，SQLite 都必须查询并更新 `sqlite_sequence` 表。
2. **存储空间** ：额外的 `sqlite_sequence` 表占用少量空间。
3. **默认行为通常足够**：对于大多数简单的关联关系，ID 是否重用并不影响逻辑，只要它是唯一的即可。

### 何时必须使用？

1. **严格的历史唯一性** ：当你需要生成的 ID 在该表的整个生命周期内（即使行被删除）都不能重复时。例如，生成发票号码、订单号，避免因删除旧订单导致新订单使用了旧号码，从而混淆审计记录。
2. **防止数据关联错误** ：如果外部系统记录了你的 ID，而你在 SQLite 中删除了该行。如果 ID 被重用，外部系统可能会错误地关联到新数据。

## 6. 常见陷阱

1. **必须是 INTEGER** ：`AUTOINCREMENT` 只能用于 `INTEGER PRIMARY KEY`。如果你使用 `INT` 或 `BIGINT`，它将不起作用（在 SQLite 中 `INTEGER` 是一个特定的类型亲和性，指代 RowID）。
2. **最大值限制** ：如果 `ROWID` 达到最大值（9223372036854775807），普通的 `INTEGER PRIMARY KEY` 会尝试搜索表中未使用的随机 ID。但带有 `AUTOINCREMENT` 的表在达到最大值后，尝试插入新行会报错 `database or disk is full`。

## 7. 总结

- **默认情况** ：使用 `id INTEGER PRIMARY KEY`。这最快，且满足 95% 的需求。
- **特殊情况** ：仅当你必须保证 ID 永远不回退、不重用被删除的 ID 时，才使用 `id INTEGER PRIMARY KEY AUTOINCREMENT`。
- **原理** ：它依赖内部系统表 `sqlite_sequence` 来记录历史峰值。
