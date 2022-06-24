# 可选参数、可选属性

```typescript
// 可选参数只能出现在参数列表的最后，也就是说可选参数后不能出现必选参数
function f(a: number, b?: number) {
    console.log(a)
    console.log(b)
}

// 1 undefined
f(1)
// 1 2
f(1, 2)

// person是一个对象，冒号后等号前是他的类型，等号后对象实例
// age是可选属性
let person: { name: string, age?: number, sayHi(name: string): void } = {
    // 可以没有age属性
    name: "",
    sayHi(name): void {
        console.log(`Hi ${name}`)
    }
}


let person1: { name: string, age: number, sayHi: (name: string) => void } = {
    // 必须有age属性
    age: 0,
    name: "",
    sayHi: (name) => {
        console.log(`Hi ${name}`)
    }
}

```
