# 可选参数

```typescript
// 可选参数只能出现在参数列表的最后，也就是说可选参数后不能出现必选参数
function f(a: number, b?: number) {
    console.log(a)
    console.log(b)
}

// 1 undefined
f(1)
// 1 2
f(1, 2)
```
