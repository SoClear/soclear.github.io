# 类、属性和方法

```typescript
// 使用class定义类，类有属性和方法
// 以static开头的属性或方法是静态是属性或方法，通过类名直接调用，不加括号
// readonly表示只读
// 访问修饰符 public protected private同C++ 、java、kotlin或C#
class Person {
    readonly name: string = "孙悟空"
    static readonly age: number = 18

    sayHello() {
        console.log("hello everyone")
    }

    static sayBye() {
        console.log("bye")
    }
}

// 在构造参数前加访问修饰符，表示将其作为属性，类似Kotlin
class Person2 {
    constructor(public name: string, public age: number) {
    }
}

console.log(Person.age)

const person = new Person()
console.log(person.name)
person.sayHello()

Person.sayBye()
```
