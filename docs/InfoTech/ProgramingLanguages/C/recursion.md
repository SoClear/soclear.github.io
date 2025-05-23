# 递归

递归指的是在函数的定义中使用函数自身的方法。

> 举个例子：  
> 从前有座山，山里有座庙，庙里有个老和尚，正在给小和尚讲故事呢！故事是什么呢？"从前有座山，山里有座庙，庙里有个老和尚，正在给小和尚讲故事呢！故事是什么呢？'从前有座山，山里有座庙，庙里有个老和尚，正在给小和尚讲故事呢！故事是什么呢？……'"

语法格式如下：

```c
void recursion()
{
   statements;
   ... ... ...
   recursion(); /* 函数调用自身 */
   ... ... ...
}
 
int main()
{
   recursion();
}
```

流程图：

```mermaid
flowchart TB;
A@{ shape: circle, label: "开始" } -->  B[递归函数]
B -->  C[执行语句]
C -->  D{条件}
D -->  |TRUE| B
D -->  |FALSE| E[执行语句]
E -->  F@{ shape: circle, label: "退出" }
```

C 语言支持递归，即一个函数可以调用其自身。但在使用递归时，程序员需要注意定义一个从函数退出的条件，否则会进入死循环。

递归函数在解决许多数学问题上起了至关重要的作用，比如计算一个数的阶乘、生成斐波那契数列，等等。

## 数的阶乘

下面的实例使用递归函数计算一个给定的数的阶乘：

```c
#include <stdio.h>
 
double factorial(unsigned int i)
{
   if(i <= 1)
   {
      return 1;
   }
   return i * factorial(i - 1);
}
int  main()
{
    int i = 15;
    printf("%d 的阶乘为 %f\n", i, factorial(i));
    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```text
15 的阶乘为 1307674368000.000000
```

## 斐波那契数列

下面的实例使用递归函数生成一个给定的数的斐波那契数列：

```c
#include <stdio.h>
 
int fibonaci(int i)
{
   if(i == 0)
   {
      return 0;
   }
   if(i == 1)
   {
      return 1;
   }
   return fibonaci(i-1) + fibonaci(i-2);
}
 
int  main()
{
    int i;
    for (i = 0; i < 10; i++)
    {
       printf("%d\t\n", fibonaci(i));
    }
    return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```text
0    
1    
1    
2    
3    
5    
8    
13    
21    
34
```
