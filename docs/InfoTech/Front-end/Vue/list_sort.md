# 列表排序

```html
<template>
  <div>
    <h2>人员列表</h2>
    <input type="text" placeholder="请输入人员名字" v-model="keyword">
    <button @click="sortType = 2">年龄升序</button>
    <button @click="sortType = 1">年龄降序</button>
    <button @click="sortType = 0">年龄原序</button>
    <ul>
      <li v-for="(p,index) of filPersons" :key="index">
        {{p.name}}-{{p.age}}-{{p.sex}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "MyTest",
  data() {
    return {
      keyword:"",
      // 排序：0原序，1降序，2升序
      sortType:0,
      persons: [
        {id: "001", name: "马冬梅", age: 19, sex: "女"},
        {id: "002", name: "周冬雨", age: 20, sex: "女"},
        {id: "003", name: "周杰伦", age: 21, sex: "男"},
        {id: "004", name: "温兆伦", age: 22, sex: "男"},
      ]
    }
  },
  computed :{
    filPersons(){
      const arr = this.persons.filter((p) => {
        return p.name.includes(this.keyword)
      })
      if (this.sortType){
        arr.sort((a,b)=>{
          return this.sortType === 1 ? b.age-a.age : a.age-b.age
        })
      }
      return arr
    }
  }
}
</script>
```
