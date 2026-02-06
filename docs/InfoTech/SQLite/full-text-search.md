# 全文搜索 (FTS5)

## 简介

在数据库中搜索文本时，最简单的方法是使用 `LIKE` 语句（例如 `WHERE content LIKE '%sqlite%'`）。然而，`LIKE` 存在严重的性能缺陷：它无法利用普通索引，必须进行全表扫描。当数据量达到数万条时，查询会变得非常缓慢。

SQLite 通过 **FTS (Full-Text Search)** 扩展模块解决了这个问题。它使用“倒排索引”（Inverted Index）技术，能够在毫秒级时间内从海量文本中检索出匹配的文档。

目前 SQLite 推荐使用 **FTS5** 版本（SQLite 3.9.0+ 引入）。

## 1. 创建 FTS 表

FTS 表是一种**虚拟表**（Virtual Table）。创建时需要使用 `USING fts5` 语法。

```sql
-- 创建一个名为 posts_fts 的全文索引表
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title,
    content,
    tokenize = 'porter' -- 可选：指定分词器
);
```

**注意要点**：

1. **不指定类型**：FTS5 列不需要指定数据类型（如 TEXT, INTEGER），它们默认都是文本。
2. **分词器 (Tokenizers)**：默认分词器是 `unicode61`（适合大多数语言）。示例中的 `porter` 是针对英语的词干提取分词器（例如搜索 "run" 能匹配 "running"）。对于中文环境，通常需要使用第三方分词扩展（如 `simple`）或在应用层分词后存入。

## 2. 数据管理

FTS5 表的操作与普通表几乎一致。你可以使用标准的 `INSERT`、`UPDATE` 和 `DELETE` 语句。

```sql
-- 插入数据
INSERT INTO posts_fts (title, content) 
VALUES ('SQLite 教程', 'SQLite 是一个轻量级的嵌入式数据库。');

INSERT INTO posts_fts (title, content) 
VALUES ('FTS5 简介', 'FTS5 模块提供了全文搜索功能，速度非常快。');
```

通常情况下，为了节省空间并保持数据一致性，我们会通过**触发器 (Triggers)** 将 FTS 表与主业务表关联起来，或者仅将 FTS 表作为搜索索引使用。

## 3. 基础查询 (MATCH)

全文搜索的核心是 `MATCH` 操作符。

**语法**：
`table_name MATCH 'query_string'`

```sql
-- 查找 content 列中包含 "sqlite" 的行
SELECT * FROM posts_fts 
WHERE posts_fts MATCH 'sqlite';
```

**注意**：

- 查询条件通常放在 `WHERE` 子句中。
- 左侧可以是表名（搜索所有列）或列名（搜索特定列）。

```sql
-- 仅在 title 列中搜索
SELECT * FROM posts_fts 
WHERE title MATCH '教程';
```

## 4. 高级搜索语法

FTS5 支持强大的查询语法，类似于搜索引擎。

### 4.1 前缀查询 (*)

用于查找以特定前缀开头的单词。

```sql
-- 匹配 "light", "lightning", "lightweight" 等
SELECT * FROM posts_fts WHERE posts_fts MATCH 'light*';
```

### 4.2 短语查询 ("...")

使用双引号强制匹配完整的短语。

```sql
-- 严格匹配 "embedded database" 这个短语
SELECT * FROM posts_fts WHERE posts_fts MATCH '"embedded database"';
```

### 4.3 逻辑运算符 (AND, OR, NOT)

- **AND** (默认)：通常不需要显式写出，空格即代表 AND。
- **OR**：匹配任意一个词。
- **NOT**：排除包含该词的记录。

```sql
-- 包含 "sqlite" 且包含 "search"
SELECT * FROM posts_fts WHERE posts_fts MATCH 'sqlite search';

-- 包含 "sqlite" 或 "mysql"
SELECT * FROM posts_fts WHERE posts_fts MATCH 'sqlite OR mysql';

-- 包含 "sqlite" 但不包含 "android"
SELECT * FROM posts_fts WHERE posts_fts MATCH 'sqlite NOT android';

-- 要更改算符优先级，可以用括号分组表达式。例如：
-- 包含 "sqlite" 且匹配 "android" 或 "help"
SELECT * FROM posts_fts WHERE posts_fts MATCH 'sqlite AND (android OR help)';
```

## 5. 排序与相关性 (Ranking)

FTS5 提供了一个名为 `rank` 的隐藏列，表示搜索结果的相关性得分。数值越小，相关性通常越高（具体取决于评分算法，默认为 BM25）。

```sql
SELECT title, rank 
FROM posts_fts 
WHERE posts_fts MATCH 'database' 
ORDER BY rank;
```

## 6. 辅助函数：高亮显示 (Highlight)

为了在搜索结果中高亮匹配的关键词，FTS5 提供了 `highlight()` 函数。

**语法**：`highlight(table_name, column_index, start_tag, end_tag)`

- `column_index`: 列的索引，从 0 开始。
- `start_tag`: 高亮开始标签（如 `<b>`）。
- `end_tag`: 高亮结束标签（如 `</b>`）。

```sql
SELECT highlight(posts_fts, 1, '<b>', '</b>') as content_snippet
FROM posts_fts 
WHERE posts_fts MATCH 'sqlite';
```

**返回示例**：
`<b>SQLite</b> 是一个轻量级的嵌入式数据库。`

此外还有 `snippet()` 函数，用于截取包含关键词的文本片段，适合长文章的摘要展示。

## 7. 架构模式建议

在使用 FTS 时，主要有两种架构模式：

### 模式 A：Contentless Tables（无内容表）

如果你的原始数据已经存在于主表（例如 `articles` 表）中，为了节省空间，可以创建不存储原始内容的 FTS 表，只存储索引。

```sql
CREATE VIRTUAL TABLE fts_idx USING fts5(
    content, 
    content='',  -- 声明无内容
    content_rowid=id -- 关联主表的 id
);
```

**优点**：极大节省存储空间。
**缺点**：无法从 FTS 表直接 `SELECT` 内容，必须根据 `rowid` 回查主表；不支持 `delete` 操作（必须先清空再重建或手动维护）。

### 模式 B：External Content Tables（外部内容表）

这是最推荐的模式。FTS 表不存储数据副本，而是直接“指向”主表的数据进行索引。

```sql
CREATE VIRTUAL TABLE posts_fts USING fts5(
    content='users', -- 指向真实表 users
    content_rowid='id', 
    username, 
    bio
);
```

你需要手动（或通过触发器）确保主表和 FTS 表的数据同步。

## 总结

1. **性能**：对于文本检索，FTS5 比 `LIKE` 快几个数量级。
2. **维护**：FTS 表需要单独维护（插入/更新/删除），除非使用触发器。
3. **分词**：英文环境开箱即用；中文环境通常需要在存入数据库前，在代码层将中文分词并以空格分隔（例如将 "南京市长江大桥" 存为 "南京市 长江 大桥"），或编译加载专门的中文分词扩展。
4. **查询**：熟练掌握 `MATCH` 语法和 `highlight` 函数能极大提升用户体验。
