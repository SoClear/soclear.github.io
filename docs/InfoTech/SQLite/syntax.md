# 语法

SQLite 是遵循一套独特的称为语法的规则和准则。本教程列出了所有基本的 SQLite 语法，向您提供了一个 SQLite 快速入门。

有个重要的点值得注意，SQLite 是**不区分大小写**的，但也有一些命令是大小写敏感的，比如 **GLOB** 和 **glob** 在 SQLite 的语句中有不同的含义。

SQLite 注释是附加的注释，可以在 SQLite 代码中添加注释以增加其可读性，他们可以出现在任何空白处，包括在表达式内和其他 SQL 语句的中间，但它们不能嵌套。

SQL 注释以两个连续的 "-" 字符（ASCII 0x2d）开始，并扩展至下一个换行符（ASCII 0x0a）或直到输入结束，以先到者为准。

您也可以使用 C 风格的注释，以 "/\*" 开始，并扩展至下一个 "\*/" 字符对或直到输入结束，以先到者为准。SQLite的注释可以跨越多行。

```sql
sqlite>.help -- 这是一个简单的注释
```

所有的 SQLite 语句可以以任何关键字开始，如 SELECT、INSERT、UPDATE、DELETE、ALTER、DROP 等，所有的语句以分号 ; 结束。

## SQLite ANALYZE 语句

```sql
ANALYZE;
or
ANALYZE database_name;
or
ANALYZE database_name.table_name;
```

## SQLite AND/OR 子句

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  CONDITION-1 {AND|OR} CONDITION-2;
```

## SQLite ALTER TABLE 语句

```sql
ALTER TABLE table_name ADD COLUMN column_def...;
```

## SQLite ALTER TABLE 语句（Rename）

```sql
ALTER TABLE table_name RENAME TO new_table_name;
```

## SQLite ATTACH DATABASE 语句

```sql
ATTACH DATABASE 'DatabaseName' As 'Alias-Name';
```

## SQLite BEGIN TRANSACTION 语句

```sql
BEGIN;
or
BEGIN EXCLUSIVE TRANSACTION;
```

## SQLite BETWEEN 子句

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name BETWEEN val-1 AND val-2;
```

表示大于等于 val-1 小于等于 val-2

## SQLite COMMIT 语句

```sql
COMMIT;
```

## SQLite CREATE INDEX 语句

```sql
CREATE INDEX index_name
ON table_name ( column_name COLLATE NOCASE );
```

## SQLite CREATE UNIQUE INDEX 语句

```sql
CREATE UNIQUE INDEX index_name
ON table_name ( column1, column2,...columnN);
```

## SQLite CREATE TABLE 语句

```sql
CREATE TABLE table_name(
   column1 datatype,
   column2 datatype,
   column3 datatype,
   .....
   columnN datatype,
   PRIMARY KEY( one or more columns )
);
```

## SQLite CREATE TRIGGER 语句

```sql
CREATE TRIGGER database_name.trigger_name 
BEFORE INSERT ON table_name FOR EACH ROW
BEGIN 
   stmt1; 
   stmt2;
   ....
END;
```

## SQLite CREATE VIEW 语句

```sql
CREATE VIEW database_name.view_name  AS
SELECT statement....;
```

## SQLite CREATE VIRTUAL TABLE 语句

```sql
CREATE VIRTUAL TABLE database_name.table_name USING weblog( access.log );
or
CREATE VIRTUAL TABLE database_name.table_name USING fts3( );
```

## SQLite COMMIT TRANSACTION 语句

```sql
COMMIT;
```

## SQLite COUNT 子句

```sql
SELECT COUNT(column_name)
FROM   table_name
WHERE  CONDITION;
```

## SQLite DELETE 语句

```sql
DELETE FROM table_name
WHERE  {CONDITION};
```

## SQLite DETACH DATABASE 语句

```sql
DETACH DATABASE 'Alias-Name';
```

## SQLite DISTINCT 子句

```sql
SELECT DISTINCT column1, column2....columnN
FROM   table_name;
```

## SQLite DROP INDEX 语句

```sql
DROP INDEX database_name.index_name;
```

## SQLite DROP TABLE 语句

```sql
DROP TABLE database_name.table_name;
```

## SQLite DROP VIEW 语句

```sql
DROP VIEW view_name;
```

## SQLite DROP TRIGGER 语句

```sql
DROP TRIGGER trigger_name
```

## SQLite EXISTS 子句

如果主查询的记录数大于子查询的记录数，用 in 效率高。  
如果主查询的记录数小于子查询的记录数，用 exists 效率高。  

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name EXISTS (SELECT * FROM   table_name );
```

## SQLite EXPLAIN 语句

```sql
EXPLAIN INSERT statement...;
or 
EXPLAIN QUERY PLAN SELECT statement...;
```

## SQLite GLOB 子句

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name GLOB { PATTERN };
```

## SQLite GROUP BY 子句

```sql
SELECT SUM(column_name)
FROM   table_name
WHERE  CONDITION
GROUP BY column_name;
```

## SQLite HAVING 子句

