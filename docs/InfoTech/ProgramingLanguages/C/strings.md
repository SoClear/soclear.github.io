# 字符串

C语言中的字符串操作和现代语言（如 Python、Java）完全不同。在 C 语言中，**没有专门的 `string` 类型**，字符串本质上是 **字符数组**。

理解 C 语言字符串的核心在于理解 **`\0` (空字符)**。

以下是 C 语言字符串操作的完整体系：

---

## 1. 核心定义：什么是 C 字符串？

C 语言的字符串是以 **空字符 `\0` (ASCII 0)** 结尾的字符数组。

```c
// 方式 A：字符数组 (推荐用于可变字符串)
char str1[10] = "Hello"; 
// 内存中实际存储：'H', 'e', 'l', 'l', 'o', '\0', ?, ?, ?, ?

// 方式 B：字符指针 (指向字符串常量，通常只读)
char *str2 = "World"; 
// str2 指向只读内存区，不能修改内容 (str2[0] = 'X' 会报错)
```

**关键点：**

- **`\0` 的作用**：它是字符串结束的标志。如果你创建一个字符数组忘了加 `\0`，打印时就会出现乱码，甚至导致程序崩溃。
- **空间分配**：定义数组时，必须给 `\0` 留一个位置。存 5 个字的单词，数组至少要长度 6。

---

## 2. 标准库函数 (`<string.h>`)

C 语言提供了一系列函数来操作字符串，必须引入头文件：

```c
#include <string.h>
```

### A. 获取长度 (`strlen`)

计算字符串的有效长度，**不包含** `\0`。

```c
char str[] = "Hi";
size_t len = strlen(str); // 结果是 2
// 注意：sizeof(str) 的结果是 3 (包含了 \0)
```

### B. 字符串复制 (`strcpy`)

不能直接用 `=` 给数组赋值，必须用复制函数。

```c
char src[] = "Apple";
char dest[20];

// 错误：dest = src; 
strcpy(dest, src); // 正确：将 src 的内容复制到 dest
```

*注意：`dest` 必须足够大，否则会发生**缓冲区溢出 (Buffer Overflow)**，这是 C 语言最常见的安全漏洞。*

### C. 字符串拼接 (`strcat`)

将一个字符串追加到另一个字符串后面。

```c
char str[20] = "Hello"; // 一定要预留足够的空间
strcat(str, " World");
// str 现在是 "Hello World"
```

### D. 字符串比较 (`strcmp`)

不能用 `==` 比较两个字符串（那样比较的是内存地址）。

```c
char s1[] = "abc";
char s2[] = "abd";

int result = strcmp(s1, s2);

if (result == 0) {
    printf("相等");
} else if (result < 0) {
    printf("s1 小于 s2"); // "abc" 在字典序上小于 "abd"
} else {
    printf("s1 大于 s2");
}
```

### E. 查找字符/子串 (`strchr`, `strrchr`, `strstr`)

```c
#include <stdio.h>
#include <string.h>

int main()
{
    char str[] = "This is a simple string";

    // 查找字符 's' 第一次出现的位置
    char *pChar = strchr(str, 's');
    printf("字符 's' 第一次出现的位置: %ld\n", pChar - str);

    // 查找字符 's' 最后一次出现的位置
    char *pLastChar = strrchr(str, 's');
    printf("字符 's' 最后一次出现的位置: %ld\n", pLastChar - str);

    // 查找子串 "simple" 的位置（第一次出现）
    char *pSub = strstr(str, "simple");
    printf("子串 \"simple\" 位置：%ld\n", pSub - str);

    return 0;
}
```

---

## 3. 安全版本的函数 (防止溢出)

为了防止写入越界，建议在生产环境中使用带 `n` 的版本，限制操作的字符数。

- `strcpy` -> **`strncpy(dest, src, n)`**: 最多复制 n 个字符。
- `strcat` -> **`strncat(dest, src, n)`**: 最多追加 n 个字符。
- `strcmp` -> **`strncmp(s1, s2, n)`**: 只比较前 n 个字符。

