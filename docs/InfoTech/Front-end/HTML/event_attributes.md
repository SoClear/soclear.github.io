# event_attributes

<h1>HTML <span class="color_h1">事件属性</span></h1>
<hr>
<h2>全局事件属性</h2>
<p>HTML 4 的新特性之一是可以使 HTML 事件触发浏览器中的行为，比方说当用户点击某个 HTML 元素时启动一段 JavaScript。</p>
<p>如果你想学习更多关于事件属性，请访问 <a target="_blank" href="js-tutorial.html" rel="noopener noreferrer">JavaScript 教程</a></p>
<p>下面的表格提供了标准的事件属性，可以把它们插入 HTML/XHTML 元素中，以定义事件行为。</p>
<p><span class="new" style="float:left">New</span>&nbsp;: HTML5新增属性事件。</p>
<hr>

<h2>窗口事件属性（Window Event Attributes）</h2>
<p>由窗口触发该事件 (适用于 &lt;body&gt; 标签):</p>
<table class="reference">
<tbody><tr>
<th style="width:28%;">属性</th>
<th style="width:8%;">值</th>
<th>描述</th>
</tr>

<tr>
<td><a target="_blank" href="ev-onafterprint.html" rel="noopener noreferrer">onafterprint</a><span class="new">New</span>
</td><td><i>script</i></td>
<td>在打印文档之后运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onbeforeprint.html" rel="noopener noreferrer">onbeforeprint</a><span class="new">New</span>
</td><td><i>script</i></td>
<td>在文档打印之前运行脚本</td>
</tr>

<tr>
<td>onbeforeonload<span class="new">New</span>
</td><td><i>script</i></td>
<td>在文档加载之前运行脚本</td>
</tr>

<tr>
<td>onblur</td>
<td><i>script</i></td>
<td>当窗口失去焦点时运行脚本</td>
</tr>

<tr>
<td>onerror<span class="new">New</span>
</td><td><i>script</i></td>
<td>当错误发生时运行脚本</td>
</tr>

<tr>
<td>onfocus</td>
<td><i>script</i></td>
<td>当窗口获得焦点时运行脚本</td>
</tr>

<tr>
<td>onhashchange<span class="new">New</span>
</td><td><i>script</i></td>
<td>当文档改变时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onload.html" rel="noopener noreferrer">onload</a></td>
<td><i>script</i></td>
<td>当文档加载时运行脚本</td>
</tr>

<tr>
<td>onmessage<span class="new">New</span>
</td><td><i>script</i></td>
<td>当触发消息时运行脚本</td>
</tr>

<tr>
<td>onoffline<span class="new">New</span>
</td><td><i>script</i></td>
<td>当文档离线时运行脚本</td>
</tr>

<tr>
<td>ononline<span class="new">New</span>
</td><td><i>script</i></td>
<td>当文档上线时运行脚本</td>
</tr>

<tr>
<td>onpagehide<span class="new">New</span>
</td><td><i>script</i></td>
<td>当窗口隐藏时运行脚本</td>
</tr>

<tr>
<td>onpageshow<span class="new">New</span>
</td><td><i>script</i></td>
<td>当窗口可见时运行脚本</td>
</tr>

<tr>
<td>onpopstate<span class="new">New</span>
</td><td><i>script</i></td>
<td>当窗口历史记录改变时运行脚本</td>
</tr>

<tr>
<td>onredo<span class="new">New</span>
</td><td><i>script</i></td>
<td>当文档执行再执行操作（redo）时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onresize.html" rel="noopener noreferrer">onresize</a><span class="new">New</span>
</td><td><i>script</i></td>
<td>当调整窗口大小时运行脚本</td>
</tr>

<tr>
<td>onstorage<span class="new">New</span>
</td><td><i>script</i></td>
<td>当 Web Storage 区域更新时（存储空间中的数据发生变化时）运行脚本</td>
</tr>

<tr>
<td>onundo<span class="new">New</span>
</td><td><i>script</i></td>
<td>当文档执行撤销时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onunload.html" rel="noopener noreferrer">onunload</a><span class="new">New</span>
</td><td><i>script</i></td>
<td>当用户离开文档时运行脚本</td>
</tr>
</tbody></table>
<br>
<hr>

<h2>表单事件(Form Events)</h2>
<p>表单事件在HTML表单中触发 (适用于所有 HTML 元素, 但该HTML元素需在form表单内):</p>
<table class="reference">
<tbody><tr>
<th style="width:28%;">属性</th>
<th style="width:8%;">值</th>
<th>描述</th>
</tr>

<tr>
<td><a target="_blank" href="ev-onblur.html" rel="noopener noreferrer">onblur</a></td>
<td><i>script</i></td>
<td>当元素失去焦点时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onchange.html" rel="noopener noreferrer">onchange</a></td>
<td><i>script</i></td>
<td>当元素改变时运行脚本</td>
</tr>

