# 初识

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <!--    通过CDN引入Vue-->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
</head>
<body>
<!--容器-->
<div id="app">
    <!--    插值语法 {{xxx}} 用于解析标签体内容 ，xxx是js表达式，可以读取data中的所有属性  -->
    <h1>Hello,{{ name }}</h1>
    <!--    指令语法 v-xxx:js表达式 用于解析标签-->
    <a v-bind:href="website.url.toUpperCase()">带你去{{ website.name }}</a>
    <!--    v-bind:href的简写形式为:href-->
    <a :href="website.url">带你去百度</a>
    <div>
        <!--单向数据绑定：v-bind，数据只能从data流向页面 -->
        单向数据绑定：<input type="text" v-bind:value="d">
    </div>
    <div>
        <!--双向数据绑定：v-model， 数据能从data流向页面，也能从页面流向data.
         一般用在表单元素上
         v-model:value可以简写为v-model，因为v-model默认收集value值-->
        双向数据绑定：<input type="text" v-model:value="s">
        双向数据绑定：<input type="text" v-model="s">
    </div>
</div>
<script>
    // 关闭生产提示
    Vue.productionTip = false
    // Vue实例与容器一一对应，真实开发中只有一个实例且配合组件使用
    // 表达式有值，语句无值
    /**
     * data与el的2种写法
     * 1.el有2种写法
     * (1).new Vue时候配置el属性。
     * (2).先创建Vue实例,随后再通过vm. $mount('#root')指定el的值。
     *
     * 2.data有2种写法
     * (1).对象式 data:{}
     * (2).函数式 data(){ return {} }，或 data:function(){ return {} }
     * 如何选择:目前哪种写法都可以，以后学习到组件时，data必须使用函数式，否则会报错。
     *
     * 3.一个重要的原则;
     * 由Vue管理的函数，一定不要写箭头函数，一旦写了箭头函数，this就不再是Vue实例了。
     */

    /**
     * MVVM模型
     * 1. M:模型(Model) : data中的数据
     * 2. V:视图(View):模板代码
     * 3. VM:视图模型(ViewModel):Vue实例
     *
     * 观察发现:
     * 1.data中所有的属性,最后都出现在了vm身上。
     * 2.vm身上所有的属性及Vue原型上所有属性，在Vue模板中都可以直接使用.
     */
    const vm = new Vue({
        // el 指定容器，通常为CSS选择器。另一种写法：不写el，在外层写vm.$mount("#app")
        el: "#app",
        // data 存储数据
        data: {
            // data 中的数据更新，页面中用到该值的地方也会自动更新
            name: "张三",
            website: {
                name: "百度",
                url: "https://www.baidu.com/"
            },
            d: "",
            s: ""
        }
        // 另一种data写法
        /*
        data(){
            return {}
        }
         */
    })
    // 另一种指定容器的方式
    // vm.$mount("#app")
</script>
</body>
</html>
```
