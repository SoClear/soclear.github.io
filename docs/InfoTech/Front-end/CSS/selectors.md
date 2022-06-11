# 选择器

## 简单选择器

根据名称、id、类来选取元素

<table class="dataintable">
<tbody><tr>
<th>选择器</th>
<th>例子</th>
<th>例子描述</th>
</tr>

<tr>
<td><a href="" title="">.<i>class</i></a></td>
<td>.intro</td>
<td>选取所有 class="intro" 的元素。</td>
</tr>

<tr>
<td><a href="" title="">#<i>id</i></a></td>
<td>#firstname</td>
<td>选取 id="firstname" 的那个元素。</td>
</tr>

<tr>
<td><a href="" title="">*</a></td>
<td>*</td>
<td>选取所有元素。</td>
</tr>

<tr>
<td><a href="" title=""><i>element</i></a></td>
<td>p</td>
<td>选取所有 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="" title=""><i>element</i>,<i>element</i>,..</a></td>
<td>div, p</td>
<td>选取所有 &lt;div&gt; 元素和所有 &lt;p&gt; 元素。</td>
</tr>
</tbody></table>

## 组合器选择器

根据它们之间的特定关系来选取元素

- 后代选择器 (空格)
- 子选择器 (`>`)
- 相邻兄弟选择器 (`+`)
- 通用兄弟选择器 (`~`)

<table class="dataintable">
<tbody><tr>
<th>选择器</th>
<th>示例</th>
<th>示例描述</th>
</tr>

<tr>
<td><a href="/cssref/selector_element_element.asp" title="CSS element element 选择器"><i>element</i> <i>element</i></a></td>
<td>div p</td>
<td>选择 &lt;div&gt; 元素内的所有 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_element_gt.asp" title="CSS element>element 选择器"><i>element</i>&gt;<i>element</i></a></td>
<td>div &gt; p</td>
<td>选择其父元素是 &lt;div&gt; 元素的所有 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_element_plus.asp" title="CSS element+element 选择器"><i>element</i>+<i>element</i></a></td>
<td>div + p</td>
<td>选择所有紧随 &lt;div&gt; 元素之后的 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_gen_sibling.asp" title="CSS element1~element2 选择器"><i>element1</i>~<i>element2</i></a></td>
<td>p ~ ul</td>
<td>选择前面有 &lt;p&gt; 元素的每个 &lt;ul&gt; 元素。</td>
</tr>
</tbody></table>

## 伪类选择器

根据特定状态选取元素

伪类用于定义元素的特殊状态。

例如，它可以用于：

- 设置鼠标悬停在元素上时的样式
- 为已访问和未访问链接设置不同的样式
- 设置元素获得焦点时的样式

<table class="dataintable">
<tbody><tr>
<th style="width: 20%;">选择器</th>
<th style="width: 22%;">例子</th>
<th>例子描述</th>
</tr>

<tr>
<td><a href="/cssref/selector_active.asp" title="CSS :active 选择器">:active</a></td>
<td>a:active</td>
<td>选择活动的链接。</td>
</tr>

<tr>
<td><a href="/cssref/selector_checked.asp" title="CSS :checked 选择器">:checked</a></td>
<td>input:checked</td>
<td>选择每个被选中的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_disabled.asp" title="CSS :disabled 选择器">:disabled</a></td>
<td>input:disabled</td>
<td>选择每个被禁用的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_empty.asp" title="CSS :empty 选择器">:empty</a></td>
<td>p:empty</td>
<td>选择没有子元素的每个 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_enabled.asp" title="CSS :enabled 选择器">:enabled</a></td>
<td>input:enabled</td>
<td>选择每个已启用的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_first-child.asp" title="CSS :first-child 选择器">:first-child</a></td>
<td>p:first-child</td>
<td>选择作为其父的首个子元素的每个 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_first-of-type.asp" title="CSS :first-of-type 选择器">:first-of-type</a></td>
<td>p:first-of-type</td>
<td>选择作为其父的首个 &lt;p&gt; 元素的每个 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_focus.asp" title="CSS :focus 选择器">:focus</a></td>
<td>input:focus</td>
<td>选择获得焦点的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_hover.asp" title="CSS :hover 选择器">:hover</a></td>
<td>a:hover</td>
<td>选择鼠标悬停其上的链接。</td>
</tr>

