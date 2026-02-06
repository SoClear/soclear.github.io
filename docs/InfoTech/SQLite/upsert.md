# UPSERT

## 1. 概述

"UPSERT" 是 "UPDATE" 和 "INSERT" 的组合词。它描述了这样一种业务逻辑：尝试插入一行数据，如果因为唯一性约束（主键或唯一索引）导致插入失败，则自动转为执行更新操作。

在 SQLite 中，UPSERT 并不是一个独立的关键字，而是通过在 `INSERT` 语句后添加 `ON CONFLICT` 子句来实现的。

**版本要求**：SQLite 3.24.0 及以上版本。

## 2. 语法

UPSERT 有两种主要的处理模式：

### 模式 A：忽略冲突 (DO NOTHING)

如果发生冲突，什么也不做（既不报错，也不插入，也不更新）。

```sql
INSERT INTO table_name (col1, col2)
VALUES (val1, val2)
ON CONFLICT(conflict_target) DO NOTHING;
```

### 模式 B：发生冲突时更新 (DO UPDATE)

如果发生冲突，则更新特定的列。

```sql
INSERT INTO table_name (col1, col2)
VALUES (val1, val2)
ON CONFLICT(conflict_target) 
DO UPDATE SET col2 = value, col3 = value 
[WHERE condition];
```

- **conflict_target**：导致冲突的列名（必须是 PRIMARY KEY 或 UNIQUE 索引列）。

## 3. 核心概念：excluded 伪表

在 `DO UPDATE` 子句中，我们需要引用“原本试图插入但失败了的新值”。SQLite 提供了一个名为 `excluded` 的特殊伪表来访问这些值。

- `table_name.column`：表示表中**原有**的值。
- `excluded.column`：表示**试图插入**的新值。

## 4. 实战演示

我们将创建一个商品库存表来演示 UPSERT 的强大之处，特别是累加库存的场景。

### 4.1 数据准备

```sql
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,  -- 商品编码，必须唯一
    quantity INTEGER DEFAULT 0,
    update_time TEXT
);

-- 插入初始数据
INSERT INTO inventory (sku, quantity, update_time)
VALUES ('A001', 10, '2023-01-01');
```

**当前状态**：
SKU 为 'A001' 的商品有 10 件。

### 4.2 场景 1：忽略重复数据 (DO NOTHING)

当我们批量导入数据时，可能希望跳过已存在的记录。

```sql
INSERT INTO inventory (sku, quantity, update_time)
VALUES ('A001', 50, '2023-10-01')
ON CONFLICT(sku) DO NOTHING;
```

**结果**：由于 'A001' 已存在，该语句静默结束，不报错，数据也不变。库存仍为 10。

### 4.3 场景 2：覆盖更新 (DO UPDATE - 简单替换)

如果数据存在，则用新值覆盖旧值（类似 `REPLACE`，但更安全）。

```sql
INSERT INTO inventory (sku, quantity, update_time)
VALUES ('A001', 50, '2023-10-02')
ON CONFLICT(sku) 
DO UPDATE SET 
    quantity = excluded.quantity,
    update_time = excluded.update_time;
```

**结果**：'A001' 的库存变为 50。这里的 `excluded.quantity` 指的就是 VALUES 中的 50。

### 4.4 场景 3：增量更新 (DO UPDATE - 累加逻辑)

这是 UPSERT 最经典的用法。新货到了，如果商品已存在，我们希望在原有库存基础上**加上**新入库的数量，而不是覆盖它。

```sql
-- 假设又来了 20 件 A001
INSERT INTO inventory (sku, quantity, update_time)
VALUES ('A001', 20, '2023-10-03')
ON CONFLICT(sku) 
DO UPDATE SET 
    quantity = inventory.quantity + excluded.quantity,
    update_time = excluded.update_time;
```

**解析**：

- `inventory.quantity`：表中原来的值 (50)。
- `excluded.quantity`：准备插入的值 (20)。
- **结果**：库存变为 70 (50 + 20)。

## 5. 进阶：带条件的更新

你可以在 `DO UPDATE SET` 后面加上 `WHERE` 子句，仅在满足特定条件时才执行更新。

**需求**：只有当新数据的 `update_time` 晚于表中的 `update_time` 时才更新（防止旧数据覆盖新数据）。

```sql
INSERT INTO inventory (sku, quantity, update_time)
VALUES ('A001', 5, '2023-09-01') -- 这是一条过期的旧数据
ON CONFLICT(sku) 
DO UPDATE SET 
    quantity = excluded.quantity,
    update_time = excluded.update_time
WHERE excluded.update_time > inventory.update_time;
```

**结果**：由于 '2023-09-01' 不大于表中的 '2023-10-03'，更新被忽略。

## 6. UPSERT 与 REPLACE 的关键区别

我们在上一篇文档中介绍了 `REPLACE`。虽然两者都能解决冲突，但机制完全不同：

| 特性 | REPLACE | UPSERT (INSERT ... ON CONFLICT) |
| :--- | :--- | :--- |
| **底层机制** | 先 **DELETE** 旧行，再 **INSERT** 新行 | 直接 **UPDATE** 现有行 |
| **主键 ID** | 如果未指定 ID，旧 ID 丢失，生成新 ID | **保留** 原有行的主键 ID |
| **未涉及列** | 重置为默认值或 NULL | **保留** 原有值 (除非显式更新) |
| **触发器** | 触发 DELETE 和 INSERT 触发器 | 触发 INSERT (成功时) 或 UPDATE (冲突时) 触发器 |
| **外键影响** | 可能导致级联删除 (Cascade Delete) | 安全，不影响外键引用 |

**结论**：在绝大多数业务场景下（尤其是需要保留主键关联和历史数据时），应优先使用 **UPSERT**。仅当你确实需要“彻底替换一行数据”时才使用 `REPLACE`。

## 7. 总结

- 使用 `INSERT ... ON CONFLICT` 实现 UPSERT。
- 需要指定冲突目标（即哪一列具有唯一性约束）。
- 利用 `excluded` 伪表引用新插入的数据。
- 利用 `DO UPDATE SET col = table.col + excluded.col` 实现原子累加。
- 相比 `REPLACE`，UPSERT 更高效且无破坏性。
