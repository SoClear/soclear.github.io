# 选择器

## 简单选择器

根据名称、id、类来选取元素

| 选择器               | 例子         | 例子描述                                 |
| -------------------- | ------------ | ---------------------------------------- |
| `.class`             | `.intro`     | 选取所有 `class="intro"` 的元素。        |
| `#id`                | `#firstname` | 选取 `id="firstname"` 的那个元素。       |
| `*`                  | `*`          | 选取所有元素。                           |
| `element`            | `p`          | 选取所有 `<p>` 元素。                    |
| `element,element,..` | `div,p`      | 选取所有 `<div>` 元素和所有 `<p>` 元素。 |

## 组合器选择器

根据它们之间的特定关系来选取元素

- 后代选择器 (空格)
- 子选择器 (`>`)
- 相邻兄弟选择器 (`+`)
- 通用兄弟选择器 (`~`)

| 选择器              | 示例    | 示例描述                                       |
| ------------------- | ------- | ---------------------------------------------- |
| `element element`   | `div p` | 选择 `<div>` 元素内的所有 `<p>` 元素。         |
| `element>element`   | `div>p` | 选择其父元素是 `<div>` 元素的所有 `<p>` 元素。 |
| `element+element`   | `div+p` | 选择所有紧随 `<div>` 元素之后的 `<p>` 元素。   |
| `element1~element2` | `p~ul`  | 选择前面有 `<p>` 元素的每个 `<ul>` 元素。      |

## 伪类选择器

根据特定状态选取元素

伪类用于定义元素的特殊状态。

例如，它可以用于：

- 设置鼠标悬停在元素上时的样式
- 为已访问和未访问链接设置不同的样式
- 设置元素获得焦点时的样式

| 选择器                 | 例子                    | 例子描述                                                         |
| ---------------------- | ----------------------- | ---------------------------------------------------------------- |
| `:active`              | `a:active`              | 选择活动的链接。                                                 |
| `:checked`             | `input:checked`         | 选择每个被选中的 `<input>` 元素。                                |
| `:disabled`            | `input:disabled`        | 选择每个被禁用的 `<input>` 元素。                                |
| `:empty`               | `p:empty`               | 选择没有子元素的每个 `<p>` 元素。                                |
| `:enabled`             | `input:enabled`         | 选择每个已启用的 `<input>` 元素。                                |
| `:first-child`         | `p:first-child`         | 选择作为其父的首个子元素的每个 `<p>` 元素。                      |
| `:first-of-type`       | `p:first-of-type`       | 选择作为其父的首个 `<p>` 元素的每个 `<p>` 元素。                 |
| `:focus`               | `input:focus`           | 选择获得焦点的 `<input>` 元素。                                  |
| `:hover`               | `a:hover`               | 选择鼠标悬停其上的链接。                                         |
| `:in-range`            | `input:in-range`        | 选择具有指定范围内的值的 `<input>` 元素。                        |
| `:invalid`             | `input:invalid`         | 选择所有具有无效值的 `<input>` 元素。                            |
| `:lang(language)`      | `p:lang(it)`            | 选择每个 lang 属性值以 "it" 开头的 `<p>` 元素。                  |
| `:last-child`          | `p:last-child`          | 选择作为其父的最后一个子元素的每个 `<p>` 元素。                  |
| `:last-of-type`        | `p:last-of-type`        | 选择作为其父的最后一个 `<p>` 元素的每个 `<p>` 元素。             |
| `:link`                | `a:link`                | 选择所有未被访问的链接。                                         |
| `:not(selector)`       | `:not(p)`               | 选择每个非 `<p>` 元素的元素。                                    |
| `:nth-child(n)`        | `p:nth-child(2)`        | 选择作为其父的第二个子元素的每个 `<p>` 元素。                    |
| `:nth-last-child(n)`   | `p:nth-last-child(2)`   | 选择作为父的第二个子元素的每个`<p>`元素，从最后一个子元素计数。  |
| `:nth-last-of-type(n)` | `p:nth-last-of-type(2)` | 选择作为父的第二个`<p>`元素的每个`<p>`元素，从最后一个子元素计数 |
| `:nth-of-type(n)`      | `p:nth-of-type(2)`      | 选择作为其父的第二个 `<p>` 元素的每个 `<p>` 元素。               |
| `:only-of-type`        | `p:only-of-type`        | 选择作为其父的唯一 `<p>` 元素的每个 `<p>` 元素。                 |
| `:only-child`          | `p:only-child`          | 选择作为其父的唯一子元素的 `<p>` 元素。                          |
| `:optional`            | `input:optional`        | 选择不带 "required" 属性的 `<input>` 元素。                      |
| `:out-of-range`        | `input:out-of-range`    | 选择值在指定范围之外的 `<input>` 元素。                          |
| `:read-only`           | `input:read-only`       | 选择指定了 "readonly" 属性的 `<input>` 元素。                    |
| `:read-write`          | `input:read-write`      | 选择不带 "readonly" 属性的 `<input>` 元素。                      |
| `:required`            | `input:required`        | 选择指定了 "required" 属性的 `<input>` 元素。                    |
| `:root`                | `root`                  | 选择元素的根元素。                                               |
| `:target`              | `#news:target`          | 选择当前活动的 #news 元素（单击包含该锚名称的 URL）。            |
| `:valid`               | `input:valid`           | 选择所有具有有效值的 `<input>` 元素。                            |
| `:visited`             | `a:visited`             | 选择所有已访问的链接。                                           |

## 伪元素选择器

选取元素的一部分并设置其样式

CSS 伪元素用于设置元素指定部分的样式。

例如，它可用于：

- 设置元素的首字母、首行的样式
- 在元素的内容之前或之后插入内容

| 选择器             | 例子              | 例子描述                        |
| ------------------ | ----------------- | ------------------------------- |
| `[::after]`        | `p::after`        | 在每个 `<p>` 元素之后插入内容。 |
| `[::before]`       | `p::before`       | 在每个 `<p>` 元素之前插入内容。 |
| `[::first-letter]` | `p::first-letter` | 选择每个 `<p>` 元素的首字母。   |
| `[::first-line]`   | `p::first-line`   | 选择每个 `<p>` 元素的首行。     |
| `[::selection]`    | `p::selection`    | 选择用户选择的元素部分。        |

## 属性选择器

根据属性或属性值来选取元素

| 选择器                | 例子                  | 例子描述                                                |
| --------------------- | --------------------- | ------------------------------------------------------- |
| `[attribute]`         | `[target]`            | 选择带有 target 属性的所有元素                          |
| `[attribute=value]`   | `[target=_black]`     | 选择带有 target="_blank" 属性的所有元素                 |
| `[attribute~=value]`  | `[title~=flower]`     | 选择带有包含 "flower" 一词的 title 属性的所有元素       |
| `[attribute\|=value]` | `[lang\|=en]`           | 选择带有以 "en" 开头的 lang 属性的所有元素              |
| `[attribute^=value]`  | `a[href^="https"]`    | 选择其 href 属性值以 "https" 开头的每个 `<a>` 元素      |
| `[attribute$=value]`  | `a[href$=".pdf"]`     | 选择其 href 属性值以 ".pdf" 结尾的每个 `<a>` 元素       |
| `[attribute*=value]`  | `a[href*="w3school"]` | 选择其 href 属性值包含子串 "w3school" 的每个 `<a>` 元素 |
