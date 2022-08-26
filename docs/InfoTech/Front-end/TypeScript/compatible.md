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
interface Point3D { x: number; y: number; z: number }let p3: Point3D
p2 = p3
class Point3D { x: number; y: number; z: number }
let p3: Point2D = new Point3D()
```
