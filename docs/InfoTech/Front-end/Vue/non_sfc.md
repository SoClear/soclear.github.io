# 非单文件组件

## 1. 基本使用

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>基本使用</title>
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 
			Vue中使用组件的三大步骤：
					一、定义组件(创建组件)
					二、注册组件
					三、使用组件(写组件标签)

			一、如何定义一个组件？
						使用Vue.extend(options)创建，其中options和new Vue(options)时传入的那个options几乎一样，但也有点区别；
						区别如下：
								1.el不要写，为什么？ ——— 最终所有的组件都要经过一个vm的管理，由vm中的el决定服务哪个容器。
								2.data必须写成函数，为什么？ ———— 避免组件被复用时，数据存在引用关系。
						备注：使用template可以配置组件结构。

			二、如何注册组件？
							1.局部注册：靠new Vue的时候传入components选项
							2.全局注册：靠Vue.component('组件名',组件)

			三、编写组件标签：
							<school></school>
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <hello></hello>
   <hr>
   <h1>{{msg}}</h1>
   <hr>
   <!-- 第三步：编写组件标签 -->
   <school></school>
   <hr>
   <!-- 第三步：编写组件标签 -->
   <student></student>
  </div>

  <div id="root2">
   <hello></hello>
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false

  //第一步：创建school组件
  const school = Vue.extend({
   template:`
    <div class="demo">
     <h2>学校名称：{{schoolName}}</h2>
     <h2>学校地址：{{address}}</h2>
     <button @click="showName">点我提示学校名</button> 
    </div>
   `,
   // el:'#root', //组件定义时，一定不要写el配置项，因为最终所有的组件都要被一个vm管理，由vm决定服务于哪个容器。
   data(){
    return {
     schoolName:'尚硅谷',
     address:'北京昌平'
    }
   },
   methods: {
    showName(){
     alert(this.schoolName)
    }
   },
  })

  //第一步：创建student组件
  const student = Vue.extend({
   template:`
    <div>
     <h2>学生姓名：{{studentName}}</h2>
     <h2>学生年龄：{{age}}</h2>
    </div>
   `,
   data(){
    return {
     studentName:'张三',
     age:18
    }
   }
  })
  
  //第一步：创建hello组件
  const hello = Vue.extend({
   template:`
    <div> 
     <h2>你好啊！{{name}}</h2>
    </div>
   `,
   data(){
    return {
     name:'Tom'
    }
   }
  })
  
  //第二步：全局注册组件
  Vue.component('hello',hello)

  //创建vm
  new Vue({
   el:'#root',
   data:{
    msg:'你好啊！'
   },
   //第二步：注册组件（局部注册）
   components:{
    school,
    student
   }
  })

  new Vue({
   el:'#root2',
  })
 </script>
</html>
```

## 2. 几个注意点

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>几个注意点</title>
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 
			几个注意点：
					1.关于组件名:
								一个单词组成：
											第一种写法(首字母小写)：school
											第二种写法(首字母大写)：School
								多个单词组成：
											第一种写法(kebab-case命名)：my-school
											第二种写法(CamelCase命名)：MySchool (需要Vue脚手架支持)
								备注：
										(1).组件名尽可能回避HTML中已有的元素名称，例如：h2、H2都不行。
										(2).可以使用name配置项指定组件在开发者工具中呈现的名字。

					2.关于组件标签:
								第一种写法：<school></school>
								第二种写法：<school/>
								备注：不用使用脚手架时，<school/>会导致后续组件不能渲染。

					3.一个简写方式：
								const school = Vue.extend(options) 可简写为：const school = options
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <h1>{{msg}}</h1>
   <school></school>
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false
  
  //定义组件
  const s = Vue.extend({
   name:'atguigu',
   template:`
    <div>
     <h2>学校名称：{{name}}</h2> 
     <h2>学校地址：{{address}}</h2> 
    </div>
   `,
   data(){
    return {
     name:'尚硅谷',
     address:'北京'
    }
   }
  })

  new Vue({
   el:'#root',
   data:{
    msg:'欢迎学习Vue!'
   },
   components:{
    school:s
   }
  })
 </script>
</html>
```

