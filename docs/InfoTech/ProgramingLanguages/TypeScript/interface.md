# 接口

```typescript
interface MyInterface {
    name: string

    // 不用写abstract
    sayHello(): void
}

// 接口可以重名
interface MyInterface {
    age: number
}

class Dog implements MyInterface {
    age: number
    name: string

    sayHello(): void {
        console.log("hello")
    }
}
```
