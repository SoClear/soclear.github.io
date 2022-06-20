# 接口

```typescript
interface myInterface {
    name: string

    // 不用写abstract
    sayHello(): void
}

// 接口可以重名
interface myInterface {
    age: number
}

class Dog implements myInterface {
    age: number
    name: string

    sayHello(): void {
        console.log("hello")
    }
}
```
