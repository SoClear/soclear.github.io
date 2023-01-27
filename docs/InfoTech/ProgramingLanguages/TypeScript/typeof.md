# typeof

众所周知，`js`中提供了`typeof`操作符，用于获取数据类型。

```javascript
// 打印string
console.log(typeof "Hello world")
```

实际上，TS也提供了typeof操作符，可以在类型上下文中引用变量或属性的类型（类型查询）。

使用场景：根据已有变量的值，获取该值的类型，来简化类型书写。

```typescript
let p ={x:1,y:2}

function formatPoint(point: { x: number, y: number }) {

}

function formatPoint2(point: typeof p) {

}
```

解释：

- 使用typeof操作符来获取变量p的类型，结果与第一种（对象的字面量形式的类型）相同。
- typeof出现在类型注解的位置（参数名称的冒号后面）所处的环境就在类型上下文（区别于JS代码）。
- 注意：typeof只能用来查询变量或属性的类型，无法查询其他类型（例如函数的调用类型）。
