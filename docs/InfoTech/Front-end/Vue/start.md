# 初识Vue

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
    <h1>Hello,{{ name }}</h1>
</div>
<script>
    // 关闭生产提示
    Vue.productionTip = false
    // Vue实例与容器一一对应，真实开发中只有一个实例且配合组件使用
    // 表达式有值，语句无值
    new Vue({
        // el 指定容器，通常为CSS选择器
        el: "#app",
        // data 存储数据
        data: {
            // data 中的数据更新，页面中用到该值的地方也会自动更新
            name: "张三"
        }
    })
</script>
</body>
</html>
```
