# JOIN

在关系型数据库中，数据通常被分散存储在多个相关的表中。为了从这些分散的表中组合并检索数据，我们需要使用 SQL JOIN（连接）操作。SQLite 支持多种类型的 JOIN，但与 PostgreSQL 或 MySQL 等其他数据库相比，它也有一些独特的限制（例如不支持直接的 RIGHT JOIN）。

本文将详细讲解 SQLite 中各种 JOIN 的用法、区别以及如何模拟 SQLite 不直接支持的连接类型。

## 1. 准备工作：测试数据

为了更好地理解各种 JOIN 的区别，我们需要建立两个简单的表：`departments`（部门表）和 `employees`（员工表）。

请在您的 SQLite 环境中执行以下 SQL 语句来初始化数据：

```sql
-- 创建部门表
CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY,
    dept_name TEXT NOT NULL
);

-- 创建员工表
CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY,
    emp_name TEXT NOT NULL,
    dept_id INTEGER,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- 插入部门数据
INSERT INTO departments (dept_id, dept_name) VALUES (1, '研发部');
INSERT INTO departments (dept_id, dept_name) VALUES (2, '市场部');
INSERT INTO departments (dept_id, dept_name) VALUES (3, '财务部'); -- 没有员工的部门

-- 插入员工数据
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (101, '张三', 1);
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (102, '李四', 1);
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (103, '王五', 2);
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (104, '赵六', NULL); -- 尚未分配部门的员工
```

**数据概览：**

- **研发部** 有张三、李四。
- **市场部** 有王五。
- **财务部** 目前没有员工。
- **赵六** 目前没有归属部门。

## 2. INNER JOIN（内连接）

这是最常用的一种连接类型。`INNER JOIN` 只返回两个表中**匹配**的行。如果某一行在另一个表中找不到匹配项，则该行不会出现在结果中。

### 语法

```sql
SELECT columns
FROM table1
INNER JOIN table2 ON table1.column = table2.column;
```

*(注：`INNER` 关键字是可选的，只写 `JOIN` 默认就是内连接)*

### 示例：查询所有已分配部门的员工及其部门名称

```sql
SELECT 
    e.emp_name, 
    d.dept_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.dept_id;
```

**结果：**

| emp_name | dept_name |
| :--- | :--- |
| 张三 | 研发部 |
| 李四 | 研发部 |
| 王五 | 市场部 |

**分析：**

- "赵六" 被排除了，因为他的 `dept_id` 是 NULL，无法匹配部门。
- "财务部" 被排除了，因为它在员工表中没有对应的记录。

## 3. LEFT JOIN（左连接）

`LEFT JOIN`（也称为 `LEFT OUTER JOIN`）返回左表（`FROM` 子句中的表）的所有行，以及右表（`JOIN` 子句中的表）中匹配的行。如果右表中没有匹配项，则结果中右表的部分显示为 `NULL`。

### 语法

```sql
SELECT columns
FROM table1
LEFT JOIN table2 ON table1.column = table2.column;
```

### 示例：查询所有员工及其部门名称（包括未分配部门的员工）

```sql
SELECT 
    e.emp_name, 
    d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id;
```

**结果：**

| emp_name | dept_name |
| :--- | :--- |
| 张三 | 研发部 |
| 李四 | 研发部 |
| 王五 | 市场部 |
| **赵六** | **NULL** |

**分析：**

- "赵六" 出现在结果中，尽管他没有对应的部门，部门名称列显示为 `NULL`。
- 此查询保留了左表（员工表）的全部数据。

## 4. CROSS JOIN（交叉连接）

`CROSS JOIN` 会生成两个表的**笛卡尔积**。即左表的每一行都会与右表的每一行进行组合。如果左表有 X 行，右表有 Y 行，结果集将会有 X * Y 行。通常不需要 `ON` 子句。

### 语法

```sql
SELECT columns
FROM table1
CROSS JOIN table2;
```

### 示例：列出员工和部门的所有可能组合

```sql
SELECT 
    e.emp_name, 
    d.dept_name
FROM employees e
CROSS JOIN departments d;
```

**结果：**
结果将包含 12 行（4名员工 * 3个部门），无论他们实际是否属于该部门。这种连接在生成测试数据或穷举所有组合场景时非常有用。

| emp_name | dept_name |
| :--- | :--- |
| 张三 | 研发部 |
| 张三 | 市场部 |
| 张三 | 财务部 |
| 李四 | 研发部 |
| 李四 | 市场部 |
| 李四 | 财务部 |
| 王五 | 研发部 |
| 王五 | 市场部 |
| 王五 | 财务部 |
| 赵六 | 研发部 |
| 赵六 | 市场部 |
| 赵六 | 财务部 |

## 5. SELF JOIN（自连接）

自连接并不是一种特殊的关键字，而是指一个表与**它自己**进行连接。这通常用于处理层级数据（如上下级关系）或比较同一表中的行。

**注意：** 进行自连接时，**必须**使用表别名来区分同一个表的两个实例。

