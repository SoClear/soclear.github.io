# Object.defineProperty

```javascript
let number = 18

const person = {
    name: "张三",
    sex: "男"
}

// 为对象添加属性
// 参数：对象，属性名，配置属性的对象
Object.defineProperty(person, "age", {
    // 属性的值
    value: 18,
    // 是否可被枚举，默认为false
    enumerable: true,
    // 是否可被修改，默认为false
    writable: true,
    // 是否可被删除，默认为false
    configurable: true,
    // getter方法
    get() {
        console.log("有人读取age属性")
        return number
    },
    // setter方法
    set(value) {
        console.log(`有人修改age属性，值是${value}`)
        number = value
    }
})
```