```sql
SELECT SUM(column_name)
FROM   table_name
WHERE  CONDITION
GROUP BY column_name
HAVING (arithematic function condition);
```

## SQLite INSERT INTO 语句

```sql
INSERT INTO table_name( column1, column2....columnN)
VALUES ( value1, value2....valueN);
```

## SQLite IN 子句

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name IN (val-1, val-2,...val-N);
```

## SQLite Like 子句

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name LIKE { PATTERN };
```

## SQLite NOT IN 子句

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name NOT IN (val-1, val-2,...val-N);
```

## SQLite ORDER BY 子句

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  CONDITION
ORDER BY column_name {ASC|DESC};
```

## SQLite PRAGMA 语句

```sql
PRAGMA pragma_name;

For example:

PRAGMA page_size;
PRAGMA cache_size = 1024;
PRAGMA table_info(table_name);
```

## SQLite RELEASE SAVEPOINT 语句

```sql
RELEASE savepoint_name;
```

## SQLite REINDEX 语句

```sql
REINDEX collation_name;
REINDEX database_name.index_name;
REINDEX database_name.table_name;
```

## SQLite ROLLBACK 语句

```sql
ROLLBACK;
or
ROLLBACK TO SAVEPOINT savepoint_name;
```

## SQLite SAVEPOINT 语句

```sql
SAVEPOINT savepoint_name;
```

## SQLite SELECT 语句

```sql
SELECT column1, column2....columnN
FROM   table_name;
```

## SQLite UPDATE 语句

```sql
UPDATE table_name
SET column1 = value1, column2 = value2....columnN=valueN
[ WHERE  CONDITION ];
```

## SQLite VACUUM 语句

```sql
VACUUM;
```

## SQLite WHERE 子句

```sql
SELECT column1, column2....columnN
FROM   table_name
WHERE  CONDITION;
```

## SQLite 没有 ANY 和 ALL

ANY：任一，ALL：所有

## 速记

```sql
/*
多行注解
*/

-- 单行注解

select * from students;
select 姓名,班级,成绩 from students;
select 姓名,班级,成绩 from students limit 5;
select 姓名,班级,成绩 from students limit 5 offset 5;
select 姓名,班级,成绩 from students where 班级 = '一年二班';
select 姓名,班级,成绩 from students where 班级 != '一年二班';
select 姓名,班级,成绩 from students where 班级 != '一年二班'  order by 班级;
select 姓名,班级,成绩 from students where 班级 != '一年二班'  order by 班级, 成绩;
select 姓名,班级,成绩 from students where 班级 != '一年二班'  order by 班级, 成绩 desc;
select 姓名,班级,成绩 from students where 姓名 = '张三';
select 姓名,班级,成绩 from students where 姓名 like '张%'; -- 匹配0个或者多个
select 姓名,班级,成绩 from students where 姓名 like '张_'; -- 匹配 1 个
select 姓名,班级,成绩 from students where 成绩 >= 80 and 成绩 <90;
select 姓名,班级,成绩 from students where 成绩 between 80 and  90;
select 姓名,班级,成绩 from students where 成绩 between 80 and  90 and 班级 = '一年二班';
select 姓名,班级,成绩 from students where 成绩 between 80 and  90 and (班级 = '一年一班' or 班级 = '一年二班');
select 姓名,班级,成绩 from students where 成绩 between 80 and  90 and (班级 in ('一年一班' , '一年二班'));
select avg(成绩),sum(成绩),max(成绩),min(成绩), count(成绩) from students;
select avg(成绩) as 成绩平均 ,max(成绩) as 最高分 from students;
select round(avg(成绩), 1) as 成绩平均 ,max(成绩) as 最高分 from students;
select round(avg(成绩)) as 成绩平均  from students;
select 班级,round(avg(成绩)) as 成绩平均  from students order by 班级;
select 班级,round(avg(成绩)) as 成绩平均  from students order by 班级 order by 成绩平均 desc;
```

顺序：

```sql
select
from
where
group by
having
order by
limit
```

```sql
select count(*) from students; -- 计算总行数
select count(社团) from students; -- 计算社团行数，count 排除空值
select count(distinct 社团) from students; -- 排除重复
select distinct 社团 from students; -- distinct 不排除空值
select distinct 社团 from students where 社团 != null;

create table clubs(
社团编号 int primary key,
社团名称 varchar(15)
);

drop table clubs2;

insert into clubs (社团编号, 社团名称) values (101, '吉他社'), (102, '美术社'), (104, null);

update clubs set 社团名称 = '舞蹈社' where 社团编号 = 104;

delete from clubs where  社团编号 = 104;

select students.姓名, students.社团, clubs.社团名称 from students left join clubs on students.社团 = clubs.社团编号 where 班级 = '一年一班'; -- left join 左侧所有记录，例如没有报名社团的同学，或者报名的社团没找到名称的同学也会显示

select students.姓名, students.社团, clubs.社团名称 from students inner join clubs on students.社团 = clubs.社团编号 where 班级 = '一年一班'; -- inner join 只会显示左右两表能对应上的元素
```
