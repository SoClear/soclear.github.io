# 映射类型

映射类型:基于旧类型创建新类型（对象类型)，减少重复、提升开发效率。

比如，类型 `PropKeys` 有 `x/y/z`  ，另一个类型 `Type1` 中也有 `x/y/z` ，并且`Type1` 中 `x/y/z` 的类型相同:

```typescript
type PropKeys = 'x' | 'y' | 'z'
type Type1 = { x: number; y: number; z: number }
```

这样书写没错，但 `x/y/z` 重复书写了两次。  
像这种情况，就可以使用映射类型来进行简化。

```typescript
type PropKeys = 'x' | 'y' | 'z'
type Type2 = { [Key in PropKeys]: number }
```

解释:

- 映射类型是基于索引签名类型的，所以，该语法类似于索引签名类型，也使用了 `[]` 。
- `Key in PropKeys` 表示 `Key` 可以是 `PropKeys` 联合类型中的任意一个，类似于`forin(let k in obj)` 。
- 使用映射类型创建的新对象类型 `Type2` 和类型 `Type1` 结构完全相同。
- 注意:映射类型只能在类型别名中使用，不能在接口中使用。

映射类型除了根据联合类型创建新类型外，还可以根据对象类型来创建:

```typescript
type Props = { a: number; b: string; c: boolean }
type Type3 = { [key in keyof Props]: number }
```

IDE 会提示

```typescript
type Type3 = { a: number; b: number; c:number }
```

解释：

1. 首先，先执行 `keyof Props` 获取到对象类型 `Props` 中所有键的联合类型即 `'a' | 'b' |'c'` 。
2. 然后，`Key in ...` 就表示 `Key` 可以是 `Props` 中所有的键名称中的任意一个。
