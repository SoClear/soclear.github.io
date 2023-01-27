# 抽象类

```typescript
abstract class Animal {
    name: string
    age: number

    constructor(name: string, age: number) {
        this.name = name
        this.age = age
    }

    // 抽象方法用abstract关键字，没有方法体，子类必须实现
    abstract sayHello(): void
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

    // 实现抽象方法
    sayHello() {
        // 通过super关键字调用父类方法
        console.log(`${this.name}:汪汪汪`)
    }
}
```
