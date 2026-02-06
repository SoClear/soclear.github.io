# 子查询 (Subquery)

## 1. 什么是子查询

子查询（Subquery），也称为嵌套查询（Nested Query）或内部查询（Inner Query），是指嵌套在另一个 SQL 查询语句中的 `SELECT` 语句。

子查询的数据来源于一个查询，而这个查询的结果被用作外部查询（Outer Query）的条件或数据源。

**基本规则：**

- 子查询必须包含在括号 `()` 中。
- 子查询通常在主查询执行之前执行一次（相关子查询除外）。
- 子查询可以用于 `SELECT`、`INSERT`、`UPDATE` 和 `DELETE` 语句中，也可以同 `=`、`<`、`>`、`IN`、`NOT IN`、`EXISTS` 等运算符一起使用。

## 2. 示例数据环境

为了演示，假设我们有以下两个表：

### departments (部门表)

| id | name |
| :--- | :--- |
| 1 | 技术部 |
| 2 | 销售部 |
| 3 | 人事部 |

### employees (员工表)

| id | name | salary | department_id |
| :--- | :--- | :--- | :--- |
| 1 | 张三 | 8000 | 1 |
| 2 | 李四 | 9000 | 1 |
| 3 | 王五 | 6000 | 2 |
| 4 | 赵六 | 5500 | 2 |
| 5 | 孙七 | 4000 | 3 |

## 3. 子查询的常见使用场景

### 3.1 在 WHERE 子句中使用（标量子查询）

这是最常用的场景。子查询返回单个值（一行一列），该值用于与外部查询的列进行比较。

**场景：** 找出薪资高于所有员工平均薪资的员工。

```sql
SELECT name, salary
FROM employees
WHERE salary > (
    SELECT AVG(salary) 
    FROM employees
);
```

*解析：内部查询首先计算出平均工资（6500），然后外部查询筛选出工资大于 6500 的员工。*

### 3.2 配合 IN / NOT IN 运算符

当子查询返回一个列表（多行一列）时，通常结合 `IN` 运算符使用。

**场景：** 找出属于“技术部”或“销售部”的员工。

```sql
SELECT name, department_id
FROM employees
WHERE department_id IN (
    SELECT id 
    FROM departments 
    WHERE name IN ('技术部', '销售部')
);
```

### 3.3 在 FROM 子句中使用（派生表）

子查询的结果可以作为一个临时表，供外部查询使用。

**场景：** 计算每个部门的平均薪资，然后只显示平均薪资大于 7000 的部门ID。

```sql
SELECT dep_id, avg_sal
FROM (
    SELECT department_id AS dep_id, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY department_id
)
WHERE avg_sal > 7000;
```

*注意：在 FROM 子句中使用子查询时，虽然 SQLite 不需要强制给子查询起别名，但在其他数据库（如 MySQL）中通常需要。*

### 3.4 在 SELECT 子句中使用

子查询可以作为计算列出现，为结果集中的每一行返回一个值。

**场景：** 列出员工姓名，并直接显示其部门名称（不使用 JOIN）。

```sql
SELECT 
    name, 
    salary,
    (SELECT name FROM departments WHERE departments.id = employees.department_id) AS department_name
FROM employees;
```

---

## 4. 相关子查询 (Correlated Subqueries)

普通子查询可以独立运行，而**相关子查询**依赖于外部查询的值。对于外部查询处理的每一行，相关子查询都会执行一次。

**场景：** 查询薪资高于**本部门**平均薪资的员工。

```sql
SELECT name, salary, department_id
FROM employees e1
WHERE salary > (
    SELECT AVG(salary) 
    FROM employees e2
    WHERE e2.department_id = e1.department_id
);
```

**执行逻辑：**

1. 外部查询选取第一行（张三，部门1）。
2. 内部查询计算部门1的平均薪资。
3. 比较张三的薪资是否大于该平均值。
4. 外部查询选取下一行，重复上述步骤。

---

## 5. EXISTS 和 NOT EXISTS 运算符

`EXISTS` 用于检查子查询是否返回任何行。它不返回数据，只返回 True 或 False。一旦子查询找到匹配项，`EXISTS` 就会停止搜索，因此在某些情况下性能优于 `IN`。

**场景：** 查找至少有一名员工的部门。

```sql
SELECT name 
FROM departments d
WHERE EXISTS (
    SELECT 1 
    FROM employees e
    WHERE e.department_id = d.id
);
```

**场景：** 查找没有任何员工的部门（例如新成立的部门）。

```sql
SELECT name 
FROM departments d
WHERE NOT EXISTS (
    SELECT 1 
    FROM employees e
    WHERE e.department_id = d.id
);
```

---

## 6. 在 UPDATE 和 DELETE 中使用子查询

子查询不仅用于查询数据，还可以用于修改数据。

**场景：** 将“技术部”所有员工的薪资提高 10%。

```sql
UPDATE employees
SET salary = salary * 1.1
WHERE department_id = (
    SELECT id 
    FROM departments 
    WHERE name = '技术部'
);
```

**场景：** 删除所有“人事部”的员工。

```sql
DELETE FROM employees
WHERE department_id = (
    SELECT id 
    FROM departments 
    WHERE name = '人事部'
);
```

---

## 7. 性能与最佳实践

1. **子查询 vs JOIN：**
    在许多情况下，使用 `JOIN` 的性能优于子查询，特别是优于相关子查询。SQLite 的查询优化器虽然强大，但显式的 `JOIN` 通常更容易被优化。如果数据量巨大，建议对比两者的执行计划（使用 `EXPLAIN QUERY PLAN`）。

2. **避免深层嵌套：**
    虽然 SQLite 允许嵌套多层子查询，但过多的嵌套会使 SQL 语句难以阅读和维护，并可能影响性能。

3. **使用 EXISTS 代替 IN：**
    当子查询返回的数据集很大，且只需要判断“是否存在”时，`EXISTS` 通常比 `IN` 更快，因为 `EXISTS` 在找到第一个匹配项后就会停止扫描。

4. **NULL 值处理：**
    使用 `NOT IN` 时要非常小心子查询结果中是否包含 `NULL`。如果子查询结果中包含任何 `NULL` 值，`NOT IN` 表达式将永远不会返回 True。在这种情况下，使用 `NOT EXISTS` 更安全。

## 8. 总结

SQLite 子查询是处理复杂数据逻辑的强大工具。通过子查询，我们可以避免编写多条独立的 SQL 语句及在应用程序代码中处理中间结果。掌握标量子查询、列表子查询以及相关子查询，是进阶 SQL 开发者的必备技能。
