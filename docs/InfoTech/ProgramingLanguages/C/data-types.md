# 数据类型

在 C 语言中，数据类型指的是用于声明不同类型的变量或函数的一个广泛的系统。变量的类型决定了变量存储占用的空间，以及如何解释存储的位模式。

C 中的类型可分为以下几种：

|类型|描述|
|-|-|
|基本类型|它们是算术类型，包括两种类型：整数类型和浮点类型。|
|枚举类型|它们也是算术类型，被用来定义在程序中只能赋予其一定的离散整数值的变量。|
|void 类型|类型说明符 void 表明没有可用的值。|
|派生类型|它们包括：指针类型、数组类型、结构类型、共用体类型和函数类型。|

## 存储大小

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

## void 类型

| 序号 | 类型与描述 |
| --- | --- |
| 函数返回为空 | C 中有各种函数都不返回值，或者您可以说它们返回空。不返回值的函数的返回类型为空。例如 `void exit (int status);` |
| 函数参数为空 | C 中有各种函数不接受任何参数。不带参数的函数可以接受一个 void。例如 `int rand(void);` |
| 指针指向 void | 类型为 `void *` 的指针代表对象的地址，而不是类型。例如，内存分配函数 `void *malloc( size_t size );` 返回指向 void 的指针，可以转换为任何数据类型。 |
