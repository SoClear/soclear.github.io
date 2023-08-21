# 别名

`字段名/表名 as 别名` 或者 `字段名/表名 别名`

```sql
SELECT column1 as alias1, column2 alias2, columnN FROM table_name;
```

## 两个表的有重名的字段

也可以给表设置别名，而且可以用于区分两张表里有相同字段名。

比如，表 employees 和表 departments 都有字段名 deptno

```sql
select name,dname,e.deptno
from employees e, departments d
where e.deptno = d.deptno;
```

## 自连接（self join）

在员工表中查询同名的员工

```sql
select e1.name,e2.empno,e1.empno
from employees e1 join employees e2
on e1.name=e2.name and e1.empno<e2.empno;
```

job_history 表如下

| empno | start_date | end_date   | deptno |
| ----- | ---------- | ---------- | ------ |
| 2     | 2013-01-03 | 2015-12-31 | 3      |
| 2     | 2016-01-01 | 2018-12-31 | 2      |
| 3     | 2015-01-01 | 2017-12-31 | 2      |
| 4     | 2010-01-01 | 2015-12-31 | 1      |
| 5     | 2015-06-30 | 2016-12-31 | 2      |
| 9     | 2009-11-12 | 2010-12-31 | 1      |

查询在历史上曾经在同一个部门一起共事过的员工

```sql
select j1.empno,j2.empno,j1.deptno,j1.start_date comm_start
from job_history j1 join job_history j2
on j1.deptno=j2.deptno and j1.empno != j2.empno and j1.start_date between j2.start_date and j2.end_state;
```

查询历史上层级在2号部门和3号部门都工作过的员工

```sql
select j1.empno
from (select empno from job_history j1 where deptno = 2) j1
         join
         (select empno from job_history j2 where deptno = 3) j2
         on j1.empno = j2.empno;
```
