# 别名

`字段名/表名 as 别名` 或者 `字段名/表名 别名`

```sql
SELECT column1 as alias1, column2 alias2, columnN FROM table_name;
```

也可以给表设置别名，而且可以用于区分两张表里有相同字段名。

比如，表 employees 和表 departments 都有字段名 deptno

```sql
select name,dname,e.deptno
from employees e, departments d
where e.deptno = d.deptno;
```