<tr>
<td><a href="/cssref/selector_in-range.asp" title="CSS :in-range 选择器">:in-range</a></td>
<td>input:in-range</td>
<td>选择具有指定范围内的值的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_invalid.asp" title="CSS :invalid 选择器">:invalid</a></td>
<td>input:invalid</td>
<td>选择所有具有无效值的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_lang.asp" title="CSS :lang(language) 选择器">:lang(<i>language</i>)</a></td>
<td>p:lang(it)</td>
<td>选择每个 lang 属性值以 "it" 开头的 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_last-child.asp" title="CSS :last-child 选择器">:last-child</a></td>
<td>p:last-child</td>
<td>选择作为其父的最后一个子元素的每个 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_last-of-type.asp" title="CSS :last-of-type 选择器">:last-of-type</a></td>
<td>p:last-of-type</td>
<td>选择作为其父的最后一个 &lt;p&gt; 元素的每个 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_link.asp" title="CSS :link 选择器">:link</a></td>
<td>a:link</td>
<td>选择所有未被访问的链接。</td>
</tr>

<tr>
<td><a href="/cssref/selector_not.asp" title="CSS :not(selector) 选择器">:not(<i>selector</i>)</a></td>
<td>:not(p)</td>
<td>选择每个非 &lt;p&gt; 元素的元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_nth-child.asp" title="CSS :nth-child(n) 选择器">:nth-child(<i>n</i>)</a></td>
<td>p:nth-child(2)</td>
<td>选择作为其父的第二个子元素的每个 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_nth-last-child.asp" title="CSS :nth-last-child(n) 选择器">:nth-last-child(<i>n</i>)</a></td>
<td>p:nth-last-child(2)</td>
<td>选择作为父的第二个子元素的每个&lt;p&gt;元素，从最后一个子元素计数。</td>
</tr>

<tr>
<td><a href="/cssref/selector_nth-last-of-type.asp" title="CSS :nth-last-of-type(n) 选择器">:nth-last-of-type(<i>n</i>)</a></td>
<td>p:nth-last-of-type(2)</td>
<td>选择作为父的第二个&lt;p&gt;元素的每个&lt;p&gt;元素，从最后一个子元素计数</td>
</tr>

<tr>
<td><a href="/cssref/selector_nth-of-type.asp" title="CSS :nth-of-type(n) 选择器">:nth-of-type(<i>n</i>)</a></td>
<td>p:nth-of-type(2)</td>
<td>选择作为其父的第二个 &lt;p&gt; 元素的每个 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_only-of-type.asp" title="CSS :only-of-type 选择器">:only-of-type</a></td>
<td>p:only-of-type</td>
<td>选择作为其父的唯一 &lt;p&gt; 元素的每个 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_only-child.asp" title="CSS :only-child 选择器">:only-child</a></td>
<td>p:only-child</td>
<td>选择作为其父的唯一子元素的 &lt;p&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_optional.asp" title="CSS :optional 选择器">:optional</a></td>
<td>input:optional</td>
<td>选择不带 "required" 属性的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_out-of-range.asp" title="CSS :out-of-range 选择器">:out-of-range</a></td>
<td>input:out-of-range</td>
<td>选择值在指定范围之外的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_read-only.asp" title="CSS :read-only 选择器">:read-only</a></td>
<td>input:read-only</td>
<td>选择指定了 "readonly" 属性的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_read-write.asp" title="CSS :read-write 选择器">:read-write</a></td>
<td>input:read-write</td>
<td>选择不带 "readonly" 属性的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_required.asp" title="CSS :required 选择器">:required</a></td>
<td>input:required</td>
<td>选择指定了 "required" 属性的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_root.asp" title="CSS :root 选择器">:root</a></td>
<td>root</td>
<td>选择元素的根元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_target.asp" title="CSS :target 选择器">:target</a></td>
<td>#news:target</td>
<td>选择当前活动的 #news 元素（单击包含该锚名称的 URL）。</td>
</tr>

