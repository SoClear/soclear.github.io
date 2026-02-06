# 事务 (TRANSACTION)

在数据库操作中，事务 (TRANSACTION) 是指作为一个逻辑单元执行的一系列操作。这些操作要么 **全部成功** ，要么 **全部失败** 。

SQLite 默认处于“自动提交” (Auto-commit) 模式，即每条单独的 SQL 语句在执行时都会自动启动并提交一个事务。但在实际开发中，我们经常需要手动控制事务，以确保数据的一致性或提高写入性能。

事务必须满足ACID特性：

- **原子性(Atomicity)**：事务中的所有操作要么全部成功，要么全部失败回滚
- **一致性(Consistency)**：事务执行前后，数据库都处于一致状态
- **隔离性(Isolation)**：并发事务之间相互隔离
- **持久性(Durability)**：事务提交后，修改永久保存

## 1. 为什么需要事务？

事务主要解决两个核心问题：

1. **原子性 (Atomicity)**：确保数据一致性。例如银行转账，从 A 账户扣款和向 B 账户存款这两个步骤必须同时成功。如果扣款成功但存款失败，数据就会出错。事务能保证在这种情况下回滚到操作前的状态。
2. **性能 (Performance)**：在 SQLite 中，每次提交事务都会触发磁盘同步 (fsync) 操作，这非常耗时。将成千上万次插入操作合并到一个事务中，可以显著提高写入速度（通常能提高几个数量级）。

## 2. 事务控制命令

SQLite 提供了三个核心命令来管理事务：

- `BEGIN TRANSACTION` (或简写为 `BEGIN`)：手动开启一个新事务。此时自动提交模式关闭。
- `COMMIT` (或 `END`)：提交事务。将自 `BEGIN` 以来所有的修改永久写入磁盘。
- `ROLLBACK`：回滚事务。取消自 `BEGIN` 以来所有的修改，将数据库恢复到事务开始前的状态。

## 3. 实战示例：银行转账

这是理解事务最经典的场景。假设我们要从用户 A (id=1) 转账 100 元给用户 B (id=2)。

### 正常提交流程 (Commit)

```sql
-- 1. 开启事务
BEGIN;

-- 2. 从 A 账户扣款
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- 3. 向 B 账户存款
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 4. 确认无误，提交修改
COMMIT;
```

### 异常回滚流程 (Rollback)

如果在执行过程中发生了错误（例如应用程序崩溃、断电，或者业务逻辑检查发现余额不足），则执行回滚。

```sql
-- 1. 开启事务
BEGIN;

-- 2. 从 A 账户扣款
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- 3. 假设这里检测到 B 账户状态异常（业务逻辑判断）
-- 或者执行 SQL 时发生了错误

-- 4. 取消之前的操作，数据恢复原状
ROLLBACK;
```

## 4. 性能优化：批量插入

这是 SQLite 新手最常忽略的优化点。

如果你需要插入 1000 条数据：

**错误做法（极慢）：**

```sql
-- SQLite 默认为每条语句开启一个事务，需执行 1000 次磁盘同步
INSERT INTO logs VALUES (1, 'msg');
INSERT INTO logs VALUES (2, 'msg');
...
INSERT INTO logs VALUES (1000, 'msg');
```

**正确做法（极快）：**

```sql
-- 显式开启事务，只需执行 1 次磁盘同步
BEGIN;
INSERT INTO logs VALUES (1, 'msg');
...
INSERT INTO logs VALUES (1000, 'msg');
COMMIT;
```

**差异：** 在普通硬盘上，不使用事务可能每秒只能插入几十条；使用事务后每秒可插入数万条。

## 5. 进阶：保存点 (SAVEPOINT)

`SAVEPOINT` 类似于嵌套事务或“子事务”。它允许你在一个大事务中设置多个“检查点”，并可以按需回滚到某个特定的检查点，而不是撤销整个事务。

### 1. 基本语法

- `SAVEPOINT savepoint_name`：创建一个保存点。
- `ROLLBACK TO [SAVEPOINT] savepoint_name`：回滚到指定的保存点。回滚后事务 **依然开启** ，你可以继续执行后续 SQL。
- `RELEASE [SAVEPOINT] savepoint_name`：释放保存点。这类似于针对该保存点的“提交”。释放后，你不能再回滚到该点，但其更改只有在最终执行 `COMMIT` 时才真正持久化到磁盘。

### 2. 实战示例：分步保存

假设你在进行一次复杂的数据处理，包含三个步骤，如果步骤二失败了，你只想回滚步骤二，而保留步骤一的结果，并尝试执行步骤三。

```sql
BEGIN; -- 开启总事务

-- 步骤 1：插入主记录
INSERT INTO orders (id, user_id) VALUES (101, 1);
SAVEPOINT step1_done;

-- 步骤 2：插入明细记录（假设由于某些原因这里可能失败）
INSERT INTO order_items (order_id, product) VALUES (101, 'Laptop');

-- 模拟逻辑判断：如果步骤 2 失败了
-- ROLLBACK TO step1_done; 
-- 如果回滚了，步骤 2 的插入会被撤销，但步骤 1 的插入依然保留在内存中

-- 步骤 3：记录日志
INSERT INTO logs (msg) VALUES ('Order 101 processed');

COMMIT; -- 最终统一提交到磁盘
```

