# 视图 (VIEW)

在数据库设计中，**视图 (View)** 是一个非常强大的工具。简单来说，视图是一张“虚拟表”。它并不在数据库中实际存储数据，而是保存了一条 SQL 查询语句。当你查询视图时，SQLite 会动态执行这条保存的查询，并返回结果。

本文将详细介绍如何在 SQLite 中创建、管理和使用视图，以及它的适用场景和限制。

## 1. 为什么需要视图？

使用视图主要有以下几个好处：

1. **简化复杂查询**：如果你经常需要编写包含多个 `JOIN` 或复杂筛选条件的 SQL 语句，可以将它保存为视图。之后只需查询这个视图，无需重复编写复杂的逻辑。
2. **数据安全性与隔离**：可以通过视图向特定用户展示表中的部分列，而隐藏敏感数据（例如隐藏 `password` 或 `salary` 字段）。
3. **兼容性过渡**：如果底层表结构发生变化（如列名修改），可以通过修改视图来保持对外接口的名称不变，从而无需修改应用程序代码。

## 2. 创建视图 (CREATE VIEW)

创建视图使用 `CREATE VIEW` 语句。

**语法：**

```sql
CREATE VIEW [IF NOT EXISTS] 视图名称 AS
SELECT 列1, 列2, ...
FROM 表名
WHERE 条件;
```

**实战示例：**

假设有两个表：`customers` (客户) 和 `orders` (订单)。我们想创建一个视图，用来直观地显示客户名和他们的订单总金额。

```sql
-- 基础表结构
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL);

-- 创建视图：显示客户名和订单总额
CREATE VIEW customer_order_summary AS
SELECT 
    c.name AS customer_name,
    COUNT(o.id) AS total_orders,
    IFNULL(SUM(o.amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id;
```

现在，`customer_order_summary` 就表现得像一张普通的表。

## 3. 查询视图

查询视图的语法与查询普通表完全一致。

**示例：**

```sql
-- 查询消费超过 1000 元的客户
SELECT * 
FROM customer_order_summary 
WHERE total_spent > 1000;
```

SQLite 会在后台自动执行视图定义中的 `SELECT` 语句，并结合当前的 `WHERE` 条件进行过滤。

## 4. 删除视图 (DROP VIEW)

当你不再需要某个视图时，可以使用 `DROP VIEW` 将其移除。这**不会**删除底层表中的任何数据。

**语法：**

```sql
DROP VIEW [IF EXISTS] 视图名称;
```

**示例：**

```sql
DROP VIEW customer_order_summary;
```

## 5. 修改视图

这是 SQLite 与其他大型数据库（如 SQL Server 或 Oracle）的一个主要区别：

**SQLite 不支持 `ALTER VIEW` 语句。**

如果你需要修改视图的定义（例如增加一列或修改过滤条件），必须遵循以下两个步骤：

1. 使用 `DROP VIEW` 删除旧视图。
2. 使用 `CREATE VIEW` 重新创建新视图。

**示例流程：**

```sql
-- 1. 删除旧视图
DROP VIEW IF EXISTS customer_order_summary;

-- 2. 重新创建（增加了 email 字段）
CREATE VIEW customer_order_summary AS
SELECT 
    c.name,
    c.email, -- 新增的字段
    SUM(o.amount) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id;
```

## 6. 进阶：视图是只读的吗？

在 SQLite 中，视图默认是**只读的 (Read-Only)**。

这意味着你**不能**直接对视图执行 `INSERT`、`UPDATE` 或 `DELETE` 操作，因为视图本身不存储数据。

### 如何让视图变得“可写”？

如果确实需要通过视图修改底层数据，必须使用 **`INSTEAD OF` 触发器 (Triggers)**。你需要告诉 SQLite，当有人试图向视图插入数据时，具体应该在底层表中执行什么操作。

### 示例：通过视图更新数据

```sql
-- 创建一个简单的视图
CREATE VIEW user_view AS SELECT id, name FROM users;

-- 创建触发器：当用户尝试更新视图时，拦截操作并更新原表
CREATE TRIGGER update_user_view
INSTEAD OF UPDATE ON user_view
BEGIN
    UPDATE users 
    SET name = NEW.name 
    WHERE id = NEW.id;
END;
```

添加触发器后，执行 `UPDATE user_view SET name = 'New Name' WHERE id = 1;` 就会生效。

## 7. 临时视图 (TEMP VIEW)

你也可以创建临时视图，它们只在当前数据库连接期间存在。当连接关闭时，视图自动消失。

**语法：**

```sql
CREATE TEMP VIEW 视图名称 AS ...
```

这在进行复杂的数据分析或调试时非常有用，可以避免污染数据库的永久结构。

## 8. 总结与注意事项

- **性能**：视图仅仅是存储的 SQL 语句。每次查询视图时，SQLite 都会重新运行内部的查询。对于极其复杂的视图，可能会有性能开销。
- **结构依赖**：如果删除了底层的表，视图依然存在，但在查询时会报错。
- **不可修改**：记住 SQLite 无法直接 `ALTER VIEW`，修改意味着“重建”。
- **只读属性**：除非配置了 `INSTEAD OF` 触发器，否则不要尝试对视图进行增删改操作。

通过合理使用视图，你可以让数据库结构逻辑更加清晰，同时大幅简化应用程序中的 SQL 代码。
