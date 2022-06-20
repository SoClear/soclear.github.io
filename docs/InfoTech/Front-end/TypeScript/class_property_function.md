# 类、属性和方法

```typescript
// 使用class定义类，类有属性和方法
// 以static开头的属性或方法是静态是属性或方法，通过类名直接调用，不加括号
// readonly表示只读
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

console.log(Person.age)

const person = new Person()
console.log(person.name)
person.sayHello()

Person.sayBye()
```