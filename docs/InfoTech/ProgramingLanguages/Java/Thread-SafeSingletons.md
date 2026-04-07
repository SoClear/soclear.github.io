# 线程安全的单例模式

在Java中，实现线程安全的单例模式（Singleton Pattern）有多种方式。不同的方式在**线程安全性**、**性能**和**延迟加载（Lazy Loading）**方面各有侧重。

以下是Java中实现线程安全单例的4种主流且推荐的方法，按推荐程度和应用场景从前往后介绍：

## 1. 双重检查锁（Double-Checked Locking, DCL）- 推荐

这是面试中最常被问到的方式。它既实现了延迟加载，又保证了线程安全，且性能较高。

```java
public class Singleton {
    // 必须使用 volatile 关键字
    private static volatile Singleton instance;

    // 1. 私有化构造方法
    private Singleton() {}

    // 2. 提供全局访问点
    public static Singleton getInstance() {
        if (instance == null) { // 第一次检查，避免不必要的同步
            synchronized (Singleton.class) { // 同步锁
                if (instance == null) { // 第二次检查，保证线程安全
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

* **为什么需要两次 `if (instance == null)`？**
  * 外层判断：是为了在单例已经创建的情况下，直接返回实例，避免每次调用都进入 `synchronized` 同步块，从而提高性能。
  * 内层判断：是为了防止多个线程同时通过了外层判断，排队进入同步块时重复创建实例。
* **为什么必须加 `volatile`？**
  `instance = new Singleton();` 这句代码在JVM中不是原子操作，它分为三步：
  1. 分配对象的内存空间。
  2. 初始化对象。
  3. 将 `instance` 变量指向分配的内存空间。
  
  在某些编译器下，由于**指令重排**，步骤可能会变成 1 -> 3 -> 2。如果线程A执行了 1 和 3，此时 `instance` 已经不为 `null`，但对象还未初始化。如果此时线程B调用 `getInstance()`，会直接拿到一个半成品对象并报错。**加 `volatile` 可以禁止指令重排，保证这三步按序执行。**

## 2. 静态内部类（Static Inner Class）- 极力推荐

这种方式利用了JVM类加载机制来保证线程安全，代码非常优雅，既没有加锁的性能消耗，又实现了延迟加载。

```java
public class Singleton {
    // 1. 私有化构造方法
    private Singleton() {}

    // 2. 定义静态内部类
    private static class SingletonHolder {
        // 在内部类中实例化单例
        private static final Singleton INSTANCE = new Singleton();
    }

    // 3. 提供全局访问点
    public static Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

* **原理解析：**
  当外部类 `Singleton` 被加载时，并不会立即加载内部类 `SingletonHolder`。只有当调用 `getInstance()` 方法时，才会触发 `SingletonHolder` 的类加载。JVM底层保证了类的静态属性初始化时是线程安全的（通过类初始化锁），所以这里无需使用 `synchronized`。

## 3. 枚举（Enum）- 最安全/《Effective Java》推荐

《Effective Java》作者 Joshua Bloch 极力推荐的方法。它不仅天生线程安全，还能防止反射和反序列化破坏单例。

```java
public enum Singleton {
    INSTANCE; // 唯一的枚举实例

    // 可以定义单例类的方法
    public void doSomething() {
        System.out.println("Doing something...");
    }
}

// 调用方式：Singleton.INSTANCE.doSomething();
```

* **原理解析：**
  枚举的实例创建是由JVM在类加载时静态初始化的，天生保证线程安全。
* **最大优势：**
  前面提到的 DCL 和 静态内部类，理论上都可以通过**反射（Reflection）**强制调用私有构造器，或者通过**反序列化（Deserialization）**重新生成新对象来破坏单例。而 Java 规范底层从根本上限制了枚举无法被反射创建，且自带安全的序列化机制。

## 4. 饿汉式（Eager Initialization）- 最简单

如果这个单例对象在程序启动时就一定要使用，且占用内存不大，可以直接使用饿汉式。

```java
public class Singleton {
    // 类加载时就立即初始化并创建单例对象
    private static final Singleton instance = new Singleton();

    // 1. 私有化构造方法
    private Singleton() {}

    // 2. 提供全局访问点
    public static Singleton getInstance() {
        return instance;
    }
}
```

* **原理解析：**
  依赖JVM的类加载机制保证了实例创建时的线程安全。
* **缺点：**
  没有实现延迟加载（Lazy Loading）。即使程序从头到尾都没用到这个单例，它也会在类加载时被创建，可能会浪费内存。

## 总结：日常开发该怎么选？

1. **单例对象占用资源少，不需要延迟加载：** 直接选 **饿汉式**。
2. **对性能有要求，且需要延迟加载：** 选 **静态内部类** 或 **双重检查锁（DCL）**。
3. **涉及序列化/反序列化，或者想要最严密的安全性：** 选 **枚举（Enum）**。
