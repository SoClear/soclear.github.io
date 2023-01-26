# 类型兼容性

两种类型系统: **1 StructuralType System(结构化类型系统）** 和 **2 Nominal Type System(标明类型系统)**

TS采用的是结构化类型系统，也叫做ducktyping(鸭子类型)，类型检查关注的是值所具有的形状。
也就是说，在结构类型系统中，如果两个对象具有相同的形状，则认为它们属于同一类型。

```typescript
class Point { x: number; y: number }
class Point2D { x:number; y: number }
const p: Point = new Point2D()
```

解释:

1. Point和Point2D是两个名称不同的类。
2. 变量p的类型被显示标注为Point类型，但是，它的值却是Point2D的实例，并且没有类型错误。
3. 因为TS是结构化类型系统，只检查Point和Point2D的结构是否相同（相同，都具有x和y两个属性，属性类型也相同)。
4. 但是，如果在Nominal Type System 中(比如，C#、Java等），它们是不同的类，类型无法兼容。

## 对象类型兼容性

注意: 在结构化类型系统中，如果两个对象具有相同的形状，则认为它们属于同类型，这种说法并不准确。

更准确的说法:对于对象类型来说，y的成员至少与x相同，则x兼容y(成员多的可以赋值给少的)。

```typescript
class Point { x: number; y: number }
class Point3D { x: number; y: number; z: number }
const p: Point = new Point3D();
```

解释:

1. Point3D的成员至少与Point相同，则Point兼容Point3D。
2. 所以，成员多的Point3D可以赋值给成员少的Point。

## 接口类型兼容性

除了class 之外，TS中的其他类型也存在相互兼容的情况，包括: **接口兼容性** 和 **函数兼容性** 等。

接口之间的兼容性，类似于class。并且class和interface之间也可以兼容。

```typescript
interface Point { x: number; y: number }
interface Point2D { x: number; y: number }
let p1: Point
let p2: Point2D = p1
interface Point3D { x: number; y: number; z: number }
let p3: Point3D
p2 = p3
class Point3D { x: number; y: number; z: number }
let p3: Point2D = new Point3D()
```

## 函数类型兼容性

函数之间兼容性比较复杂，需要考虑： **参数个数** 、 **参数类型** 、 **返回值类型** 。

### 1. 参数个数，参数多的兼容参数少的（或者说，参数少的可以赋值给多的）

```typescript
type F1 = (a: number) => void
type F2 = (a: number, b: number) => void

let f1: F1
let f2: F2 = f1
```

```typescript
const arr = ['a', 'b', 'c']
arr.forEach((item) => {
})
```

解释:

1. 参数少的可以赋值给参数多的，所以，f1可以赋值给f2。
2. 数组forEach方法的第一个参数是回调函数，该示例中类型为：
`(value: string, index: number, array: string) => void`
3. 在JS中省略用不到的函数参数实际上是很常见的，这样的使用方式，促成了TS中函数类型之间的兼容性。
4. 并且因为回调函数是有类型的，所以，TS会自动推导出参数 item、index、array 的类型。

### 2.参数类型，相同位置的参数类型要相同（原始类型）或兼容（对象类型)

#### 原始类型

```typescript
type F1 = (a: number) =>string
type F2 = (a: number) =>string
let f1:F1
let f2: F2 =f1
```

解释:函数类型F2兼容函数类型F1，因为F1和F2的第一个参数类型相同。

#### 对象类型

```typescript
interface Point2D { x: number; y: number }
interface Point3D { x: number; y: number; z: number }
type F2 =(p: Point2D) =>void
type F3 =(p: Point3D) =>void
let f2: F2
let f3: F3 = f2
// 下行报错
f2 = f3
```

解释:

1. 注意，此处与前面讲到的接口兼容性冲突。
2. 技巧:将对象拆开，把每个属性看做一个个参数，则，参数少的(f2)可以赋值给参数多的(f3)。

### 3. 返回值类型，只关注返回值类型本身即可

```typescript
type F5 =() => string
type F6 =() => string
let f5: F5
let f6: F6 = f5
```

```typescript
type F7 = () => { name: string }
type F8 = () => { name: string; age: number }
let f7: F7
let f8: F8
f7 = f8
```

解释:

1. 如果返回值类型是原始类型，此时两个类型要相同，比如，左侧类型F5和F6。
2. 如果返回值类型是对象类型，此时成员多的可以赋值给成员少的，比如，右侧类型F7和F8。
