# 协变逆变

看下面一段java代码

```java
Number num = new Integer(1);  
ArrayList<Number> list = new ArrayList<Integer>(); //type mismatch

List<? extends Number> list = new ArrayList<Number>();
list.add(new Integer(1)); //error
list.add(new Float(1.2f));  //error
```

有人会纳闷，为什么 `Number` 的对象可以由 `Integer` 实例化，而 `ArrayList<Number>` 的对象却不能由 `ArrayList<Integer>` 实例化？list中的 `<? extends Number>` 声明其元素是 `Number` 或 `Number` 的派生类，为什么不能 add Integer和Float?为了解决这些问题，我们需要了解Java中的逆变和协变以及泛型中通配符用法。

**1. 逆变与协变**  
在介绍逆变与协变之前，先引入Liskov替换原则（Liskov Substitution Principle, LSP）。

**Liskov替换原则**  
LSP由Barbara Liskov于1987年提出，其定义如下：

所有引用基类（父类）的地方必须能透明地使用其子类的对象。

LSP包含以下四层含义：

- 子类完全拥有父类的方法，且具体子类必须实现父类的抽象方法。
- 子类中可以增加自己的方法。
- 当子类覆盖或实现父类的方法时，方法的形参要比父类方法的更为宽松。
- 当子类覆盖或实现父类的方法时，方法的返回值要比父类更严格。  

前面的两层含义比较好理解，后面的两层含义会在下文中详细解释。根据LSP，我们在实例化对象的时候，可以用其子类进行实例化，比如：

```java
Number num = new Integer(1);
```

**定义**  
逆变与协变用来描述类型转换（type transformation）后的继承关系，其定义：如果A、B表示类型，f(⋅)表示类型转换，≤表示继承关系（比如，A≤B表示A是由B派生出来的子类）；

- f(⋅)是逆变（contravariant）的，当A≤B时有f(B)≤f(A)成立；  
- f(⋅)是协变（covariant）的，当A≤B时有f(A)≤f(B)成立；  
- f(⋅)是不变（invariant）的，当A≤B时上述两个式子均不成立，即f(A)与f(B)相互之间没有继承关系。  

_类型转换_  
接下来，我们看看Java中的常见类型转换的协变性、逆变性或不变性。

_泛型_  
令 `f(A)=ArrayList<A>` ，那么f(⋅)时逆变、协变还是不变的呢？如果是逆变，则   `ArrayList<Integer>` 是 `ArrayList<Number>` 的父类型；如果是协变，则 `ArrayList<Integer>` 是 `ArrayList<Number>` 的子类型；如果是不变，二者没有相互继承关系。开篇代码中用 `ArrayList<Integer>` 实例化list的对象错误，则说明泛型是不变的。

数组

令 `f(A)=[]A` ，容易证明数组是协变的：

```java
Number[] numbers = new Integer[3];
```

_方法_  
方法的形参是协变的、返回值是逆变的：

通过与网友iamzhoug37的讨论，更新如下。

调用方法 `result = method(n)` ；根据Liskov替换原则，传入形参n的类型应为method形参的子类型，即typeof(n)≤typeof(method's parameter)；result应为method返回值的基类型，即typeof(methods's return)≤typeof(result)：

例如

```java
static Number method(Number num) {
    return 1;
}
//加入Java开发交流君样：756584822一起吹水聊天
Object result = method(new Integer(2)); //correct
Number result = method(new Object()); //error
Integer result = method(new Integer(2)); //error
```

在Java 1.4中，子类覆盖（override）父类方法时，形参与返回值的类型必须与父类保持一致：

```java
class Super {
    Number method(Number n) { ... }
}

class Sub extends Super {
    @Override 
    Number method(Number n) { ... }
}
```

从Java 1.5开始，子类覆盖父类方法时允许协变返回更为具体的类型：

```java
class Super {
    Number method(Number n) { ... }
}

class Sub extends Super {
    @Override 
    Integer method(Number n) { ... }
}//加入Java开发交流君样：756584822一起吹水聊天
```

**2. 泛型中的通配符**  
实现泛型的协变与逆变  
Java中泛型是不变的，可有时需要实现逆变与协变，怎么办呢？这时，通配符 `?` 派上了用场：

