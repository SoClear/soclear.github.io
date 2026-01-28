# 条件分支

在 SQL 中，条件分支逻辑（If-Then-Else）是实现数据分类、动态计算和流程控制的核心。虽然 SQL 是一种声明式语言，但它提供了多种方式来处理“根据不同条件返回不同结果”的需求。

## 1. 标准 SQL：`CASE` 表达式

`CASE` 是 SQL 中最通用、最强大的条件分支工具，几乎所有主流数据库（MySQL, PostgreSQL, Oracle, SQL Server, SQLite）都支持它。

### 1.1 简单 CASE (Simple CASE)

适用于对**单个列或表达式**进行等值比较。

- **语法：**

    ```sql
    CASE expression
        WHEN value1 THEN result1
        WHEN value2 THEN result2
        ...
        ELSE result_n
    END
    ```

- **示例：** 将订单状态码转换为易读文字。

    ```sql
    SELECT order_id,
           CASE status
               WHEN 1 THEN '待付款'
               WHEN 2 THEN '已付款'
               WHEN 3 THEN '已发货'
               ELSE '其他'
           END AS status_text
    FROM orders;
    ```

### 1.2 搜索 CASE (Searched CASE)

适用于更复杂的**逻辑判断**（范围判断、多列组合判断、非等值判断）。

- **语法：**

    ```sql
    CASE
        WHEN condition1 THEN result1
        WHEN condition2 THEN result2
        ...
        ELSE result_n
    END
    ```

- **示例：** 根据分数划分等级。

    ```sql
    SELECT name, score,
           CASE
               WHEN score >= 90 THEN '优秀'
               WHEN score >= 60 THEN '及格'
               ELSE '不及格'
           END AS grade
    FROM students;
    ```

## 2. SQLite 数据库特有的简写函数

为了简化代码，SQLite 数据库提供了针对特定分支逻辑的快捷函数。

### 2.1 `IIF()` 函数（最常用）

从 SQLite **3.32.0** (2020年发布) 开始，SQLite 引入了 `IIF()`，它是 `CASE WHEN` 二选一逻辑的缩写，语法与 SQL Server 和 Excel 相同。

- **语法：** `IIF(expression, true_value, false_value)`

```sql
SELECT name, IIF(score >= 60, '及格', '不及格') AS result FROM students;
```

*这等同于：`CASE WHEN score >= 60 THEN '及格' ELSE '不及格' END`*

### 2.2 `IFNULL()` 函数

专门用于处理空值的简写。

- **语法：** `IFNULL(val, default_value)`
- **作用：** 如果 `val` 不为 NULL，返回 `val`；否则返回 `default_value`。

```sql
SELECT name, IFNULL(phone, '无电话') FROM users;
```

### 2.3 `COALESCE()` 函数

标准 SQL 函数，SQLite 也支持。它可以接收多个参数。

- **作用：** 返回参数列表中的第一个非空值。

```sql
-- 依次检查移动电话、家庭电话，如果都为空则返回'未提供'
SELECT name, COALESCE(mobile, home_phone, '未提供') FROM contacts;
```

### 2.4 `NULLIF()` 函数

- **作用：** 如果两个参数相等，返回 NULL；否则返回第一个参数。
- **场景：** 常用于除法防错。

```sql
SELECT 100 / NULLIF(count, 0) FROM stats; -- 如果 count 是 0，则返回 NULL 而不是报错
```

## 3. 条件分支在不同子句中的应用

### 3.1 在 `ORDER BY` 中实现动态排序

首先定义参数：

```sql
.parameter set @sort_type 'price'
```

注意：定义参数只在 SQLite 自带的终端工具里有效，在代码（如 Python/Java）或某些 GUI 工具中无效。

然后根据参数改变排序规则：

```sql
SELECT * FROM products
ORDER BY 
    CASE WHEN @sort_type = 'price' THEN price END ASC,
    CASE WHEN @sort_type = 'stock' THEN stock END DESC;
```

### 3.2 在 `GROUP BY` 中实现动态分组

例如将连续的数值划分为区间。

```sql
SELECT 
    CASE 
        WHEN age < 20 THEN '20岁以下'
        WHEN age BETWEEN 20 AND 40 THEN '20-40岁'
        ELSE '40岁以上'
    END AS age_group,
    COUNT(*)
FROM users
GROUP BY age_group;
```

### 3.3 在 `UPDATE` 中实现条件更新

```sql
UPDATE employees
SET salary = CASE 
    WHEN department = 'Sales' THEN salary * 1.1
    WHEN department = 'IT' THEN salary * 1.05
    ELSE salary
END;
```

## 总结与建议

1. **优先使用 `CASE WHEN`**：它是跨平台的标准语法，可读性好。
2. **注意 `ELSE` 缺失**：在 `CASE` 语句中，如果所有 `WHEN` 都不匹配且没有 `ELSE`，结果将返回 `NULL`。为了安全，建议总是写上 `ELSE`。
3. **短路特性**：`CASE` 语句从上到下评估，一旦匹配到第一个 `TRUE` 的条件，后续的分支将不再执行。利用这一点可以优化性能（将最可能的条件写在前面）。
