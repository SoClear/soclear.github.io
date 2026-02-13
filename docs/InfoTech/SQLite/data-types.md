# 数据类型

SQLite 的数据类型系统与其他主流关系型数据库（如 MySQL、PostgreSQL）有着本质的区别。理解这种差异对于编写高效、稳定的 SQLite 应用程序至关重要。

本文将详细介绍 SQLite 的动态类型系统、存储类、类型亲和性以及如何处理布尔值和日期时间。

## 1. 核心概念：动态类型系统

大多数 SQL 数据库引擎使用**静态类型（Static Typing）**。这意味着数据类型与**列（Column）**绑定，存入的数据必须符合该列定义的类型。

相反，SQLite 使用**动态类型（Dynamic Typing）**，也称为**清单类型（Manifest Typing）**。在 SQLite 中：

- 数据类型与 **值（Value）** 绑定，而不是与容器（列）绑定。
- 你可以在定义为 `INTEGER` 的列中存储字符串，或者在 `TEXT` 列中存储浮点数（除非使用了 STRICT 表）。
- 尽管如此，SQLite 仍然允许在创建表时指定数据类型，这主要用于确定**类型亲和性（Type Affinity）**。

## 2. 存储类（Storage Classes）

在数据库底层，SQLite 支持 5 种基本的存储类。数据库中存储的每个值都属于以下之一：

| 存储类 | 描述 |
| :--- | :--- |
| **NULL** | 空值。 |
| **INTEGER** | 有符号整数。根据数值的大小，自动存储为 1、2、3、4、6 或 8 字节。 |
| **REAL** | 浮点数。存储为 8 字节的 IEEE 浮点数。 |
| **TEXT** | 文本字符串。使用数据库编码（UTF-8、UTF-16BE 或 UTF-16LE）存储。 |
| **BLOB** | 二进制大对象。数据完全按输入原样存储，不做任何转换。 |

## 3. 类型亲和性（Type Affinity）

为了最大限度地兼容 SQL 标准和其他数据库引擎，SQLite 支持列的“类型亲和性”。亲和性是指列推荐存储的数据类型。当数据插入时，SQLite 会尝试将数据转换为该列的首选类型。

SQLite 定义了 5 种亲和性：

### 3.1 TEXT

该列首选存储 `NULL`、`TEXT` 或 `BLOB`。如果插入数值数据（`INTEGER` 或 `REAL`），系统会在存储前将其转换为文本形式。

- **常见声明类型：** `CHARACTER(20)`, `VARCHAR(255)`, `TEXT`, `CLOB`

### 3.2 NUMERIC

该列可以包含所有 5 种存储类。如果插入文本数据且该文本看起来像数字（例如字符串 "12.34"），系统会尝试将其转换为 `INTEGER` 或 `REAL`。如果转换失败，则按 `TEXT` 存储。

- **常见声明类型：** `NUMERIC`, `DECIMAL(10,5)`, `BOOLEAN`, `DATE`, `DATETIME`

### 3.3 INTEGER

行为与 `NUMERIC` 类似，但有一个关键区别：如果插入浮点数且没有小数部分（例如 12.0），它会被转换为整数（12）存储。

- **常见声明类型：** `INT`, `INTEGER`, `TINYINT`, `SMALLINT`, `BIGINT`

### 3.4 REAL

行为与 `NUMERIC` 类似，但它会将整数强制转换为浮点数表示。

- **常见声明类型：** `REAL`, `DOUBLE`, `FLOAT`

### 3.5 BLOB

该列没有类型偏好，不进行任何数据转换。

- **常见声明类型：** `BLOB`, 或者未指定数据类型。

### 示例：类型转换演示

```sql
CREATE TABLE example (
    t_col TEXT,
    n_col NUMERIC,
    i_col INTEGER
);

-- 插入整数 500
INSERT INTO example VALUES (500, 500, 500);
-- 结果存储为:
-- t_col: '500' (TEXT)
-- n_col: 500   (INTEGER)
-- i_col: 500   (INTEGER)

-- 插入字符串 '500'
INSERT INTO example VALUES ('500', '500', '500');
-- 结果存储为:
-- t_col: '500' (TEXT)
-- n_col: 500   (INTEGER) -> 被转换
-- i_col: 500   (INTEGER) -> 被转换
```

## 4. 特殊数据类型的处理

SQLite 没有专门的 Boolean 或 Date/Time 存储类，而是采用通用的方式处理。

### 4.1 布尔类型 (Boolean)

SQLite 没有单独的 `BOOLEAN` 类型。布尔值被存储为整数：

- **0** 代表 `FALSE`
- **1** 代表 `TRUE`

虽然你可以定义列类型为 `BOOLEAN`，但这只是给了它 `NUMERIC` 亲和性。

### 4.2 日期和时间 (Date and Time)

SQLite 没有 `DATETIME` 对象。开发者通常选择以下三种格式之一存储时间：

1. **TEXT**: ISO8601 字符串 (`"YYYY-MM-DD HH:MM:SS.SSS"`). 可读性好，内置函数支持佳。
2. **REAL**: 儒略日 (Julian Day Numbers). 适合复杂的日期计算。
3. **INTEGER**: Unix 时间戳 (自 1970-01-01 以来的秒数). 存储空间小，排序快。

**推荐做法**：通常建议使用 `TEXT` (ISO8601) 或 `INTEGER` (Unix Timestamp)，取决于是否需要跨语言可读性或性能优先。

## 5. 主键的特殊行为

在 SQLite 中，定义为 `INTEGER PRIMARY KEY` 的列具有特殊意义：

1. 它是 **ROWID** 的别名。
2. 它必须存储 64 位有符号整数。
3. 如果插入非整数值，SQLite 会报错（这一点类似静态类型数据库）。

**注意**：`INT PRIMARY KEY` 不具备这种特性，只有精确的 `INTEGER PRIMARY KEY` 才会触发这种行为。

## 6. STRICT 表 (SQLite 3.37.0+)

从 SQLite 3.37.0 版本开始，引入了 `STRICT` 表选项。如果在创建表时使用了 `STRICT` 关键字，SQLite 将强制执行数据类型检查，禁止将不匹配的数据类型插入列中。

```sql
CREATE TABLE strict_table (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL
) STRICT;

-- 下面的语句会报错，因为 price 列要求 REAL，不能存入文本
INSERT INTO strict_table (name, price) VALUES ('Widget', 'expensive');
```

STRICT 表支持的数据类型有限：`INT`, `INTEGER`, `REAL`, `TEXT`, `BLOB`, `ANY`。

## 7. 总结与最佳实践

1. **理解灵活性**：不要因为 SQLite 允许乱存类型就滥用这一特性。保持列数据的一致性是应用层的责任。
2. **显式声明**：尽管可以不写类型，但为了代码可读性和亲和性转换的预期行为，建议始终显式声明列类型（如 `TEXT`, `INTEGER`）。
3. **时间处理**：在项目开始时统一时间存储格式（推荐 ISO8601 字符串或 Unix 时间戳），避免后期混乱。
4. **使用 STRICT**：对于新项目，如果希望获得类似 MySQL/PostgreSQL 的严格类型约束，建议启用 `STRICT` 模式。
