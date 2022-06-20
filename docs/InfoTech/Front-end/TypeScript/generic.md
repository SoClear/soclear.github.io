# 泛型

```typescript
// 单个泛型
function f1<T>(a: T): T {
    return a
}

// 多个泛型
function f2<T, K>(a: T, b: K): T {
    console.log(b)
    return a
}

// 自动推断泛型
f1(10)
// 指定泛型
f1<number>(9)

interface MyInterFace {
    length: number
}

// T extends MyInterFace 表示泛型T必须实现MyInterFace
function f3<T extends MyInterFace>(a: T): number {
    return a.length
}

// 类也可有泛型
class MyClass<T> {
    constructor(public name: T) {
    }
}

const mc = new MyClass<string>("孙悟空")
```
