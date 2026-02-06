# 外键 (Foreign Key)

## 简介

外键（Foreign Key）约束用于在两个表之间建立强制链接，确保数据的**引用完整性**（Referential Integrity）。

通常涉及两个表：

- **父表（Parent Table）**：被引用的表。
- **子表（Child Table）**：包含外键列的表，引用父表的主键。

如果启用了外键约束，SQLite 将阻止破坏表之间关系的操作，例如删除仍被子表引用的父表记录。

## 1. 关键前提：启用外键支持

**这是新手最容易踩的坑。**

与 MySQL 或 PostgreSQL 不同，为了保持向后兼容性，SQLite **默认关闭**外键约束支持。这意味着即使你在建表语句中定义了外键，SQLite 也会忽略它们，除非你显式开启。

必须在**每次建立数据库连接**时执行以下命令：

```sql
PRAGMA foreign_keys = ON;
```

- **检查状态**：使用 `PRAGMA foreign_keys;` 查看当前是否已开启（返回 1 为开启，0 为关闭）。
- **注意**：该设置不是存储在数据库文件中的，而是基于当前连接会话的。如果在代码中使用 SQLite 驱动，通常需要在建立连接后的初始化阶段执行此指令。

## 2. 定义外键

可以在 `CREATE TABLE` 语句中定义外键。同样支持列级定义和表级定义。

假设我们需要建立“部门”与“员工”的关系。

### 父表 (Departments)

```sql
CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);
```

### 子表 (Employees)

#### 方式一：列级定义 (Column-level)

直接在列定义后引用。

```sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    dept_id INTEGER REFERENCES departments(id)
);
```

#### 方式二：表级定义 (Table-level)

在列列表末尾定义，语法更清晰，支持复合外键。

```sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    dept_id INTEGER,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);
```

## 3. 约束行为 (Actions)

当父表中的被引用数据发生变化（`UPDATE` 或 `DELETE`）时，可以通过 `ON UPDATE` 和 `ON DELETE` 子句指定子表的行为。

### 常见的行为选项

1. **NO ACTION** (默认) / **RESTRICT**
    - 如果子表中存在引用记录，则禁止更新或删除父表记录。SQLite 会抛出错误。

2. **CASCADE** (级联)
    - **ON DELETE CASCADE**：删除父表记录时，自动删除子表中所有关联的记录。
    - **ON UPDATE CASCADE**：更新父表主键时，自动更新子表中的外键值。

3. **SET NULL**
    - 删除或更新父表记录时，将子表的外键列设为 `NULL`（前提是该列允许 NULL）。

4. **SET DEFAULT**
    - 删除或更新父表记录时，将子表的外键列设为默认值。

### 示例：级联删除

这是一个典型的从属关系配置。如果一个部门被删除了，归属于该部门的员工记录通常也应该被删除（或者重新分配，取决于业务逻辑）。

```sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    dept_id INTEGER,
    -- 如果部门被删，对应的员工记录也会被自动删除
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE CASCADE
);
```

## 4. 性能优化：索引至关重要

SQLite **不会**自动为子表中的外键列创建索引。

这意味着，当你从父表中删除一行数据时，如果定义了外键约束（哪怕是默认的 RESTRICT），SQLite 必须扫描整个子表以确保没有引用该父记录的行。如果子表数据量很大，这会导致严重的性能问题。

**最佳实践**：始终手动为子表的外键列创建索引。

```sql
-- 为 employees 表的 dept_id 列创建索引
CREATE INDEX idx_employees_dept_id ON employees(dept_id);
```

这将把父表删除操作的时间复杂度从 O(N) 降低到 O(log N)。

## 5. 常见错误与限制

### 1. Foreign Key Mismatch

如果你收到 `foreign key mismatch` 错误，通常是因为：

- 父表中被引用的列不存在。
- 父表中被引用的列**不是**主键 (Primary Key) 或没有唯一约束 (Unique Constraint)。外键必须引用唯一的值。

### 2. 类型亲和性 (Type Affinity)

虽然 SQLite 是弱类型（灵活类型）的，但在外键处理上，建议父表主键和子表外键使用相同的数据类型（通常是 `INTEGER`）。

### 3. 修改外键

SQLite 的 `ALTER TABLE` 命令非常有限，不支持直接添加或删除外键约束。如果需要修改现有的外键规则，必须使用“新建表 -> 复制数据 -> 替换旧表”的迁移策略。

### 4. 延迟约束 (Deferred Constraints)

默认情况下，外键约束是立即检查的 (`IMMEDIATE`)。如果你需要在事务过程中暂时违反约束（例如循环引用插入），可以使用 `DEFERRABLE INITIALLY DEFERRED`。

```sql
CREATE TABLE table_a (
    id INTEGER PRIMARY KEY,
    b_id INTEGER REFERENCES table_b(id) DEFERRABLE INITIALLY DEFERRED
);
```

这样，约束检查会推迟到 `COMMIT` 时才执行。

## 总结

1. **必须开启**：谨记 `PRAGMA foreign_keys = ON;`。
2. **定义规则**：明确 `ON DELETE` 和 `ON UPDATE` 的业务逻辑（如 `CASCADE` 或 `SET NULL`）。
3. **手动索引**：务必给子表的外键列加上 `CREATE INDEX`，否则会影响父表的删除/更新性能。
4. **引用唯一性**：确保外键引用的父表列具有 `PRIMARY KEY` 或 `UNIQUE` 约束。
