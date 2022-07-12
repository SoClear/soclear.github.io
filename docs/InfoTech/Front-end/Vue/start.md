# 初识

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <!--    通过CDN引入Vue-->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
    <style>
        * {
            margin-top: 20px;
        }

        .demo1 {
            height: 50px;
            background-color: skyblue;
        }

        .box1 {
            padding: 5px;
            background-color: skyblue;
        }

        .box2 {
            padding: 5px;
            background-color: orange;
        }

        .list {
            width: 200px;
            height: 200px;
            background-color: peru;
            /*带滚动条*/
            overflow: auto;
        }

        li {
            height: 100px;
        }
    </style>
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
    <!--
    事件的基本使用:
    1.使用v-on :xxx或@xxx绑定事件,其中xxx是事件名;
    2.事件的回调需要配置在methods对象中，最终会在vm上;
    3.methods中配置的函数，不要用箭头函数!否则this就不是vm了;
    4.methods中配置的函数，都是被Vue所管理的函数，this的指向是vm或组件实例对象;
    5.@click="demo”和@click="demo($event)”效果一致，但后者可以传参;
    -->
    <button @click="showInfo1">点我提示信息1</button>
    <button @click="showInfo2($event,66)">点我提示信息2</button>

    <!--
    Vue中的事件修饰符:
    1.prevent:阻止默认事件（常用）;
    2.stop:阻止事件冒泡（常用）;
    3.once:事件只触发一次（常用）;
    4.capture:使用事件的捕获模式;
    5.self:只有event.target是当前操作的元素时才触发事件;
    6.passive:事件的默认行为立即执行，无需等待事件回调执行完毕;
    -->
    <a href="https://www.baidu.com" @click.prevent="showInfo1">阻止默认事件</a>
    <!--冒泡阶段是由内往外的-->
    <div class="demo1" @click="showInfo1">
        <button @click.stop="showInfo1">阻止事件冒泡</button>
    </div>

    <!--修饰符可以连续写，但顺序和你写的顺序相同-->
    <div class="demo1" @click="showInfo1">
        <button @click.stop.prevent="showInfo1">阻止事件冒泡</button>
    </div>

    <button @click.once="showInfo1">事件只触发一次</button>
    <!--    使用事件的捕获模式，捕获是由外往内的-->
    <div class="box1" @click="showMsg(1)">
        div1
        <div class="box2" @click="showMsg(2)">
            div2
        </div>
    </div>
    <!--只有event.target是当前操作的元素时才触发事件-->
    <div class="demo1" @click.self="showInfo1">
        <button @click.stop="showInfo1">只有event.target是当前操作的元素时才触发事件</button>
    </div>
    <!--事件的默认行为立即执行，无需等待事件回调执行完毕-->
    <!--优先响应滚动-->
    <ul @wheel.passive="scrollDemo" class="list">
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
    </ul>


    <!--
    键盘事件
    @keydown 按下触发
    @keyup 抬起触发

    1.Vue中常用的按键别名:
        回车 => enter
        删除 => delete(捕获“删除”和“退格”键)退出=>esc
        空格 => space
        换行 => tab
        上 => up
        下 => down
        左 => left
        右 => right

    2.Vue未提供别名的按键，可以使用按键原始的key值去绑定，但注意要转为kebab-case（短横线命名)

    3.系统修饰键（用法特殊）:ctrl、alt、shift、meta
        (1).配合keyup使用:按下修饰键的同时，再按下其他键，随后释放其他键，事件才被触发。
        (2).配合keydown使用:正常触发事件。

    4.也可以使用keyCode去指定具体的按键(不推荐)

    5.Vue.config. keyCodes.自定义键名=键码,可以去定制按键别名

    -->
    <input type="text" placeholder="按下回车提示输入" @keyup.enter="showInput">
    <!--     组合键CTRL Y -->
    <input type="text" placeholder="按下回车提示输入" @keyup.ctrl.y="showInput">

    <!--
    计算属性
        1.定义:要用的属性不存在，要通过已有属性计算得来。
        2.原理:底层借助了Object.defineProperty方法提供的getter和setter.
        3.get函数什么时候执行?
            (1).初次读取时会执行一次。
            (2).当依赖的数据发生改变时会被再次调用。
        4.优势:与methods实现相比，内部有缓存机制（复用），效率更高，调试方便。
        5.备注:
            1.计算属性最终会出现在vm上，直接读取使用即可。
            2.如果计算属性要被修改，那必须写set函数去响应修改，且set中要引起计算时依赖的数据发生变化
    -->
    <div>
        姓：<input type="text" v-model="person.firstName"><br/>
        名：<input type="text" v-model="person.lastName"><br/>
        全名：<span v-text="fullName"></span>
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
            s: "",
            person: {
                firstName: "张",
                lastName: "三"
            }
        },
        // 另一种data写法
        /*
        data(){
            return {}
        }
         */
        methods: {
            showInfo1(event) {
                // 输出 点我提示信息1
                console.log(event.target.innerText)
                // 输出 vm
                console.log(this)
                alert("同学你好")
            },
            showInfo2(event, number) {
                console.log(event, number)
                alert("同学你好")
            },
            showMsg(msg) {
                console.log(msg)
            },
            scrollDemo() {
                for (let i = 0; i < 100000; i++) {
                    console.log("#")
                }
                console.log("累坏了")
            },
            showInput(event) {
                console.log(event.target.value)
            }
        },
        computed: {
            fullName: {
                // get有什么作用？当有人读取fullName时，get就会被调用，且返回值就会作为fullName的值
                // get什么时候调用？ 1. 初次读取fullName时。 2. 所依赖的数据发生变化时。
                get() {
                    console.log("get被调用了")
                    // 此处的this是vm
                    return this.person.firstName + "-" + this.person.lastName
                },
                // set什么时候调用？ 当fullName被修改时
                set(value) {
                    console.log("set", value)
                    const arr = value.split('-')
                    this.firstName = arr[0]
                    this.lastName = arr[1]
                }
            },
            // 只需要getter方法则简写如下：
            // fullName(){ ... }
        }
    })
    // 另一种指定容器的方式
    // vm.$mount("#app")
</script>
</body>
</html>
```
