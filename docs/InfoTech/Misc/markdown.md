# Markdown

## 简介

Markdown 是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档。

Markdown 语言在 2004 由约翰·格鲁伯（英语：John Gruber）创建。

Markdown 编写的文档可以导出 HTML 、Word、图像、PDF、Epub 等多种格式的文档。

Markdown 编写的文档后缀为 .md, .markdown。

Markdown 能被使用来撰写电子书，如：Gitbook。

当前许多网站都广泛使用 Markdown 来撰写帮助文档或是用于论坛上发表消息。例如：GitHub、简书、reddit、Diaspora、Stack Exchange、OpenStreetMap 、SourceForge等。

## 标题

使用 # 号可表示 1-6 级标题，一级标题对应一个 # 号，二级标题对应两个 # 号，以此类推。

**使用#号标记标题语法格式：**

```markdown
# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题
```

**显示效果：**

<h1>一级标题</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>
<h4>四级标题</h4>
<h5>五级标题</h5>
<h6>六级标题</h6>

最佳实践：用一个空格在 # 和标题之间进行分隔。

| ✅  Do this | ❌  Don't do this |
| --- | --- |
| `# Here's a Heading` | `#Here's a Heading` |

## 段落

Markdown的段落没有特殊的格式，直接编写文字就好。段落可以用一个空行隔开，来表明这是新的段落

最佳实践：不要用空格（spaces）或制表符（ tabs）缩进段落。

### 换行

换行是使用两个以上的空格加回车。  
如果需要多个空行使用 `<br/>`,需要几个空行用几个 `<br/>`  

### 字体

Markdown 可以使用以下几种字体：

- 用1个星号\*或底线\_表示斜体
- 用2个星号\*或底线\_表示粗体
- 用3个星号\*或底线\_表示粗斜体

**语法格式：**

```markdown
*斜体文字*

_斜体文字_

**粗体文字**

__粗体文字__

***粗斜体文字***

___粗斜体文字___
```

**显示效果：**

斜体：_斜体文字_

粗体：**粗体文字**

粗斜体：**_粗斜体文字_**

最佳实践：使用 `*` 号表示斜体，使用 `**` 来表示粗体，使用 `***` 来表示粗斜体。

### 分隔线

可以在一行中用三个以上的星号 `*` 、减号 `-` 、底线 `_` 来建立一个分隔线，行内不能有其他东西，你也可以在星号或减号中插入空格。下面这种写法都可以建立分隔线：

```markdown
***
* * *
******
- - -
------
```

**显示效果：**

---

最佳实践：

为了兼容性，请在分隔线的前后均添加空白行。

| ✅  Do this | ❌  Don't do this |
| --- | --- |
| Try to put a blank line before...<br/><br/>---<br/><br/>...and after a horizontal rule. | Without blank lines, this would be a heading.<br/>---<br/>Don't do this! |

### 删除线

如果段落上的文字要添加删除线，只需要在文字的两端加上两个波浪线~~即可。

**语法格式：**

```markdown
~~tencent.com~~
```

显示效果如下：

~~tencent.com~~

### 下划线

下划线可以通过HTML的 `<u>文本</u>` 标签来实现：

显示效果如下：
<u>带下划线文本</u>

### 脚注

脚注是对文本的补充说明。某些软件可能不显示脚注。Markdown 脚注的格式如下:  
要注明的文本后紧跟一个空格[^脚注名字]。  
还可以 `<sub>下脚注内容</sub>`，`<sup>上脚注内容</sup>`

**显示效果：**  
以下实例演示了脚注的用法：  
要注明的文本 [^这是脚注的名字]。  
要注明的文本<sub>下脚注内容</sub>  
要注明的文本<sup>上脚注内容</sup>  
[^这是脚注的名字]:脚注的内容

## 列表

### 有序列表和无序列表

Markdown支持有序列表和无序列表，无序列表使用星号(\*)、加号(+)或者减号(-)作为标记：

```markdown
* 第一项
* 第二项
* 第三项

+ 第一项
+ 第二项
+ 第三项

- 第一项
- 第二项
- 第三项
```

