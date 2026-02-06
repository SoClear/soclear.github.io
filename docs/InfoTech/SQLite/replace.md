# REPLACE

## 1. 概述

`REPLACE` 语句是 SQLite 中用于处理数据插入冲突的强力工具。它实际上是 `INSERT OR REPLACE` 的简写形式。

它的核心逻辑如下：

1. 尝试执行插入操作。
2. 如果插入操作因为违反了 `PRIMARY KEY` 或 `UNIQUE` 约束而失败，SQLite 会先**删除**引起冲突的旧行。
3. 然后再次尝试**插入**新行。

**关键点**：它不是“修改”数据，而是“替换”数据（先删后增）。

## 2. 语法

`REPLACE` 的语法结构与 `INSERT` 基本一致：

```sql
REPLACE INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
```

或者使用子查询：

```sql
REPLACE INTO table_name (column1, column2, ...)
SELECT column1, column2, ...
FROM another_table;
```

## 3. 运行机制详解

理解 `REPLACE` 的工作流程至关重要，因为它与 `UPDATE` 有着本质的区别：

1. **约束检查**：SQLite 检查待插入的数据是否违反了表上的唯一性约束（主键或唯一索引）。
2. **无冲突**：如果不存在冲突，`REPLACE` 的行为完全等同于 `INSERT`。
3. **有冲突**：
    - SQLite 找到冲突的现有行。
    - 执行 **DELETE** 操作移除该行（这意味着任何关联的 `DELETE` 触发器都会被激活）。
    - 执行 **INSERT** 操作插入新行（这意味着新行中未指定的列将重置为默认值或 NULL，且会生成新的 `ROWID`，除非显式指定）。

## 4. 实战演示

为了演示 `REPLACE` 的效果，我们需要一个带有唯一约束的表。

### 4.1 数据准备

创建一个存储用户配置的表，其中 `key` 列必须是唯一的。

```sql
CREATE TABLE user_config (
    id INTEGER PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    update_time TEXT
);

-- 插入初始数据
INSERT INTO user_config (key, value, update_time)
VALUES ('theme', 'dark', '2023-01-01');

INSERT INTO user_config (key, value, update_time)
VALUES ('language', 'en', '2023-01-01');
```

**当前数据状态：**

| id | key | value | update_time |
| :--- | :--- | :--- | :--- |
| 1 | theme | dark | 2023-01-01 |
| 2 | language | en | 2023-01-01 |

### 4.2 场景 1：无冲突（类似 INSERT）

插入一个不存在的 key：

```sql
REPLACE INTO user_config (key, value, update_time)
VALUES ('font_size', '14px', '2023-10-01');
```

**结果**：新行被直接插入，效果等同于 `INSERT`。

### 4.3 场景 2：有冲突（触发替换）

现在我们想更新 `theme` 配置。注意，我们这次没有指定 `id`。

```sql
REPLACE INTO user_config (key, value, update_time)
VALUES ('theme', 'light', '2023-10-05');
```

**结果分析：**

| id | key | value | update_time |
| :--- | :--- | :--- | :--- |
| 2 | language | en | 2023-01-01 |
| 3 | font_size | 14px | 2023-10-01 |
| **4** | theme | light | 2023-10-05 |

**重要观察**：

1. 旧的 `theme` 行（id=1）被删除了。
2. 新的 `theme` 行被插入，**ID 变成了 4**（自增）。
3. 如果表中有其他列未在 `REPLACE` 语句中指定，这些列的值会重置为默认值或 NULL，而不是保留旧行的值。

## 5. REPLACE 与 UPDATE 的区别

这是初学者最容易混淆的地方：

- **UPDATE**：修改现有行。未涉及的列保持原样。ID（主键）通常不变。
- **REPLACE**：删除旧行，插入新行。未涉及的列会丢失（重置为 NULL 或默认值）。ID 可能会改变（除非显式指定了 ID）。

**何时使用 UPDATE：**

- 只想修改某一个字段（例如：只修改 `update_time`，保持 `value` 不变）。
- 希望保留主键 ID 不变，防止破坏外键关系。

**何时使用 REPLACE：**

- 当你拥有完整的一行数据，想要确保它被写入数据库，而不关心它之前是否存在。
- 通常用于“设置”类操作（Upsert），即“如果不存在则新建，如果存在则覆盖”。

## 6. 潜在风险与注意事项

使用 `REPLACE` 时需警惕以下副作用：

1. **外键级联删除**：如果启用了外键约束（Foreign Keys）且设置了 `ON DELETE CASCADE`，使用 `REPLACE` 替换父表记录会导致子表关联数据被自动删除，因为 `REPLACE` 内部执行了删除操作。
2. **触发器副作用**：`REPLACE` 会触发表上的 `DELETE` 触发器和 `INSERT` 触发器，而不会触发 `UPDATE` 触发器。
3. **主键变化**：如示例所示，如果主键是自增的且未在语句中指定，记录的主键 ID 会发生变化。这可能会导致依赖该 ID 的外部逻辑失效。

## 7. 总结

- `REPLACE` 是 `INSERT OR REPLACE` 的别名。
- 它用于解决唯一性约束冲突。
- 机制是：**先删除旧行，再插入新行**。
- 小心由“删除”动作引起的副作用（如主键变更、外键级联、触发器执行）。
- 如果只想局部更新字段且保留其他字段值，请使用 `UPDATE` 或 SQLite 3.24+ 引入的 `UPSERT` 语法（`INSERT ... ON CONFLICT DO UPDATE`）。