<tr>
<td><a href="/cssref/selector_valid.asp" title="CSS :valid 选择器">:valid</a></td>
<td>input:valid</td>
<td>选择所有具有有效值的 &lt;input&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_visited.asp" title="CSS :visited 选择器">:visited</a></td>
<td>a:visited</td>
<td>选择所有已访问的链接。</td>
</tr>
</tbody></table>

## 伪元素选择器

选取元素的一部分并设置其样式

CSS 伪元素用于设置元素指定部分的样式。

例如，它可用于：

- 设置元素的首字母、首行的样式
- 在元素的内容之前或之后插入内容

<table class="dataintable">
<tbody><tr>
<th style="width: 20%;">选择器</th>
<th style="width: 22%;">例子</th>
<th>例子描述</th>
</tr>

<tr>
<td><a href="/cssref/selector_after.asp" title="">::after</a></td>
<td>p::after</td>
<td>在每个 &lt;p&gt; 元素之后插入内容。</td>
</tr>

<tr>
<td><a href="/cssref/selector_before.asp" title="">::before</a></td>
<td>p::before</td>
<td>在每个 &lt;p&gt; 元素之前插入内容。</td>
</tr>

<tr>
<td><a href="/cssref/selector_first-letter.asp" title="">::first-letter</a></td>
<td>p::first-letter</td>
<td>选择每个 &lt;p&gt; 元素的首字母。</td>
</tr>

<tr>
<td><a href="/cssref/selector_first-line.asp" title="">::first-line</a></td>
<td>p::first-line</td>
<td>选择每个 &lt;p&gt; 元素的首行。</td>
</tr>

<tr>
<td><a href="/cssref/selector_selection.asp" title="">::selection</a></td>
<td>p::selection</td>
<td>选择用户选择的元素部分。</td>
</tr>
</tbody></table>

## 属性选择器

根据属性或属性值来选取元素

<table class="dataintable">
<tbody><tr>
<th>选择器</th>
<th>例子</th>
<th>例子描述</th>
</tr>

<tr>
<td><a href="/cssref/selector_attribute.asp" title="CSS [attribute] 选择器">[<i>attribute</i>]</a></td>
<td>[target]</td>
<td>选择带有 target 属性的所有元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_attribute_value.asp" title="CSS [attribute=value] 选择器">[<i>attribute</i>=<i>value</i>]</a></td>
<td>[target=_blank]</td>
<td>选择带有 target="_blank" 属性的所有元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_attribute_value_contain.asp" title="CSS [attribute~=value] 选择器">[<i>attribute</i>~=<i>value</i>]</a></td>
<td>[title~=flower]</td>
<td>选择带有包含 "flower" 一词的 title 属性的所有元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_attribute_value_start.asp" title="CSS [attribute|=value] 选择器">[<i>attribute</i>|=<i>value</i>]</a></td>
<td>[lang|=en]</td>
<td>选择带有以 "en" 开头的 lang 属性的所有元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_attr_begin.asp" title="CSS [attribute^=value] 选择器">[<i>attribute</i>^=<i>value</i>]</a></td>
<td>a[href^="https"]</td>
<td>选择其 href 属性值以 "https" 开头的每个 &lt;a&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_attr_end.asp" title="CSS [attribute$=value] 选择器">[<i>attribute</i>$=<i>value</i>]</a></td>
<td>a[href$=".pdf"]</td>
<td>选择其 href 属性值以 ".pdf" 结尾的每个 &lt;a&gt; 元素。</td>
</tr>

<tr>
<td><a href="/cssref/selector_attr_contain.asp" title="CSS [attribute*=value] 选择器">[<i>attribute</i>*=<i>value</i>]</a></td>
<td>a[href*="w3school"]</td>
<td>选择其 href 属性值包含子串 "w3school" 的每个 &lt;a&gt; 元素。</td>
</tr>
</tbody></table>