显示效果：

- 第一项
- 第二项
- 第三项

无序列表最佳实践：

| ✅  Do this | ❌  Don't do this |
| --- | --- |
| - First item<br/>- Second item<br/>- Third item<br/>- Fourth item | + First item <br/>* Second item<br/>- Third item<br/>+ Fourth item |

有序列表直接在文字有加上1. 2. 3. 来表示，符号和文字之间加上一个空格字符，如：

```markdown
1. 第一项
2. 第二项
3. 第三项
```

**显示效果：**

1. 第一项
2. 第二项
3. 第三项

有序列表最佳实践：

| ✅  Do this | ❌  Don't do this |
| --- | --- |
| 1. First item<br/>2. Second item` | 1) First item<br/>2) Second item |

### 列表嵌套

列表嵌套只需在子列表的选项前添加四个空格即可：

```markdown
1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素
```

**显示效果：**

1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素

## 区块

Markdown区块引用是在段落开头使用>符号，然后后面紧跟一个空格符号：

```markdown
> 区块引用
> Markdown教程
> 学的不仅是技术更是梦想
```

显示效果如下：

> 区块引用 Markdown教程 学的不仅是技术更是梦想  

另外区块是可以嵌套的，一个>符号是最外层，两个符号是第一层嵌套，以此类推：

显示效果如下：

> 最外层  
>> 第一层嵌套  
>>> 第二层嵌套

### 区块中使用列表

区块中使用列表实例如下：

```markdown
> 区块中使用列表
> 1. 第一项
> 2. 第二项
> - 第一项
> - 第二项
> - 第三项
```

显示效果：

> 区块中使用列表
>
> 1. 第一项
> 2. 第二项
>
> - 第一项
> - 第二项
> - 第三项

### 列表中使用区块

如果要在列表项目内放进区块，那么就需要在>前添加四个空格和缩进。

```markdown
- 第一项
    > Markdown教程
    > 学的不仅是技术更是梦想