<tr>
<td>oncontextmenu<span class="new">New</span>
</td><td><i>script</i></td>
<td>当触发上下文菜单时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onfocus.html" rel="noopener noreferrer">onfocus</a></td>
<td><i>script</i></td>
<td>当元素获得焦点时运行脚本</td>
</tr>

<tr>
<td>onformchange<span class="new">New</span>
</td><td><i>script</i></td>
<td>当表单改变时运行脚本</td>
</tr>

<tr>
<td>onforminput<span class="new">New</span>
</td><td><i>script</i></td>
<td>当表单获得用户输入时运行脚本</td>
</tr>

<tr>
<td>oninput<span class="new">New</span>
</td><td><i>script</i></td>
<td>当元素获得用户输入时运行脚本</td>
</tr>

<tr>
<td>oninvalid<span class="new">New</span>
</td><td><i>script</i></td>
<td>当元素无效时运行脚本</td>
</tr>

<tr>
<td>onreset</td>
<td><i>script</i></td>
<td>当表单重置时运行脚本。<span class="deprecated">HTML 5 不支持。</span></td>
</tr>

<tr>
<td><a target="_blank" href="ev-onselect.html" rel="noopener noreferrer">onselect</a></td>
<td><i>script</i></td>
<td>当选取元素时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onsubmit.html" rel="noopener noreferrer">onsubmit</a></td>
<td><i>script</i></td>
<td>当提交表单时运行脚本</td>
</tr>
</tbody></table>
<br>
<hr>

<h2>键盘事件（Keyboard Events）</h2>

<table class="reference">

<tbody><tr>
<th style="width:28%;">属性</th>
<th style="width:8%;">值</th>
<th>描述</th>
</tr>

<tr>
<td><a target="_blank" href="ev-onkeydown.html" rel="noopener noreferrer">onkeydown</a></td>
<td><i>script</i></td>
<td>当按下按键时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onkeypress.html" rel="noopener noreferrer">onkeypress</a></td>
<td><i>script</i></td>
<td>当按下并松开按键时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onkeyup.html" rel="noopener noreferrer">onkeyup</a></td>
<td><i>script</i></td>
<td>当松开按键时运行脚本</td>
</tr>
</tbody></table>
<br>
<hr>

<h2>鼠标事件（Mouse Events）</h2>

<p>通过鼠标触发事件, 类似用户的行为:</p>
<table class="reference">
<tbody><tr>
<th style="width:28%;">属性</th>
<th style="width:8%;">值</th>
<th>描述</th>
</tr>

<tr>
<td><a target="_blank" href="ev-onclick.html" rel="noopener noreferrer">onclick</a></td>
<td><i>script</i></td>
<td>当单击鼠标时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-ondblclick.html" rel="noopener noreferrer">ondblclick</a></td>
<td><i>script</i></td>
<td>当双击鼠标时运行脚本</td>
</tr>

<tr>
<td>ondrag<span class="new">New</span>
</td><td><i>script</i></td>
<td>当拖动元素时运行脚本</td>
</tr>

<tr>
<td>ondragend<span class="new">New</span>
</td><td><i>script</i></td>
<td>当拖动操作结束时运行脚本</td>
</tr>

<tr>
<td>ondragenter<span class="new">New</span>
</td><td><i>script</i></td>
<td>当元素被拖动至有效的拖放目标时运行脚本</td>
</tr>

<tr>
<td>ondragleave<span class="new">New</span>
</td><td><i>script</i></td>
<td>当元素离开有效拖放目标时运行脚本</td>
</tr>

<tr>
<td>ondragover<span class="new">New</span>
</td><td><i>script</i></td>
<td>当元素被拖动至有效拖放目标上方时运行脚本</td>
</tr>

<tr>
<td>ondragstart<span class="new">New</span>
</td><td><i>script</i></td>
<td>当拖动操作开始时运行脚本</td>
</tr>

<tr>
<td>ondrop<span class="new">New</span>
</td><td><i>script</i></td>
<td>当被拖动元素正在被拖放时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onmousedown.html" rel="noopener noreferrer">onmousedown</a></td>
<td><i>script</i></td>
<td>当按下鼠标按钮时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onmousemove.html" rel="noopener noreferrer">onmousemove</a></td>
<td><i>script</i></td>
<td>当鼠标指针移动时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onmouseout.html" rel="noopener noreferrer">onmouseout</a></td>
<td><i>script</i></td>
<td>当鼠标指针移出元素时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onmouseover.html" rel="noopener noreferrer">onmouseover</a></td>
<td><i>script</i></td>
<td>当鼠标指针移至元素之上时运行脚本</td>
</tr>

<tr>
<td><a target="_blank" href="ev-onmouseup.html" rel="noopener noreferrer">onmouseup</a></td>
<td><i>script</i></td>
<td>当松开鼠标按钮时运行脚本</td>
</tr>

