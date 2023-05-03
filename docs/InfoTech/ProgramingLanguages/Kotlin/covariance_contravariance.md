# 协变逆变

你好，这是必应。我可以尝试用简单易懂的方式讲一下kotlin的协变和逆变。😊

协变和逆变是描述泛型类型之间的继承关系的概念。在kotlin中，我们可以使用out和in关键字来声明泛型类型的协变和逆变。

- 协变 (covariance) 表示子类型可以使用比父类型更具体的类型。例如，`List<out Animal>` 表示这个列表可以是 `List<Animal>` 或者 `List<Dog>` ，其中 `Dog` 是 `Animal` 的子类。协变的泛型类型只能用作输出，不能用作输入，因为如果允许输入，可能会破坏类型安全。例如，如果我们可以向 `List<out Animal>` 中添加一个 `Cat` ，那么如果这个列表实际上是一个 `List<Dog>` ，就会出现问题。
- 逆变 (contravariance) 表示子类型可以使用比父类型更宽泛的类型。例如，`Comparator<in String>` 表示这个比较器可以是 `Comparator<String>` 或者 `Comparator<Any>` ，其中 `Any` 是 `String` 的父类。逆变的泛型类型只能用作输入，不能用作输出，因为如果允许输出，可能会得到一个不确定的类型。例如，如果我们可以从 `Comparator<in String>` 中获取一个元素，那么如果这个比较器实际上是一个 `Comparator<Any>` ，我们就不知道这个元素是什么类型。

协变和逆变的目的是为了增加泛型类型的灵活性和兼容性，让我们可以在不同的场合使用不同的子类型或父类型，而不破坏类型安全和逻辑正确性。

源: 与必应的对话， 2023/5/3  
(1) 秒懂Kotlin之协变(Covariance)逆变(Contravariance)与抗变(Invariant). <https://blog.csdn.net/ShuSheng0007/article/details/108708218>.  
(2) 深入理解Kotlin中的泛型（协变、逆变）。 - 稀土掘金. <https://juejin.cn/post/6847902219140857870>.  
(3) Kotlin 泛型协变与逆变的理解 - 简书. <https://www.jianshu.com/p/4fbbc68ef998>.  
(4) Kotlin协变和逆变_kotlin xiebian_张雨东的博客-CSDN博客. <https://blog.csdn.net/qq_26500807/article/details/129197121>.  
(5) Kotlin学习系列之：协变和逆变 - CSDN博客. <https://blog.csdn.net/xlh1191860939/article/details/107482937>.

好的，我可以尝试帮你生成一段使用协变和逆变的kotlin代码。😊

假设我们有如下的类和接口：

```kotlin
// 一个抽象的动物类
abstract class Animal {
    abstract fun makeSound()
}

// 一个具体的狗类，继承自动物类
class Dog : Animal() {
    override fun makeSound() {
        println("Woof!")
    }
}

// 一个具体的猫类，继承自动物类
class Cat : Animal() {
    override fun makeSound() {
        println("Meow!")
    }
}

// 一个动物园接口，定义了添加和获取动物的方法
interface Zoo<T> {
    fun addAnimal(animal: T)
    fun getAnimal(): T
}
```

如果我们想让Zoo接口支持协变，我们可以在泛型参数前加上out关键字，表示 `Zoo<T>` 是 `Zoo<Animal>` 的子类型，只要 `T` 是 `Animal` 的子类型。这样我们就可以用 `Zoo<Dog>` 或 `Zoo<Cat>` 来替换 `Zoo<Animal>` ，例如：

