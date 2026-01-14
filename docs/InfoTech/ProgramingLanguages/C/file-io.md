# 文件读写

C语言的文件操作是编程中非常基础且重要的部分，它允许程序将数据持久化保存到磁盘，或者从磁盘读取数据。

C语言中的所有文件操作都是通过 **标准输入输出库 (`stdio.h`)** 提供的函数来实现的。

以下是 C 语言文件操作的完整指南，涵盖了从打开到关闭的整个流程。

---

## 1. 核心概念：文件指针 (File Pointer)

在C语言中，文件不仅仅是磁盘上的数据，它被抽象为一个流（Stream）。我们通过一个指向 `FILE` 结构体的指针来操作这个流。

```c
FILE *fp; // 定义一个文件指针
```

---

## 2. 打开文件：`fopen`

在使用文件之前，必须先打开它。

**语法：**

```c
FILE *fopen(const char *filename, const char *mode);
```

- **filename**: 文件名（可以是相对路径或绝对路径）。
- **mode**: 打开模式（字符串）。

**常用的打开模式：**

| 模式 | 描述 | 注意事项 |
| :--- | :--- | :--- |
| `"r"` | **只读** (Read) | 文件必须存在，否则返回 NULL。 |
| `"w"` | **只写** (Write) | 若文件存在，**内容会被清空**；若不存在，创建新文件。 |
| `"a"` | **追加** (Append) | 若文件存在，数据写入文件末尾；若不存在，创建新文件。 |
| `"r+"` | **读写** | 文件必须存在。 |
| `"w+"` | **读写** | 若文件存在，**内容会被清空**；若不存在，创建新文件。 |
| `"a+"` | **读写追加** | 读取可从任意位置开始，写入永远在末尾。 |
| `"rb"`, `"wb"`... | **二进制模式** | 在 Windows 下处理非文本文件（如图片、音频）时必须加 `b`，Linux下通常忽略。 |

**安全检查（非常重要）：**
每次打开文件后，都应该检查指针是否为 `NULL`。

```c
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("打开文件失败"); // 输出错误原因
    return -1;
}
```

---

## 3. 关闭文件：`fclose`

操作完成后，**必须**关闭文件以释放资源并刷新缓冲区。

**语法：**

```c
int fclose(FILE *stream);
```

```c
fclose(fp);
fp = NULL; // 这是一个好习惯，防止野指针
```

---

## 4. 文件的读写操作

C语言提供了多种读写方式，适用于不同的场景。

### A. 字符读写 (一次一个字符)

- **写:** `int fputc(int char, FILE *stream)`
- **读:** `int fgetc(FILE *stream)`

```c
// 写入
fputc('A', fp);

// 读取
char c = fgetc(fp);
while (c != EOF) { // EOF 是 End Of File 的宏
    printf("%c", c);
    c = fgetc(fp);
}
```

### B. 字符串/行读写 (一次一行)

- **写:** `int fputs(const char *str, FILE *stream)`
- **读:** `char *fgets(char *str, int n, FILE *stream)`

```c
// 写入
fputs("Hello World\n", fp);

// 读取
char buffer[100];
// fgets 会读取 n-1 个字符，或者读到换行符为止，自动添加 \0
while (fgets(buffer, 100, fp) != NULL) {
    printf("%s", buffer);
}
```

### C. 格式化读写 (类似 printf/scanf)

适用于处理结构化的文本数据（如 CSV 文件）。

- **写:** `fprintf(FILE *stream, const char *format, ...)`
- **读:** `fscanf(FILE *stream, const char *format, ...)`

```c
int id = 101;
char name[] = "Alice";

// 写入：101 Alice
fprintf(fp, "%d %s\n", id, name); 

// 读取
rewind(fp); // 回到文件开头
fscanf(fp, "%d %s", &id, name);
```

### D. 二进制块读写 (重要)

适用于读写数组、结构体、图片等原始数据。**效率最高**。

- **写:** `size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream)`
- **读:** `size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream)`

```c
struct Student {
    int id;
    char name[20];
} s1 = {1, "Bob"};

// 写入结构体
// 参数：数据指针，单个元素大小，元素个数，文件流
fwrite(&s1, sizeof(struct Student), 1, fp);

// 读取结构体
struct Student s2;
fread(&s2, sizeof(struct Student), 1, fp);
```

---

## 5. 文件定位 (随机读写)

文件流中有一个“光标”（位置指针），读写时会自动向后移动。我们可以手动控制它。

- **`ftell(fp)`**: 返回当前光标相对于文件开头的字节偏移量。
- **`rewind(fp)`**: 将光标重置到文件开头。
- **`fseek(fp, offset, origin)`**: 将光标移动到指定位置。

**fseek 的 origin 参数：**

- `SEEK_SET`: 文件开头
- `SEEK_CUR`: 当前位置
- `SEEK_END`: 文件末尾

### 示例：获取文件大小

```c
fseek(fp, 0, SEEK_END); // 移到末尾
long fileSize = ftell(fp); // 获取位置（即大小）
rewind(fp); // 移回开头，方便后续操作
```

---

## 6. 综合示例代码

下面是一个完整的例子：写入一些文本，然后读取并显示出来。

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *fp;
    char filename[] = "example.txt";
    char buffer[100];

    // --- 1. 写入文件 ---
    fp = fopen(filename, "w"); // "w" 模式会清空原文件或新建
    if (fp == NULL) {
        perror("无法打开文件进行写入");
        return 1;
    }

    fprintf(fp, "Line 1: Hello C Language\n");
    fputs("Line 2: File Operations are fun\n", fp);
    
    printf("数据已写入文件。\n");
    fclose(fp); // 写入完成后必须关闭

    // --- 2. 读取文件 ---
    fp = fopen(filename, "r"); // "r" 模式只读
    if (fp == NULL) {
        perror("无法打开文件进行读取");
        return 1;
    }

    printf("\n--- 文件内容 ---\n");
    // 循环读取每一行
    while (fgets(buffer, sizeof(buffer), fp) != NULL) {
        printf("%s", buffer); // buffer 中已经包含了换行符
    }

    fclose(fp);
    
    return 0;
}
```

## 7. 常见问题与注意事项

1. **路径问题**：
    - 在 Windows 中路径分隔符是反斜杠 `\`，但在 C 字符串中 `\` 是转义字符，所以需要写成双反斜杠 `\\` (例如 `"C:\\Users\\test.txt"`)，或者直接使用正斜杠 `/` (Windows 也支持，例如 `"C:/Users/test.txt"`)。
2. **文本模式 vs 二进制模式**：
    - **文本模式 (`"w"`, `"r"`)**: 在 Windows 系统中，换行符 `\n` 在写入文件时会被转换为 `\r\n`，读取时 `\r\n` 会被还原为 `\n`。
    - **二进制模式 (`"wb"`, `"rb"`)**: 不做任何转换，是什么存什么。读写非文本文件（视频、exe、图片）必须用这个。
3. **EOF 判断**：
    - 不要在循环条件中直接使用 `while(!feof(fp))`，这通常会导致多读取一次最后的数据。建议使用 `fgets` 或 `fscanf` 的返回值来判断循环结束。