- 第二项
```

显示效果如下：

- 第一项
    > Markdown教程
    > 学的不仅是技术更是梦想
- 第二项

## 代码框

如果是段落上的一个函数或片段的代码可以用两个\`把它包起来。

`print()` 函数

### 行内代码

行内代码用\`包裹起来，例如：`println("Hello world")`

### 代码区块

代码区块使用\`\`\`包裹一段代码，并指定一种语言（也可以不指定）：

<code>
```javascript
$(document).read(function(){
    alert('Markdown');
});
```
</code>

显示效果：

```javascript
$(document).read(function){
    alert('Markdown');
});
```

## 链接

链接使用方法如下：

例如：

```markdown
这是一个链接 [新浪新闻](https://news.sina.com.cn/)
<https://news.sina.com.cn/>
```

显示效果如下：

这是一个链接 [新浪新闻](https://link.zhihu.com/?target=https%3A//news.sina.com.cn/)

[https://news.sina.com.cn/](https://link.zhihu.com/?target=https%3A//news.sina.com.cn/)

最佳实践：

不同的 Markdown 应用程序处理URL中间的空格方式不一样。为了兼容性，请尽量使用%20代替空格。

| ✅  Do this | ❌  Don't do this |
| --- | --- |
| `[link](https://www.example.com/my%20great%20page)` | `[link](https://www.example.com/my great page)` |

### 高级链接

```markdown
链接也可以用变量来代替，文档末尾附带变量地址：
这个链接用1作为网址变量[baidu][1]
这个链接用markdown作为网址变量[Markdown][markdown]
然后文档的结尾为变量赋值(网址)

[1]: http://www.baidu.com
[markdown]: http://www.markdown.com
```

显示效果如下：

链接也可以用变量来代替，文档末尾附带变量地址：
这个链接用1作为网址变量[baidu][1]
这个链接用markdown作为网址变量[Markdown][markdown]
然后文档的结尾为变量赋值(网址)

[1]: http://www.baidu.com
[markdown]: http://www.markdown.com

## 图片

Markdown图片语法格式为：

```markdown
![alt 属性文本](图片地址)
![alt 属性文本](图片地址 "可选标题")
```

- 开头一个感叹号!  

- 接着一个方括号，里面放上图片的代替文字  

- 接着一个普通括号，里面放上图片的网址，最后还可以用引号包住并加上选择性的'title'属性文字。  

实例如下：

```markdown
![有问题上知乎 图标](https://pic4.zhimg.com/80/v2-a47051e92cf74930bedd7469978e6c08_hd.png)

---

![通信人家园 图标](https://pic4.zhimg.com/v2-612255e26e6a7b9452b984602dfb1387_b.jpg)
```

**显示效果如下：**

![知乎](https://pic1.zhimg.com/v2-a47051e92cf74930bedd7469978e6c08_b.png)

---

![通信人家园](https://pic4.zhimg.com/v2-612255e26e6a7b9452b984602dfb1387_b.jpg "可选标题")

也可以像网址那样对图片使用变量：

```markdown
这个图片链接用zhi作为网址变量[zhihu][zhi]
然后在文档的结尾为变量赋值（网址）

[zhi]: https://pic1.zhimg.com/v2-a47051e92cf74930bedd7469978e6c08_b.png
```

显示效果如下：

这个图片链接用zhi作为网址变量[zhihu][zhi]
然后在文档的结尾为变量赋值（网址）

[zhi]: https://pic1.zhimg.com/v2-a47051e92cf74930bedd7469978e6c08_b.png

然后在文档的结尾为变量赋值（网址）

Markdown 没有办法指定图片的高度与宽度，如果需要的话，可以使用普通的img标签。

```markdown
<img src="https://pic1.zhimg.com/v2-a47051e92cf74930bedd7469978e6c08_b.png" width=10%>
```

**显示效果：**

<img src="https://pic1.zhimg.com/v2-a47051e92cf74930bedd7469978e6c08_b.png" width=10% alt="知乎">

## 表格

Markdown制作表格使用|来分隔不同的单元格，使用-来分隔表头和其他行。

**语法格式：**

```markdown
|表头1|表头2|
|----|----|
|单元格11|单元格12|
|单元格21|单元格22|
```

**显示效果：**

|表头1|表头2|
|----|----|
|单元格11|单元格12|
|单元格21|单元格22|

### 对齐方式

可以设置表头的对齐方式：

- \-: 设置内容或标题栏右对齐
- :- 设置内容或标题栏左对齐
- :-: 设置内容或标题栏居中对齐

**语法格式：**

```markdown
|左对齐|居中对齐|右对齐|
|:----|:----:|----:|
|单元格11|单元格12|单元格13|
|单元格21|单元格22|单元格23|
```

**显示效果：**

|左对齐|居中对齐|右对齐|
|:----|:----:|----:|
|单元格11|单元格12|单元格13|
|单元格21|单元格22|单元格23|

## 高级技巧

### HTML元素

不在Markdown涵盖范围之内的标签，都可以直接在文档里面用HTML撰写。

```markdown
使用<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Del</kbd>重启电脑
```

**_显示效果如下：_**

使用<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Del</kbd>重启电脑

### 转义

**_Markdown使用了很多特殊符号来表示特定的意义，如果需要显示特定的符号则需要使用转义字符，Markdown使用反斜杠转义特殊字符：_**

**_显示效果:_**

**_文本加粗 \*\*正常显示星号\*\*_**

**_Mrkdown支持以下这些符号前面加上反斜杠来帮助插入普通符号：_**

```markdown
\   反斜线
`   反引号
*   星号
_   下划线
{}  花括号
[]  方括号
()  小括号
#   井字号
+   加号
-   减号
.   英文句点
!   感叹号
```

### 数学公式

**_当你需要在编辑器中插入数学公式时，可以使用两个美元符 \$\$ 包裹 TeX 或 LaTeX 格式的数学公式来实现。_**

**_实例如下：_**

```markdown
$$
\int_0^1 {x^2} \,{\rm d}x
$$
```

**_显示效果：_**

$$
\int_0^1 {x^2} \,{\rm d}x
$$
