# 监视数据

```html
<template>
  <div>
    <!--
    1. vue会监砚data中所有层次的数据。

    2. 如何监测对象中的数据?
    通过setter实现监视,且要在new Vue时就传入要监测的数据。
    (1).对象中后追加的属性，Vue默认不做响应式处理
    (2).如需给后添加的属性做响应式，请使用如下API:
        Vue.set(target.propertyName/index,value）
        或vm.$set(target.propertyName/index,value)

    3。如何监测数组中的数据?
    通过包裹数组更新元素的方法实现,本质就是做了两件事:
    (1).调用原生对应的方法对数组进行更新。
    (2)重新解析模板,进而更新页面。

    4.在Vue2中修改数组中的某个元素一定要用如下方法:
        1.使用这些API:push()、pop()、shift()、unshift()、splice()、sort()、reverse()
        2.Vue.set()或vm.$set()

    特别注意:Vue.set()和 vm.$set() 不能给vm或 vm的根数据（vm._data）对象添加属性!!!
    -->
    <button @click="student.age++">年龄加一岁</button>
    <button @click="addSex">添加性别属性，默认值男</button>
    <button @click="student.sex = '未知'">修改性别</button>
    <button @click="addAFriend">在列表首位添加一个朋友</button>
    <button @click="updateFirstFriendName">修改第一个朋友的名字</button>
    <button @click="addHobby">添加一个爱好：学习</button>
    <button @click="updateHobby">将第一个爱好改为开车</button>
    <button @click="removeSmoke">过滤掉爱好中的抽烟</button>
    <h1>学生信息</h1>
    <h3>姓名：{{ student.name }}</h3>
    <h3>年龄：{{ student.age }}</h3>
    <h3 v-if="student.sex">性别：{{ student.sex }}</h3>
    <h3>爱好：</h3>
    <ul>
      <li v-for="(h,index) in student.hobby" :key="index">{{ h }}</li>
    </ul>
    <h3>朋友们：</h3>
    <ul>
      <li v-for="(f,index) in student.friends" :key="index">{{ f.name }}--{{ f.age }}</li>
    </ul>
  </div>
</template>

<script>

export default {
  name: "MyTest",
  data() {
    return {
      student: {
        name: 'tom',
        age: 18,
        hobby: ['抽烟', '喝酒', '烫头'],
        friends: [
          {name: 'jerry', age: 35},
          {name: 'tony', age: 36}
        ]
      }
    }
  },
  methods: {
    addSex() {
      // 注意在Vue3 中移除了$set
      // this.$set(this.student,"sex","男")
      // Vue3 直接写就行
      this.student.sex = '男'
    },
    addAFriend() {
      this.student.friends.unshift({name: 'jack', age: 70})
    },
    updateFirstFriendName() {
      this.student.friends[0].name = '张三'
    },
    addHobby() {
      this.student.hobby.push("学习")
    },
    updateHobby() {
      // Vue3直接改就行
      this.student.hobby[0] = '开车'
      // Vue2的实现方式
      // this.student.hobby.splice(0,1,'开车')
      // this.$set(this.student.hobby,0,'开车')
    },
    removeSmoke() {
      this.student.hobby = this.student.hobby.filter((h) => {
        return h !== '抽烟'
      })
    }
  },
  computed: {}
}
</script>
<style>
button {
  display: block;
  margin-bottom: 5px;
}
</style>
```