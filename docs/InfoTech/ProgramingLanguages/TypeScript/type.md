# 类型

<table class="reference">
<tbody><tr>
<th>数据类型</th>
<th>关键字</th>
<th>描述</th>
</tr>
<tr>
<td>任意类型</td>
<td>any</td>
<td>声明为 any 的变量可以赋予任意类型的值。</td>
</tr>
<tr>
<td class="ts">数字类型</td>
<td class="ts">number</td>
<td><p>双精度 64 位浮点值。它可以用来表示整数和分数。</p>

<pre class="prettyprint prettyprinted" style=""><span class="kwd">let</span><span class="pln"> binaryLiteral</span><span class="pun">:</span><span class="pln"> number </span><span class="pun">=</span><span class="pln"> </span><span class="lit">0b1010</span><span class="pun">;</span><span class="pln"> </span><span class="com">// 二进制</span><span class="pln">
</span><span class="kwd">let</span><span class="pln"> octalLiteral</span><span class="pun">:</span><span class="pln"> number </span><span class="pun">=</span><span class="pln"> </span><span class="lit">0o744</span><span class="pun">;</span><span class="pln">    </span><span class="com">// 八进制</span><span class="pln">
</span><span class="kwd">let</span><span class="pln"> decLiteral</span><span class="pun">:</span><span class="pln"> number </span><span class="pun">=</span><span class="pln"> </span><span class="lit">6</span><span class="pun">;</span><span class="pln">    </span><span class="com">// 十进制</span><span class="pln">
</span><span class="kwd">let</span><span class="pln"> hexLiteral</span><span class="pun">:</span><span class="pln"> number </span><span class="pun">=</span><span class="pln"> </span><span class="lit">0xf00d</span><span class="pun">;</span><span class="pln">    </span><span class="com">// 十六进制</span></pre>
</td>
</tr>
<tr>
<td>字符串类型</td>
<td>string</td>
<td><p>一个字符系列，使用单引号（<span class="marked">'</span>）或双引号（<span class="marked">"</span>）来表示字符串类型。反引号（<span class="marked">`</span>）来定义多行文本和内嵌表达式。</p>

<pre class="prettyprint prettyprinted" style=""><span class="kwd">let</span><span class="pln"> name</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pln"> </span><span class="pun">=</span><span class="pln"> </span><span class="str">"Runoob"</span><span class="pun">;</span><span class="pln">
</span><span class="kwd">let</span><span class="pln"> years</span><span class="pun">:</span><span class="pln"> number </span><span class="pun">=</span><span class="pln"> </span><span class="lit">5</span><span class="pun">;</span><span class="pln">
</span><span class="kwd">let</span><span class="pln"> words</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pln"> </span><span class="pun">=</span><span class="pln"> </span><span class="str">`您好，今年是 ${ name } 发布 ${ years + 1} 周年`</span><span class="pun">;</span></pre>
</td>
</tr>
<tr>
<td>布尔类型</td>
<td>boolean</td>
<td><p>表示逻辑值：true 和 false。</p>

<pre class="prettyprint prettyprinted" style=""><span class="kwd">let</span><span class="pln"> flag</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">boolean</span><span class="pln"> </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">true</span><span class="pun">;</span></pre>
</td>
</tr>

<tr>
<td>数组类型</td>
<td>无</td>
<td><p>声明变量为数组。</p>
<pre class="prettyprint prettyprinted" style=""><span class="com">// 在元素类型后面加上[]</span><span class="pln">
</span><span class="kwd">let</span><span class="pln"> arr</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">[]</span><span class="pln"> </span><span class="pun">=</span><span class="pln"> </span><span class="pun">[</span><span class="lit">1</span><span class="pun">,</span><span class="pln"> </span><span class="lit">2</span><span class="pun">];</span><span class="pln"></span><span class="com">// 或者使用数组泛型</span><span class="pln">
</span><span class="kwd">let</span><span class="pln"> arr</span><span class="pun">:</span><span class="pln"> </span><span class="typ">Array</span><span class="str">&lt;number&gt;</span><span class="pln"> </span><span class="pun">=</span><span class="pln"> </span><span class="pun">[</span><span class="lit">1</span><span class="pun">,</span><span class="pln"> </span><span class="lit">2</span><span class="pun">];</span></pre>

</td>
</tr>

<tr>
<td>元组</td>
<td>无</td>
<td><p>元组类型用来表示已知元素数量和类型的数组，各元素的类型不必相同，对应位置的类型需要相同。</p>
<pre class="prettyprint prettyprinted" style=""><span class="kwd">let</span><span class="pln"> x</span><span class="pun">:</span><span class="pln"> </span><span class="pun">[</span><span class="kwd">string</span><span class="pun">,</span><span class="pln"> number</span><span class="pun">];</span><span class="pln">
x </span><span class="pun">=</span><span class="pln"> </span><span class="pun">[</span><span class="str">'Runoob'</span><span class="pun">,</span><span class="pln"> </span><span class="lit">1</span><span class="pun">];</span><span class="pln">    </span><span class="com">// 运行正常</span><span class="pln">
x </span><span class="pun">=</span><span class="pln"> </span><span class="pun">[</span><span class="lit">1</span><span class="pun">,</span><span class="pln"> </span><span class="str">'Runoob'</span><span class="pun">];</span><span class="pln">    </span><span class="com">// 报错</span><span class="pln">
console</span><span class="pun">.</span><span class="pln">log</span><span class="pun">(</span><span class="pln">x</span><span class="pun">[</span><span class="lit">0</span><span class="pun">]);</span><span class="pln">    </span><span class="com">// 输出 Runoob</span></pre>

