# 数据类型

在 C 语言中，数据类型指的是用于声明不同类型的变量或函数的一个广泛的系统。变量的类型决定了变量存储占用的空间，以及如何解释存储的位模式。

C 中的类型可分为以下几种：

|类型|描述|
|-|-|
|基本类型|它们是算术类型，包括整型（int）、字符型（char）、浮点型（float）和双精度浮点型（double）。|
|枚举类型|它们也是算术类型，被用来定义在程序中只能赋予其一定的离散整数值的变量。|
|void 类型|类型说明符 void 表示没有值的数据类型，通常用于函数返回值。|
|派生类型|包括数组类型、指针类型和结构体类型。|

数组类型和结构类型统称为聚合类型。函数的类型指的是函数返回值的类型。

## 整数类型

下表列出了关于标准整数类型的存储大小和值范围的细节：

| 类型 | 存储大小 | 值范围 |
| --- | --- | --- |
| char | 1 字节 | \-128 到 127 或 0 到 255 |
| unsigned char | 1 字节 | 0 到 255 |
| signed char | 1 字节 | \-128 到 127 |
| int | 2 或 4 字节 | \-32,768 到 32,767 或 -2,147,483,648 到 2,147,483,647 |
| unsigned int | 2 或 4 字节 | 0 到 65,535 或 0 到 4,294,967,295 |
| short | 2 字节 | \-32,768 到 32,767 |
| unsigned short | 2 字节 | 0 到 65,535 |
| long | 4 字节 | \-2,147,483,648 到 2,147,483,647 |
| unsigned long | 4 字节 | 0 到 4,294,967,295 |

注意，各种类型的存储大小与系统位数有关，但目前通用的以64位系统为主。

### 存储大小

```c
#include <stdio.h>
#include <limits.h>
#include <float.h>

int main(int argc, char const *argv[])
{
    // linux 64位 gcc 9.4.0 下各个类型存储大小（单位是字节）
    printf("%d\n",sizeof(char)); // 1
    printf("%d\n",sizeof(unsigned char)); // 1
    printf("%d\n",sizeof(short)); // 2
    printf("%d\n",sizeof(unsigned short)); // 2
    printf("%d\n",sizeof(int)); // 4
    printf("%d\n",sizeof(unsigned int)); // 4
    printf("%d\n",sizeof(long)); // 8
    printf("%d\n",sizeof(unsigned long)); // 8
    printf("%d\n",sizeof(float)); // 4
    printf("%d\n",sizeof(double)); // 8
    printf("%d\n",sizeof(long int)); // 8
    printf("%d\n",sizeof(long long)); // 8
    printf("%d\n",sizeof(long double)); // 16
    return 0;
}
```

## 浮点类型

下表列出了关于标准浮点类型的存储大小、值范围和精度的细节：

| 类型 | 存储大小 | 值范围 | 精度 |
| --- | --- | --- | --- |
| float | 4 字节 | 1.2E-38 到 3.4E+38 | 6 位有效位 |
| double | 8 字节 | 2.3E-308 到 1.7E+308 | 15 位有效位 |
| long double | 16 字节 | 3.4E-4932 到 1.1E+4932 | 19 位有效位 |

头文件 float.h 定义了宏，在程序中可以使用这些值和其他有关实数二进制表示的细节。下面的实例将输出浮点类型占用的存储空间以及它的范围值：

```c
#include <stdio.h>
#include <float.h>
 
int main()
{
   printf("float 存储最大字节数 : %lu \n", sizeof(float));
   printf("float 最小值: %E\n", FLT_MIN );
   printf("float 最大值: %E\n", FLT_MAX );
   printf("精度值: %d\n", FLT_DIG );
   
   return 0;
}
```

%E 为以指数形式输出单、双精度实数，详细说明查看 [C 库函数 - printf()](https://www.runoob.com/cprogramming/c-function-printf.html)。

当您在 Linux 上编译并执行上面的程序时，它会产生下列结果：

```txt
float 存储最大字节数 : 4 
float 最小值: 1.175494E-38
float 最大值: 3.402823E+38
精度值: 6
```

## void 类型

| 序号 | 类型与描述 |
| --- | --- |
| 函数返回为空 | C 中有各种函数都不返回值，或者您可以说它们返回空。不返回值的函数的返回类型为空。例如 `void exit (int status);` |
| 函数参数为空 | C 中有各种函数不接受任何参数。不带参数的函数可以接受一个 void。例如 `int rand(void);` |
| 指针指向 void | 类型为 `void *` 的指针代表对象的地址，而不是类型。例如，内存分配函数 `void *malloc( size_t size );` 返回指向 void 的指针，可以转换为任何数据类型。 |

## 类型转换

类型转换是将一个数据类型的值转换为另一种数据类型的值。

C 语言中有两种类型转换：

- **隐式类型转换：**隐式类型转换是在表达式中自动发生的，无需进行任何明确的指令或函数调用。它通常是将一种较小的类型自动转换为较大的类型，例如，将int类型转换为long类型或float类型转换为double类型。隐式类型转换也可能会导致数据精度丢失或数据截断。

- **显式类型转换：**显式类型转换需要使用强制类型转换运算符（type casting operator），它可以将一个数据类型的值强制转换为另一种数据类型的值。强制类型转换可以使程序员在必要时对数据类型进行更精确的控制，但也可能会导致数据丢失或截断。

隐式类型转换实例：

```c
int i = 10;  
float f = 3.14;  
double d = i + f; // 隐式将int类型转换为double类型
```  

显式类型转换实例：

```c
double d = 3.14159;  
int i = (int)d; // 显式将double类型转换为int类型
```
