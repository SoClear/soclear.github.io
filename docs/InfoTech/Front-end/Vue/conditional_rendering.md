# 条件渲染

```html
<template>
  <div>
    <!--  条件渲染
        1. v-if
            写法：
            （1）v-if="表达式"
            （2）v-else-if="表达式"
            （3）v-else="表达式"
            适用于：切换频率较低的场景。
            特点：不展示的DOM元素直接被移除。
            注意：v-if 可以和 v-else-if , v-else 一起使用，但要求结构不能被打断。

        2. v-show
            写法：v-show="表达式"
            适用于：切换频率较高的场景。
            特点：不展示的DOM元素未被移除，仅仅使用样式隐藏掉。

        3. 备注： 使用v-if时，可能无法获取到元素，而使用v-show一定可以获取到。
    -->
    <div v-show="true">v-show</div>
    <button @click="plus">n++</button>
    <div v-if="n%3===0">你好啊</div>
    <div v-if="n%3===1">hello</div>
    <div v-if="n%3===2">world</div>

    <!--  使用template 配合v-if可以控制多个标签 ,但是不能用v-show -->
    <template v-if="n%2===1">
      <p>张三</p>
      <p>李四</p>
      <p>王五</p>
    </template>
  </div>
</template>

<script>
export default {
  name: "MyTest",
  data() {
    return {
      n: 0
    }
  },
  methods: {
    plus() {
      this.n++
    }
  }
}
</script>
  
<style scoped>

</style>
```
