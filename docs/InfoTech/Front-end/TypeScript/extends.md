# 继承

```typescript
class Animal {
    name: string
    age: number

    constructor(name: string, age: number) {
        this.name = name
        this.age = age
    }

    sayHello() {
        console.log(this.name + "：hello")
    }
}

// 继承关键字是 extends
class Dog extends Animal {
    run() {
        console.log(`${this.name}在跑`)
    }
    // 重写父类方法
    sayHello() {
        console.log(`${this.name}:汪汪汪`)
    }
}
```
