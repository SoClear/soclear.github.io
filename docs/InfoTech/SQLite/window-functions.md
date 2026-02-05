# 开窗函数

SQL **开窗函数（Window Functions）**，也叫分析函数，是 SQL 中非常强大且进阶的高级功能。

简单来说，它的核心特点是：**既能像聚合函数（SUM, AVG等）一样进行计算，又不会像 `GROUP BY` 那样把多行数据合并成一行。** 计算出的结果会直接显示在每一行数据旁边。

## 核心语法

开窗函数最显著的标志是 **`OVER()`** 关键字。

```sql
SELECT 
    字段名,
    函数名(字段名) OVER (PARTITION BY 字段名 ORDER BY 字段名 窗口子句) AS 别名
FROM 表名;
```

* **`PARTITION BY`**（分组）：类似于 `GROUP BY`，把数据切分成不同的“窗口”（小组）。如果不写，则全表为一个大窗口。
* **`ORDER BY`**（排序）：决定了窗口内数据的计算顺序（对排名函数和累加计算至关重要）。
* **窗口子句**（可选）：更精细地控制计算范围（比如“当前行及前两行”）。

## 常用开窗函数分类

### 1. 排名函数 (Ranking Functions)

这是开窗函数最常用的场景，解决“组内排名”问题。

* **`ROW_NUMBER()`**：连续排名，不考虑重复。结果：1, 2, 3, 4
* **`RANK()`**：并列排名，跳过后续序号。结果：1, 2, **2**, 4
* **`DENSE_RANK()`**：并列排名，不跳过序号。结果：1, 2, **2**, 3
* **`NTILE(n)`**：将数据切分成 n 个桶（等级），常用于取“前 25% 的用户”。

例子：查询每个部门工资最高的前三名

```sql
SELECT * FROM (
    SELECT name, dept, salary,
           ROW_NUMBER() OVER(PARTITION BY dept ORDER BY salary DESC) as rank_id
    FROM employees
) t WHERE rank_id <= 3;
```

### 2. 聚合开窗函数 (Aggregate Functions)

在每一行后面显示该组的合计值，最典型的用途是计算**占比**或**累计和**。

* **`SUM()` / `AVG()` / `MAX()` / `MIN()` / `COUNT()`**
* **注意点**：如果 `OVER()` 里加了 `ORDER BY`，它会执行**“逐行累加”**；如果不加，则直接计算整个分组的总和。

例子：计算每个人的工资占全公司的百分比

```sql
SELECT name, salary,
       salary / SUM(salary) OVER() as salary_percent
FROM employees;
```

### 3. 偏移函数 (Value Functions)

用于获取当前行之前或之后的特定行数据，常用于计算**环比、同比**。

* **`LAG(col, n)`**：向前取第 n 行的数据。
* **`LEAD(col, n)`**：向后取第 n 行的数据。
* **`FIRST_VALUE()` / `LAST_VALUE()`**：取窗口内的第一个或最后一个值。

例子：计算今日销售额相比昨天的增长率

```sql
SELECT date, sales,
       (sales - LAG(sales, 1) OVER(ORDER BY date)) / LAG(sales, 1) OVER(ORDER BY date) as growth_rate
FROM daily_sales;
```

## 进阶：窗口子句 (Window Frame)

如果你想精确定义计算哪几行（比如：最近 7 天的平均值），就需要用到 `ROWS BETWEEN`。

* `PRECEDING`：向前
* `FOLLOWING`：向后
* `CURRENT ROW`：当前行
* `UNBOUNDED`：无限制（起点或终点）

例子：计算最近 3 天（含今天）的移动平均销量

```sql
SELECT date, sales,
       AVG(sales) OVER(ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg
FROM daily_sales;
```

## 总结：为什么要用开窗函数？

1. **保留细节**：`GROUP BY` 会弄丢原始行，开窗函数可以在不聚合行的情况下做聚合运算。
2. **减少 Self-Join**：以前计算环比、组内排名需要自己连自己（Self-Join），SQL 既长又慢；开窗函数一行搞定，性能通常更好。
3. **逻辑清晰**：处理复杂分析（如：连续登录天数、留存率、中位数）时，开窗函数是唯一的优雅解法。

**一句话口诀**：
> 分组用 `PARTITION`，排序用 `ORDER`，排名看需求，环比找 `LAG/LEAD`。