### 场景假设

假设我们在员工表中增加一列 `manager_id`，用于存储上级领导的 ID。

- 张三 (ID 101) 的上级是 NULL（他是大老板）。
- 李四 (ID 102) 的上级是 张三 (101)。

```sql
-- 添加列
ALTER TABLE employees ADD COLUMN manager_id INTEGER;
-- 添加上级领导的 ID
UPDATE employees SET manager_id = 101 WHERE emp_id = 102;
```

### 示例：查询员工及其直接上级的名字

```sql
SELECT 
    sub.emp_name AS Subordinate, -- 下属
    mgr.emp_name AS Manager      -- 领导
FROM employees sub
LEFT JOIN employees mgr ON sub.manager_id = mgr.emp_id;
```

这里我们将 `employees` 表分别命名为 `sub`（下属表）和 `mgr`（领导表），通过 `manager_id` 和 `emp_id` 进行关联。

**结果：**

| Subordinate | Manager |
| :--- | :--- |
| 张三 | NULL |
| 李四 | 张三 |
| 王五 | NULL |
| 赵六 | NULL |

## 6. SQLite 不支持的 JOIN 及解决方案

SQLite 目前**不支持** `RIGHT JOIN`（右连接）和 `FULL OUTER JOIN`（全外连接）的直接语法。但是，我们可以通过其他方式轻松实现相同的效果。

### 6.1 模拟 RIGHT JOIN

`RIGHT JOIN` 的逻辑是：返回右表的所有行，以及左表匹配的行。
**解决方案：** 交换表的顺序并使用 `LEFT JOIN`。

**需求：列出所有部门及其员工（包括没有员工的部门）**
这本应是 `employees RIGHT JOIN departments`。

**SQLite 写法：**

```sql
SELECT 
    e.emp_name, 
    d.dept_name
FROM departments d        -- 原右表放左边
LEFT JOIN employees e     -- 原左表放右边
ON d.dept_id = e.dept_id;
```

**结果：**

| emp_name | dept_name |
| :--- | :--- |
| 张三 | 研发部 |
| 李四 | 研发部 |
| 王五 | 市场部 |
| **NULL** | **财务部** |

### 6.2 模拟 FULL OUTER JOIN

`FULL OUTER JOIN` 的逻辑是：只要其中一个表中存在匹配，就返回行（即 左表结果 + 右表结果）。

**解决方案：** 使用 `LEFT JOIN` 结合 `UNION ALL` 或 `UNION`。
标准的模拟方法是：(A 左连 B) UNION (B 左连 A)。

**需求：列出所有员工和所有部门，无论是否匹配**
即包含：有部门的员工、没部门的员工、没员工的部门。

**SQLite 写法：**

```sql
-- 1. 取出所有员工（包括没部门的）
SELECT e.emp_name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id

UNION

-- 2. 取出所有部门（包括没员工的）
-- 注意：这里我们需要从部门表出发进行左连接，并过滤掉已经匹配过的行（可选，或者直接使用 UNION 自动去重）
SELECT e.emp_name, d.dept_name
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id;
```

*注意：`UNION` 会自动去除重复的行（即那些既有员工又有部门的完美匹配行），从而得到正确的全外连接结果。如果出于性能考虑且确定没有重叠，也可以结合 WHERE 条件使用 `UNION ALL`。*

**结果：**

| emp_name | dept_name |
| :--- | :--- |
| 张三 | 研发部 |
| 李四 | 研发部 |
| 王五 | 市场部 |
| 赵六 | NULL |
| NULL | 财务部 |

## 7. 总结与最佳实践

### 不同 JOIN 的速查表

| JOIN 类型 | 关键字 | SQLite 支持 | 描述 |
| :--- | :--- | :--- | :--- |
| **Inner Join** | `INNER JOIN` | ✅ | 只返回两个表中匹配的行（交集）。 |
| **Left Join** | `LEFT JOIN` | ✅ | 返回左表所有行，右表无匹配则为 NULL。 |
| **Right Join** | `RIGHT JOIN` | ❌ | 返回右表所有行（通过交换表顺序用 LEFT JOIN 模拟）。 |
| **Full Join** | `FULL OUTER JOIN` | ❌ | 返回两表所有行（通过 LEFT JOIN + UNION 模拟）。 |
| **Cross Join** | `CROSS JOIN` | ✅ | 返回两个表的笛卡尔积（所有组合）。 |

### 性能建议

1. **使用索引：** 确保用于 `ON` 子句连接的列（如外键 `dept_id`）上建立了索引。这对于大型表的 JOIN 性能至关重要。
2. **明确列名：** 在 SELECT 子句中，尽量使用 `table_name.column_name` 或别名（`e.emp_name`），而不是仅仅写列名，这样可以避免列名冲突并提高代码可读性。
3. **避免笛卡尔积：** 除非确实需要，否则不要忘记在 JOIN 语句中添加 `ON` 条件，否则会意外产生巨大的 CROSS JOIN 结果集。