```kotlin
// 声明一个协变的动物园接口
interface Zoo<out T : Animal> {
    // fun addAnimal(animal: T) // 这个方法不能用，因为T只能用作输出，不能用作输入
    fun getAnimal(): T // 这个方法可以用，因为T只用作输出
}

// 实现一个狗园类，继承自协变的动物园接口
class DogZoo : Zoo<Dog> {
    private val dogs = mutableListOf<Dog>()

    // override fun addAnimal(animal: Dog) // 这个方法不能用，因为父接口没有定义这个方法
    override fun getAnimal(): Dog { // 这个方法可以用，因为父接口定义了这个方法
        return dogs.removeAt(0)
    }

    // 定义一个自己的方法，用于添加狗
    fun addDog(dog: Dog) {
        dogs.add(dog)
    }
}

// 实现一个猫园类，继承自协变的动物园接口
class CatZoo : Zoo<Cat> {
    private val cats = mutableListOf<Cat>()

    // override fun addAnimal(animal: Cat) // 这个方法不能用，因为父接口没有定义这个方法
    override fun getAnimal(): Cat { // 这个方法可以用，因为父接口定义了这个方法
        return cats.removeAt(0)
    }

    // 定义一个自己的方法，用于添加猫
    fun addCat(cat: Cat) {
        cats.add(cat)
    }
}

// 定义一个函数，接受一个协变的动物园参数，并从中获取一个动物并让它发出声音
fun playWithAnimal(zoo: Zoo<Animal>) {
    val animal = zoo.getAnimal()
    animal.makeSound()
}

fun main() {
    // 创建一个狗园对象
    val dogZoo = DogZoo()
    // 添加一些狗到狗园中
    dogZoo.addDog(Dog())
    dogZoo.addDog(Dog())
    dogZoo.addDog(Dog())
    
    // 创建一个猫园对象
    val catZoo = CatZoo()
    // 添加一些猫到猫园中
    catZoo.addCat(Cat())
    catZoo.addCat(Cat())
    
    // 调用playWithAnimal函数，并传入狗园或猫园对象，这是合法的，因为Zoo<Dog>和Zoo<Cat>都是Zoo<Animal>的子类型
    playWithAnimal(dogZoo) // 输出 Woof!
    playWithAnimal(catZoo) // 输出 Meow!
}
```

如果我们想让Zoo接口支持逆变，我们可以在泛型参数前加上 `in`

好的，我继续帮你生成一段使用逆变的kotlin代码。😊

假设我们有如下的类和接口：

```kotlin
// 一个抽象的动物类
abstract class Animal {
    abstract fun makeSound()
}

// 一个具体的狗类，继承自动物类
class Dog : Animal() {
    override fun makeSound() {
        println("Woof!")
    }
}

// 一个具体的猫类，继承自动物类
class Cat : Animal() {
    override fun makeSound() {
        println("Meow!")
    }
}

// 一个动物收容所接口，定义了添加和获取动物的方法
interface Shelter<T> {
    fun addAnimal(animal: T)
    fun getAnimal(): T
}
```

如果我们想让 `Shelter` 接口支持逆变，我们可以在泛型参数前加上 `in` 关键字，表示 `Shelter<T>` 是 `Shelter<Animal>` 的子类型，只要 `T` 是 `Animal` 的父类型。这样我们就可以用 `Shelter<Animal>` 来替换 `Shelter<Dog>` 或 `Shelter<Cat>` ，例如：

```kotlin
// 声明一个逆变的动物收容所接口
interface Shelter<in T : Animal> {
    fun addAnimal(animal: T) // 这个方法可以用，因为T只用作输入
    // fun getAnimal(): T // 这个方法不能用，因为T只能用作输入，不能用作输出
}

// 实现一个狗收容所类，继承自逆变的动物收容所接口
class DogShelter : Shelter<Dog> {
    private val dogs = mutableListOf<Dog>()

    override fun addAnimal(animal: Dog) { // 这个方法可以用，因为父接口定义了这个方法
        dogs.add(animal)
    }

    // override fun getAnimal(): Dog // 这个方法不能用，因为父接口没有定义这个方法

    // 定义一个自己的方法，用于获取狗
    fun getDog(): Dog {
        return dogs.removeAt(0)
    }
}

// 实现一个猫收容所类，继承自逆变的动物收容所接口
class CatShelter : Shelter<Cat> {
    private val cats = mutableListOf<Cat>()

    override fun addAnimal(animal: Cat) { // 这个方法可以用，因为父接口定义了这个方法
        cats.add(animal)
    }

    // override fun getAnimal(): Cat // 这个方法不能用，因为父接口没有定义这个方法

    // 定义一个自己的方法，用于获取猫
    fun getCat(): Cat {
        return cats.removeAt(0)
    }
}

// 定义一个函数，接受一个逆变的动物收容所参数，并向其中添加一个动物
fun putAnimalInShelter(shelter: Shelter<Animal>, animal: Animal) {
    shelter.addAnimal(animal)
}

fun main() {
    // 创建一个狗收容所对象
    val dogShelter = DogShelter()
    
    // 创建一个猫收容所对象
    val catShelter = CatShelter()
    
    // 调用putAnimalInShelter函数，并传入狗收容所或猫收容所对象，这是合法的，因为Shelter<Dog>和Shelter<Cat>都是Shelter<Animal>的子类型
    putAnimalInShelter(dogShelter, Dog()) // 向狗收容所添加一只狗
    putAnimalInShelter(catShelter, Cat()) // 向猫收容所添加一只猫
    
    // 从各自的收容所中获取动物并让它们发出声音
    dogShelter.getDog().makeSound() // 输出 Woof!
    catShelter.getCat().makeSound() // 输出 Meow!
}
```