</td>
</tr>

<tr>
<td>枚举</td>
<td>enum</td>
<td><p>枚举类型用于定义数值集合。</p>
<pre class="prettyprint prettyprinted" style=""><span class="kwd">enum</span><span class="pln"> </span><span class="typ">Color</span><span class="pln"> </span><span class="pun">{</span><span class="typ">Red</span><span class="pun">,</span><span class="pln"> </span><span class="typ">Green</span><span class="pun">,</span><span class="pln"> </span><span class="typ">Blue</span><span class="pun">};</span><span class="pln">
</span><span class="kwd">let</span><span class="pln"> c</span><span class="pun">:</span><span class="pln"> </span><span class="typ">Color</span><span class="pln"> </span><span class="pun">=</span><span class="pln"> </span><span class="typ">Color</span><span class="pun">.</span><span class="typ">Blue</span><span class="pun">;</span><span class="pln">
console</span><span class="pun">.</span><span class="pln">log</span><span class="pun">(</span><span class="pln">c</span><span class="pun">);</span><span class="pln">    </span><span class="com">// 输出 2</span></pre>

</td>
</tr>

<tr>
<td class="ts">void</td>
<td class="ts">void</td>
<td><p>用于标识方法返回值的类型，表示该方法没有返回值。</p>
<pre class="prettyprint prettyprinted" style=""><span class="kwd">function</span><span class="pln"> hello</span><span class="pun">():</span><span class="pln"> </span><span class="kwd">void</span><span class="pln"> </span><span class="pun">{</span><span class="pln">
    alert</span><span class="pun">(</span><span class="str">"Hello Runoob"</span><span class="pun">);</span><span class="pln">
</span><span class="pun">}</span></pre>

</td>
</tr>
<tr>
<td>null</td>
<td>null</td>
<td><p>表示对象值缺失。</p></td>
</tr>
<tr>
<td>undefined</td>
<td>undefined</td>
<td><p>用于初始化变量为一个未定义的值</p></td>
</tr>

<tr>
<td>never</td>
<td>never</td>
<td><p>never 是其它类型（包括 null 和 undefined）的子类型，代表从不会出现的值。</p></td>
</tr>
</tbody></table>

## 代码示例一

```typescript
let a = false

a = true
// 下行报错
// a = 1

// 参数和返回值有类型
function sum(a: number, b: number) :number{
    return a + b
}

console.log(sum(2,3))
```

## 代码示例二

```typescript
// 可以使用字面量来声明类型
let a: 10
a = 10
// 下行报错，a只能为10
// a = 11

// 可以使用 | 连接多个类型(联合类型)
let b: "male" | "female"
b = "male"
b = "female"

let c: boolean | string
c = true
c = "hello"

// any 是任意类型，变量的类型设置为any后相当于关闭了对该变量的类型检测
let d: any
// 如果声明变量不指定类型，，则自动判断为any类型
let e
// any类型的变量可以直接赋值给任意变量
c = d

// unknown 类型实际上是一个类型安全的any，不能直接赋值给其他变量
let f: unknown
let g: string
// 报错 ，unknown类型不能直接赋值给其他变量
// g=f
//判断类型后可以赋值
if (typeof f === "string") {
    g = f
}

// ts的类型断言
let h = f as string
let i = <string>e

// void表示空，函数的返回值为void就表示没有返回值
function fn():void {
    // 可以return null或者return undefined或者不写return
    return null
}

// never，永远不会返回，类似Kotlin的Nothing
function f1():never {
    throw new Error("错错错")
}
```

## 代码示例三

```typescript
// object表示js对象

let a: object
a = {}
a = function () {

}

/*
{}用来制定对象中可以包含哪些属性
语法：{属性名:属性类型,属性名:属性类型}
在属性名后面加上？ 表示属性是可选的
 */
let b: { name: string, age?: number }
b = {name: "孙悟空", age: 18}

// [propName: string]: any 表示任意类型的属性
let c: { name: string, [propName: string]: any }
c = {name: "猪八戒", age: 10, gender: "男"}

// 设置函数结构的类型声明
let d: (a: number, b: number) => number

// string[]表示字符串数组
let e: string[]
e = ['a', 'b', 'c']

// number[]表示数值数组
let f: number[]

// 另一种表示数组的方式
let g: Array<number>
g = [1, 2, 3]


// 元组就是固定长度的数组
let h: [string, number]
h = ['hello', 123]


// 枚举
enum Gender {
    Male = 0,
    Female = 1
}

let i: { name: string, gender: Gender }
i = {
    name: "孙悟空",
    gender: Gender.Male
}

console.log(i.gender === Gender.Male)


// & 表示同时
let j: { name: string } & { age: number }
j = {name: "孙悟空", age: 18}

// | 表示或
let k: { name: string } | { age: number }
k = {name: "张三"}
k = {age: 17}
// 下行报错
// k={gender:1}

// 类型别名
type myType = string
let l: myType
type myType1 = 1 | 2 | 3 | 4 | 5
let m: myType1
m = 3
```