## 3. 组件的嵌套

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>组件的嵌套</title>
  <!-- 引入Vue -->
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 准备好一个容器-->
  <div id="root">
   
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false //阻止 vue 在启动时生成生产提示。

  //定义student组件
  const student = Vue.extend({
   name:'student',
   template:`
    <div>
     <h2>学生姓名：{{name}}</h2> 
     <h2>学生年龄：{{age}}</h2> 
    </div>
   `,
   data(){
    return {
     name:'尚硅谷',
     age:18
    }
   }
  })
  
  //定义school组件
  const school = Vue.extend({
   name:'school',
   template:`
    <div>
     <h2>学校名称：{{name}}</h2> 
     <h2>学校地址：{{address}}</h2> 
     <student></student>
    </div>
   `,
   data(){
    return {
     name:'尚硅谷',
     address:'北京'
    }
   },
   //注册组件（局部）
   components:{
    student
   }
  })

  //定义hello组件
  const hello = Vue.extend({
   template:`<h1>{{msg}}</h1>`,
   data(){
    return {
     msg:'欢迎来到尚硅谷学习！'
    }
   }
  })
  
  //定义app组件
  const app = Vue.extend({
   template:`
    <div> 
     <hello></hello>
     <school></school>
    </div>
   `,
   components:{
    school,
    hello
   }
  })

  //创建vm
  new Vue({
   template:'<app></app>',
   el:'#root',
   //注册组件（局部）
   components:{app}
  })
 </script>
</html>
```

## 4. VueComponent

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>VueComponent</title>
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 
			关于VueComponent：
						1.school组件本质是一个名为VueComponent的构造函数，且不是程序员定义的，是Vue.extend生成的。

						2.我们只需要写<school/>或<school></school>，Vue解析时会帮我们创建school组件的实例对象，
							即Vue帮我们执行的：new VueComponent(options)。

						3.特别注意：每次调用Vue.extend，返回的都是一个全新的VueComponent！！！！

						4.关于this指向：
								(1).组件配置中：
											data函数、methods中的函数、watch中的函数、computed中的函数 它们的this均是【VueComponent实例对象】。
								(2).new Vue(options)配置中：
											data函数、methods中的函数、watch中的函数、computed中的函数 它们的this均是【Vue实例对象】。

						5.VueComponent的实例对象，以后简称vc（也可称之为：组件实例对象）。
							Vue的实例对象，以后简称vm。
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <school></school>
   <hello></hello>
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false
  
  //定义school组件
  const school = Vue.extend({
   name:'school',
   template:`
    <div>
     <h2>学校名称：{{name}}</h2> 
     <h2>学校地址：{{address}}</h2> 
     <button @click="showName">点我提示学校名</button>
    </div>
   `,
   data(){
    return {
     name:'尚硅谷',
     address:'北京'
    }
   },
   methods: {
    showName(){
     console.log('showName',this)
    }
   },
  })

  const test = Vue.extend({
   template:`<span>atguigu</span>`
  })

  //定义hello组件
  const hello = Vue.extend({
   template:`
    <div>
     <h2>{{msg}}</h2>
     <test></test> 
    </div>
   `,
   data(){
    return {
     msg:'你好啊！'
    }
   },
   components:{test}
  })


  // console.log('@',school)
  // console.log('#',hello)

  //创建vm
  const vm = new Vue({
   el:'#root',
   components:{school,hello}
  })
 </script>
</html>
```

## 5. 一个重要的内置关系

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>一个重要的内置关系</title>
  <!-- 引入Vue -->
  <script type="text/javascript" src="../js/vue.js"></script>
 </head>
 <body>
  <!-- 
				1.一个重要的内置关系：VueComponent.prototype.__proto__ === Vue.prototype
				2.为什么要有这个关系：让组件实例对象（vc）可以访问到 Vue原型上的属性、方法。
		-->
  <!-- 准备好一个容器-->
  <div id="root">
   <school></school>
  </div>
 </body>

 <script type="text/javascript">
  Vue.config.productionTip = false //阻止 vue 在启动时生成生产提示。
  Vue.prototype.x = 99

  //定义school组件
  const school = Vue.extend({
   name:'school',
   template:`
    <div>
     <h2>学校名称：{{name}}</h2> 
     <h2>学校地址：{{address}}</h2> 
     <button @click="showX">点我输出x</button>
    </div>
   `,
   data(){
    return {
     name:'尚硅谷',
     address:'北京'
    }
   },
   methods: {
    showX(){
     console.log(this.x)
    }
   },
  })

  //创建一个vm
  const vm = new Vue({
   el:'#root',
   data:{
    msg:'你好'
   },
   components:{school}
  })

  
  //定义一个构造函数
  /* function Demo(){
   this.a = 1
   this.b = 2
  }
  //创建一个Demo的实例对象
  const d = new Demo()

  console.log(Demo.prototype) //显示原型属性

  console.log(d.__proto__) //隐式原型属性

  console.log(Demo.prototype === d.__proto__)

  //程序员通过显示原型属性操作原型对象，追加一个x属性，值为99
  Demo.prototype.x = 99

  console.log('@',d) */

 </script>
</html>
```