**注意**：`strncpy` 有个坑，如果 `src` 长度超过 `n`，它**不会**自动在末尾添加 `\0`，你需要手动添加：

```c
strncpy(dest, src, sizeof(dest) - 1);
dest[sizeof(dest) - 1] = '\0'; // 确保安全
```

---

## 4. 字符串与数字转换 (`<stdlib.h>`)

处理文件或用户输入时，常需要将字符串转为数字。

```c
#include <stdlib.h>

char s1[] = "123";
char s2[] = "3.14";

int num = atoi(s1);       // String to Integer -> 123
double pi = atof(s2);     // String to Float -> 3.14

// 更高级的转换 (strtol)，可以检测非数字字符
char s3[] = "2023year";
char *endptr;
long val = strtol(s3, &endptr, 10); // 10代表十进制
// val = 2023, endptr 指向 "year"
```

---

## 5. 格式化字符串 (`sprintf`)

这是一个非常强大的函数，用于**构造字符串**。它的用法和 `printf` 一样，只是输出到了字符串数组中。

```c
char buffer[100];
int id = 5;
char name[] = "Tom";

// 类似于 Python 的 f-string
sprintf(buffer, "User ID: %d, Name: %s", id, name);

printf("%s\n", buffer); // 输出: User ID: 5, Name: Tom
```

---

## 6. 输入输出

- **输出**: `printf("%s", str)` 或 `puts(str)` (puts 会自动换行)。
- **输入**:
  - **不推荐** `scanf("%s", str)`: 遇到空格就会停止读取，且容易溢出。
  - **推荐** `fgets(str, size, stdin)`: 可以读取带空格的整行，且限制长度，非常安全。

```c
char name[50];
printf("请输入全名: ");
// 从标准输入(stdin)读取，最多49个字符
if (fgets(name, sizeof(name), stdin) != NULL) {
    // fgets 会把换行符 \n 也读进来，通常需要把它去掉
    name[strcspn(name, "\n")] = 0; 
    printf("你好, %s\n", name);
}
```

---

## 7. 综合实战示例

下面这个例子展示了：复制、拼接、比较、查找和格式化。

```c
#include <stdio.h>
#include <string.h>

int main() {
    // 1. 定义与初始化
    char firstName[50] = "James";
    char lastName[] = "Bond";
    char fullName[100]; // 目标缓冲区

    // 2. 复制 (Copy)
    strcpy(fullName, firstName);

    // 3. 拼接 (Concatenate)
    strcat(fullName, " "); // 加个空格
    strcat(fullName, lastName);
    
    printf("全名: %s\n", fullName); // James Bond

    // 4. 长度
    printf("长度: %zu\n", strlen(fullName));

    // 5. 比较
    if (strcmp(firstName, "James") == 0) {
        printf("First name 匹配!\n");
    }

    // 6. 查找子串
    if (strstr(fullName, "Bond")) {
        printf("包含 'Bond'\n");
    }

    // 7. 格式化构造复杂字符串
    char info[128];
    int agentID = 7;
    sprintf(info, "Agent: %s, ID: 00%d", fullName, agentID);
    printf("信息: %s\n", info);

    return 0;
}
```

## 总结：C语言字符串避坑指南

1. **内存空间**：定义数组时，记得给 `\0` 留位置（`长度+1`）。
2. **赋值**：不要用 `=` 给数组赋值，用 `strcpy`。
3. **比较**：不要用 `==` 比较内容，用 `strcmp`。
4. **只读区**：`char *p = "hello"` 这种字符串不能修改，想修改请用数组 `char p[] = "hello"`。
5. **安全性**：尽量用 `fgets` 替代 `scanf`，用 `snprintf` 替代 `sprintf`（如果支持的话），防止缓冲区溢出。