```java
// <? extends>实现了泛型的协变，比如：
List<? extends Number> list = new ArrayList<Integer>();
// <? super>实现了泛型的逆变，比如：
List<? super Number> list = new ArrayList<Object>();
```

**extends与super**  
为什么（开篇代码中）`List<? extends Number> list` 在add Integer和Float会发生编译错误？首先，我们看看add的实现：

```java
public interface List<E> extends Collection<E> {
    boolean add(E e);
}
```

在调用add方法时，泛型E自动变成了 `<? extends Number>` ，其表示 `list` 所持有的类型为在 `Number` 与 `Number` 派生子类中的某一类型，其中包含 `Integer` 类型却又不特指为 `Integer` 类型（Integer像个备胎一样！！！），故add Integer时发生编译错误。为了能调用add方法，可以用 `super` 关键字实现：

```java
List<? super Number> list = new ArrayList<Object>();
list.add(new Integer(1));
list.add(new Float(1.2f));
```

表示list所持有的类型为在 `Number` 与 `Number` 的基类中的某一类型，其中 `Integer` 与 `Float` 必定为这某一类型的子类；所以add方法能被正确调用。从上面的例子可以看出，`extends` 确定了泛型的上界，而 `super` 确定了泛型的下界。

## PECS

现在问题来了：究竟什么时候用extends什么时候用super呢？《Effective Java》给出了答案：

PECS: producer-extends, consumer-supe

比如，一个简单的Stack API：

```java
public class  Stack<E>{
    public Stack();
    public void push(E e):
    public E pop();
    public boolean isEmpty();
}//加入Java开发交流君样：756584822一起吹水聊天
```

要实现pushAll(Iterable<E> src)方法，将src的元素逐一入栈：

```java
public void pushAll(Iterable<E> src){
    for(E e : src)
        push(e)
}
```

假设有一个实例化 `Stack<Number>` 的对象 `stack` ，src有 `Iterable<Integer>` 与 `Iterable<Float>`；在调用 `pushAll` 方法时会发生type mismatch错误，因为Java中泛型是不可变的，`Iterable<Integer>` 与 `Iterable<Float>` 都不是 `Iterable<Number>` 的子类型。因此，应改为

```java
// Wildcard type for parameter that serves as an E producer
public void pushAll(Iterable<? extends E> src) {
    for (E e : src)
        push(e);
}//加入Java开发交流君样：756584822一起吹水聊天
```

要实现 `popAll(Collection<E> dst)` 方法，将Stack中的元素依次取出add到dst中，如果不用通配符实现：

```java
// popAll method without wildcard type - deficient!
public void popAll(Collection<E> dst) {
    while (!isEmpty())
        dst.add(pop());   
}//加入Java开发交流君样：756584822一起吹水聊天
```

同样地，假设有一个实例化 `Stack<Number>` 的对象 `stack` ，`dst` 为 `Collection<Object>` ；调用popAll方法是会发生type mismatch错误，因为`Collection<Object>` 不是 `Collection<Number>` 的子类型。因而，应改为：

```java
// Wildcard type for parameter that serves as an E consumer
public void popAll(Collection<? super E> dst) {
    while (!isEmpty())
        dst.add(pop());
}//加入Java开发交流君样：756584822一起吹水聊天
```

在上述例子中，在调用pushAll方法时生产了E 实例（produces E instances），在调用popAll方法时dst消费了E 实例（consumes E instances）。Naftalin与Wadler将PECS称为Get and Put Principle。

java.util.Collections的copy方法(JDK1.7)完美地诠释了PECS：

```java
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    int srcSize = src.size();
    if (srcSize > dest.size())
        throw new IndexOutOfBoundsException("Source does not fit in dest");

    if (srcSize < COPY_THRESHOLD ||
        (src instanceof RandomAccess && dest instanceof RandomAccess)) {
        for (int i=0; i<srcSize; i++)
            dest.set(i, src.get(i));
    } else {
        ListIterator<? super T> di=dest.listIterator();
        ListIterator<? extends T> si=src.listIterator();
        for (int i=0; i<srcSize; i++) {
            di.next();
            di.set(si.next());
        }
    }
}//加入Java开发交流君样：756584822一起吹水聊天
```

PECS总结：

要从泛型类取数据时，用 `extends` ；  
要往泛型类写数据时，用 `super` ；  
既要取又要写，就不用通配符（即 `extends` 与 `super` 都不用）。

## kotlin

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