<tr>
<td>onmousewheel<span class="new">New</span>
</td><td><i>script</i></td>
<td>当转动鼠标滚轮时运行脚本</td>
</tr>

<tr>
<td>onscroll<span class="new">New</span>
</td><td><i>script</i></td>
<td>当滚动元素的滚动条时运行脚本</td>
</tr>
</tbody></table>
<br>
<hr>

<h2>多媒体事件(Media Events)</h2>
<p>通过视频（videos），图像（images）或者音频（audio） 触发该事件，多应用于 HTML 媒体元素比如
 &lt;audio&gt;, &lt;embed&gt;, &lt;img&gt;, &lt;object&gt;, 和&lt;video&gt;:</p>
<table class="reference">
<tbody><tr>
<th style="width:28%;">属性</th>
<th style="width:8%;">值</th>
<th>描述</th>
</tr>

<tr>
<td>onabort</td>
<td><i>script</i></td>
<td>当发生中止事件时运行脚本</td>
</tr>

<tr>
<td>oncanplay<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介能够开始播放但可能因缓冲而需要停止时运行脚本</td>
</tr>

<tr>
<td>oncanplaythrough<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介能够无需因缓冲而停止即可播放至结尾时运行脚本</td>
</tr>

<tr>
<td>ondurationchange<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介长度改变时运行脚本</td>
</tr>

<tr>
<td>onemptied<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介资源元素突然为空时（网络错误、加载错误等）运行脚本</td>
</tr>

<tr>
<td>onended<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介已抵达结尾时运行脚本</td>
</tr>

<tr>
<td>onerror<span class="new">New</span>
</td><td><i>script</i></td>
<td>当在元素加载期间发生错误时运行脚本</td>
</tr>

<tr>
<td>onloadeddata<span class="new">New</span>
</td><td><i>script</i></td>
<td>当加载媒介数据时运行脚本</td>
</tr>

<tr>
<td>onloadedmetadata<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介元素的持续时间以及其他媒介数据已加载时运行脚本</td>
</tr>

<tr>
<td>onloadstart<span class="new">New</span>
</td><td><i>script</i></td>
<td>当浏览器开始加载媒介数据时运行脚本</td>
</tr>

<tr>
<td>onpause<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介数据暂停时运行脚本</td>
</tr>

<tr>
<td>onplay<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介数据将要开始播放时运行脚本</td>
</tr>

<tr>
<td>onplaying<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介数据已开始播放时运行脚本</td>
</tr>

<tr>
<td>onprogress<span class="new">New</span>
</td><td><i>script</i></td>
<td>当浏览器正在取媒介数据时运行脚本</td>
</tr>

<tr>
<td>onratechange<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介数据的播放速率改变时运行脚本</td>
</tr>

<tr>
<td>onreadystatechange<span class="new">New</span>
</td><td><i>script</i></td>
<td>当就绪状态（ready-state）改变时运行脚本</td>
</tr>

<tr>
<td>onseeked<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介元素的定位属性 [1] 不再为真且定位已结束时运行脚本</td>
</tr>

<tr>
<td>onseeking<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介元素的定位属性为真且定位已开始时运行脚本</td>
</tr>

<tr>
<td>onstalled<span class="new">New</span>
</td><td><i>script</i></td>
<td>当取回媒介数据过程中（延迟）存在错误时运行脚本</td>
</tr>

<tr>
<td>onsuspend<span class="new">New</span>
</td><td><i>script</i></td>
<td>当浏览器已在取媒介数据但在取回整个媒介文件之前停止时运行脚本</td>
</tr>

<tr>
<td>ontimeupdate<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介改变其播放位置时运行脚本</td>
</tr>

<tr>
<td>onvolumechange<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介改变音量亦或当音量被设置为静音时运行脚本</td>
</tr>

<tr>
<td>onwaiting<span class="new">New</span>
</td><td><i>script</i></td>
<td>当媒介已停止播放但打算继续播放时运行脚本</td>
</tr>
</tbody></table>
<h2>其他事件</h2>
<table class="reference">
<tbody><tr>
<th style="width:160px">属性</th>
<th style="width:40px">值</th>
<th>描述</th>
</tr>
<tr>
<td><a target="_blank" href="ev-onshow.html" rel="noopener noreferrer">onshow</a><span class="new">New</span></td>
<td><i>script</i></td>
<td>当 &lt;menu&gt; 元素在上下文显示时触发</td>
</tr>
<tr>
<td><a target="_blank" href="ev-ontoggle.html" rel="noopener noreferrer">ontoggle</a><span class="new">New</span></td>
<td><i>script</i></td>
<td>当用户打开或关闭 &lt;details&gt; 元素时触发</td>
</tr>
</tbody></table>
