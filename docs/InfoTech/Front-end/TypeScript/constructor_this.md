# 构造函数和this

```typescript
class Dog {
    name: string
    age: number

    // constructor是构造函数，在创建对象时调用
    constructor(name: string, age: number) {
        // 在实例方法中，this方法表示当前实例
        // 在构造函数中当前对象就是当前新建的那个对象
        this.name = name
        this.age = age
    }

    bark(){
        // 在方法中 this表示当前调用方法的对象
        console.log(this.name + "：汪汪汪")
    }
}
const dog = new Dog('小黑',4)
dog.bark()
```