### 3. 实战示例：嵌套保存点

`SAVEPOINT` 可以嵌套使用

```sql
BEGIN;

INSERT INTO log (message) VALUES ('开始批量操作');

SAVEPOINT level1;
UPDATE table1 SET status = 'processing';

    SAVEPOINT level2;
    INSERT INTO table2 (data) VALUES ('数据1');
    
        SAVEPOINT level3;
        INSERT INTO table3 (info) VALUES ('信息1');
        -- 回滚level3
        ROLLBACK TO level3;
    
    INSERT INTO table3 (info) VALUES ('信息2');
    -- 提交level2
    RELEASE level2;

UPDATE table1 SET status = 'completed';
COMMIT;
```

### 4. 注意事项

1. 回滚到保存点会撤销该保存点之后的所有操作，但保存点本身仍然存在
2. 释放保存点会删除该保存点及其之后创建的所有保存点
3. 提交事务会自动释放所有保存点
4. 回滚整个事务会删除所有保存点

### 5. 适用场景

1. **复杂业务逻辑**：当一个操作由多个独立子模块组成，且你希望在某个模块失败时有“容错”或“重试”的机会。
2. **ORM 框架开发**：许多 ORM（如 SQLAlchemy, Django ORM）在实现嵌套事务时，底层其实就是用的 `SAVEPOINT`。
3. **防止意外全部回滚**：在执行大量批量操作时，每隔 1000 条设置一个保存点，可以避免因为最后一条数据的错误导致前面 999 条数据的处理成果全部丢失。

> **注意：** `RELEASE` 并不等同于 `COMMIT`。如果你在 `SAVEPOINT` 之后没有执行 `COMMIT` 就关闭了连接，所有的更改（即使是已 `RELEASE` 的保存点）都会丢失。务必记住在最外层执行 `COMMIT`。

## 6. 进阶：三种事务类型 (锁机制)

SQLite 支持多线程并发读取，但同一时刻只允许一个连接进行写入。为了处理并发，`BEGIN` 命令支持指定事务类型。

语法：

```sql
BEGIN [ DEFERRED | IMMEDIATE | EXCLUSIVE ] TRANSACTION;
```

### 1. DEFERRED (默认)

**语法：** `BEGIN DEFERRED;` (等同于 `BEGIN;`)

**行为：** 事务开始时不获取任何锁。直到第一次执行读操作时获取读锁，第一次执行写操作 (`INSERT`/`UPDATE`/`DELETE`) 时才升级为写锁。

**缺点：** 在高并发场景下容易产生“死锁”。例如，两个连接都开启了 `DEFERRED` 事务并读取了数据，当它们都尝试写入时，互相等待对方释放读锁，导致操作失败 (SQLITE_BUSY)。

### 2. IMMEDIATE

**语法：** `BEGIN IMMEDIATE;`

**行为：** 事务开始时立即获取 `RESERVED` 锁。这保证了在当前事务结束前，没有其他连接可以进行写操作，但其他连接仍然可以读取数据。

**适用场景：** 读-改-写 (Read-Modify-Write) 操作。如果你打算在事务中先读取数据，根据读取结果修改数据，**强烈建议**使用 `BEGIN IMMEDIATE`，这可以彻底避免死锁问题。

### 3. EXCLUSIVE

**语法：** `BEGIN EXCLUSIVE;`

**行为：** 事务开始时立即获取 `EXCLUSIVE` 锁。在事务结束前，拒绝其他任何连接的读取和写入请求。

**适用场景：** 对数据库进行极度敏感的操作，或者需要独占整个数据库文件时使用。这会严重降低并发性能，平时很少使用。

## 7. 处理死锁与 SQLITE_BUSY

当多个连接试图同时写入 SQLite 数据库时，后来的连接可能会收到 `SQLITE_BUSY` 错误。

**处理建议：**

1. **设置超时时间**：在连接数据库时设置 `busy_timeout`。例如设置为 5000 毫秒，SQLite 会在遇到锁时自动重试，而不是立即报错。

    ```sql
    PRAGMA busy_timeout = 5000;
    ```

2. **使用 IMMEDIATE**：如上所述，涉及写入的事务尽量使用 `BEGIN IMMEDIATE`。
3. **缩短事务时间**：尽量只在事务中包含必要的 SQL 操作，不要在事务未提交时进行耗时的网络请求或用户交互。

## 8. 总结

| 命令 | 说明 |
| :--- | :--- |
| `BEGIN` | 开启默认事务 (Deferred)，写操作时才加锁。 |
| `BEGIN IMMEDIATE` | 开启事务并立即限制其他连接写入，防止死锁。 |
| `COMMIT` | 永久保存所有更改，结束事务。 |
| `ROLLBACK` | 撤销自 `BEGIN` 以来所有的更改，结束事务。 |
| `SAVEPOINT [name]` | 在当前事务中设置一个标记点（子事务）。 |
| `ROLLBACK TO [name]` | 回滚到标记点，保留标记点之前的操作，事务继续。 |
| `PRAGMA busy_timeout` | 设置等待锁的超时时间，减少忙碌报错。 |

合理使用事务，不仅能保证数据的安全性，更是提升 SQLite 性能的关键手段。
