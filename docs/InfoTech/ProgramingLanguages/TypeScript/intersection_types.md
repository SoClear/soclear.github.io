# 交叉类型

交叉类型(&)

功能类似于接口继承（extends)，用于组合多个类型为一个类型（常用于对象类型）。

比如

```typescript
interface Person { name: string }
interface Contact { phone: string }
type PersonDetail = Person & Contact
let obj: PersonDetail = {
    name: 'jack ',
    phone: '133.. .'
}
```

解释:

使用交叉类型后，新的类型 `PersonDetail` 就同时具备了 `Person` 和 `Contact` 的所有属性类型。相当于：
`type PersonDetail = { name: string; phone: string }`

## 交叉类型（&）和接口继承（ extends）的对比

* 相同点: 都可以实现对象类型的组合。
* 不同点: 两种方式实现类型组合时，对于同名属性之间，处理类型冲突的方式不同。

```typescript
interface A {
    fn: (value: number) => string
}
// 接口继承，下行会报错
interface B extends A {
    fn: (value: string) => string
}
```

```typescript
interface A {
    fn: (value: number) => string
}
interface B {
    fn: (value: string) => string
}
// 交叉类型
type C = A & B
```

说明:

以上代码，接口继承会报错（类型不兼容)﹔

交叉类型没有错误，可以简单的理解为: `fn: (value: string | number) => string`
实际的交叉类型为 `((value: number) => string) & ((value: string) => string)`
