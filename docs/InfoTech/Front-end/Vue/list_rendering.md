# 列表渲染

```html
<template>
  <div>
    <!--  列表渲染
        v-for指令用于展示列表数据
        语法：v-for="(item,index) in xxx" :key="yyy"
        可以遍历对象，数组，字符串，（用的很少）、指定次数（用的很少）
    -->
    <!--  遍历数组  -->
    <h2>人员列表</h2>
    <ul>
      <li v-for="(person,index) in persons" :key="index">{{ person.name }}--{{ person.age }}</li>
    </ul>

    <!--  遍历对象  -->
    <h2>汽车信息</h2>
    <ul>
      <li v-for="(value,key,index) in car" :key="index">{{ value }}--{{ key }}--{{ index }}</li>
    </ul>

    <!--  遍历字符串  -->
    <h2>遍历字符串</h2>
    <ul>
      <li v-for="(char,index) in str" :key="index">{{ char }}--{{ index }}</li>
    </ul>

    <!--  指定次数  -->
    <h2>指定次数</h2>
    <ul>
      <li v-for="(number,index) in 5" :key="index">{{ number }}--{{ index }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "MyTest",

  data() {
    return {
      persons: [
        {id: 1, name: "张三", age: 18},
        {id: 2, name: "李四", age: 19},
        {id: 3, name: "王五", age: 17},
      ],
      car: {
        name: "奥迪A8",
        price: "70万",
        color: "黑色"
      },
      str: "hello"
    }
  }
}
</script>
<style scoped>

</style>
```
