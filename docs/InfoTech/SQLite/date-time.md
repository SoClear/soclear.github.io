# 日期与时间 (Date & Time)

## 1. 核心概念：没有专门的数据类型

这是 SQLite 与 MySQL、PostgreSQL 等数据库最大的不同点：**SQLite 没有专门的 `DATETIME`、`DATE` 或 `TIMESTAMP` 存储类（Storage Class）。**

虽然你在建表时可以写 `CREATE TABLE t (d DATETIME)`，但这只是为了兼容性和类型亲和性（Affinity），SQLite 实际上会将日期和时间作为 **TEXT（文本）**、**REAL（浮点数）** 或 **INTEGER（整数）** 存储。

### 三种常见的存储格式

1. **TEXT (ISO8601 字符串)** - **推荐**
    - 格式：`"YYYY-MM-DD HH:MM:SS.SSS"`
    - 示例：`'2023-10-27 14:30:00'`
    - 优点：人类可读，直接支持字符串比较（`>`、`<`）和排序，兼容性最好。

2. **INTEGER (Unix Time / 时间戳)**
    - 格式：从 1970-01-01 00:00:00 UTC 开始的秒数。
    - 示例：`1698417000`
    - 优点：占用空间小（64位整数），计算时间差非常快。

3. **REAL (Julian Day / 儒略日)**
    - 格式：从公元前 4714 年 11 月 24 日正午开始的天数。
    - 示例：`2460245.10416667`
    - 优点：非常适合计算跨度很大的历史日期或精确的天数差。

## 2. 五大核心函数

SQLite 提供了一组内置函数来处理上述格式的转换和计算。

1. **`date(...)`**：返回日期字符串 `YYYY-MM-DD`。
2. **`time(...)`**：返回时间字符串 `HH:MM:SS`。
3. **`datetime(...)`**：返回完整日期时间 `YYYY-MM-DD HH:MM:SS`。
4. **`julianday(...)`**：返回儒略日（浮点数），用于计算天数差。
5. **`strftime(format, ...)`**：最强大的函数，用于自定义格式化（上述 1-4 其实都是它的简写形式）。

## 3. 获取当前时间

**注意：SQLite 默认使用 UTC（协调世界时）。**

### 获取当前 UTC 时间

```sql
SELECT datetime('now');
-- 结果示例: 2023-10-27 06:30:00
```

### 获取当前本地时间

如果你需要服务器所在时区的时间，必须加上 `'localtime'` 修饰符。

```sql
SELECT datetime('now', 'localtime');
-- 结果示例: 2023-10-27 14:30:00 (假设在中国)
```

## 4. 时间计算与修饰符 (Modifiers)

SQLite 的强大之处在于可以通过“修饰符”对时间进行加减运算。修饰符从左到右依次应用。

**基本语法：**
`函数(时间字符串, 修饰符1, 修饰符2, ...)`

### 常用修饰符

- `NNN days` (加减天数)
- `NNN months` (加减月数)
- `NNN years` (加减年数)
- `NNN hours` / `minutes` / `seconds`
- `start of month` (月初)
- `start of year` (年初)
- `start of day` (当天的 00:00:00)
- `weekday N` (前进到下一个星期几，0=周日, 6=周六)

### 实战示例

**1. 计算 7 天后的日期：**

```sql
SELECT date('now', '+7 days');
```

**2. 获取本月第一天：**

```sql
SELECT date('now', 'start of month');
-- 结果: 2023-10-01
```

**3. 获取上个月的最后一天：**
逻辑：先回到本月初，再减去 1 天。

```sql
SELECT date('now', 'start of month', '-1 day');
-- 结果: 2023-09-30
```

**4. 计算明年特定日期的星期几：**

```sql
-- %w 表示星期几 (0-6)
SELECT strftime('%w', 'now', '+1 year');
```

## 5. strftime 格式化详解

`strftime(format, timestring, modifier, ...)` 类似于 C 语言的 `strftime`。

### 常用替换符

| 符号 | 描述 |
| :--- | :--- |
| `%Y` | 年 (0000-9999) |
| `%m` | 月 (01-12) |
| `%d` | 日 (01-31) |
| `%H` | 小时 (00-24) |
| `%M` | 分钟 (00-59) |
| `%S` | 秒 (00-59) |
| `%w` | 星期几 (0-6, 0是周日) |
| `%j` | 一年中的第几天 (001-366) |
| `%s` | Unix 时间戳 (从 1970-01-01 开始的秒数) |

### 示例：将当前时间转换为 Unix 时间戳

```sql
SELECT strftime('%s', 'now');
```

## 6. 计算时间差

在 SQLite 中计算两个日期之间相差多少天或多少秒，通常需要转换格式。

### 计算相差的天数

使用 `julianday()` 将两个时间转换为浮点数，然后相减。

```sql
SELECT julianday('2023-12-31') - julianday('now');
-- 结果: 64.23 (相差大约 64.23 天)
```

### 计算相差的秒数

使用 `strftime('%s', ...)` 或 `unixepoch()` (SQLite 3.38+)。

```sql
SELECT strftime('%s', '2023-10-27 15:00:00') - strftime('%s', '2023-10-27 14:00:00');
-- 结果: 3600
```

## 7. 最佳实践

1. **统一存储格式**：在一个项目中，选定一种格式（建议 TEXT ISO8601 或 INTEGER 时间戳）并坚持使用。不要混用。
2. **存储 UTC**：永远在数据库中存储 UTC 时间。只有在展示给用户时，才转换为本地时间 (`localtime`)。这样可以避免跨时区、夏令时等带来的复杂问题。
3. **利用索引**：如果你使用 TEXT 格式 (`YYYY-MM-DD HH:MM:SS`)，它是可以直接按字母顺序排序的。这意味着你可以安全地在日期列上建立索引，并使用 `BETWEEN` 或 `>` 进行高效查询。

    ```sql
    -- 高效查询 (利用索引)
    SELECT * FROM orders 
    WHERE created_at BETWEEN '2023-01-01' AND '2023-01-31';
    ```

## 8. 新特性：unixepoch (SQLite 3.38+)

在 SQLite 3.38.0 (2022年发布) 及以上版本，新增了 `unixepoch()` 函数，处理时间戳更加方便。

```sql
-- 直接获取当前时间戳 (整数)
SELECT unixepoch(); 

-- 将时间戳转为可读日期
SELECT datetime(1698417000, 'unixepoch');
-- 输出: 2023-10-27 14:30:00

-- 或者转为本地时间
SELECT datetime(1698417000, 'unixepoch', 'localtime');
-- 输出: 2023-10-27 20:30:00
```
