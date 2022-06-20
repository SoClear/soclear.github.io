# 继承和super关键字

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

class Dog extends Animal {
    weight: number

    constructor(name: string, age: number, weight: number) {
        // 调用父类构造方法
        super(name, age)
        this.weight = weight
    }


    run() {
        console.log(`${this.name}在跑`)
    }

    // 重写父类方法
    sayHello() {
        // 通过super关键字调用父类方法
        super.sayHello()
        console.log(`${this.name}:汪汪汪`)
    }
}
```
