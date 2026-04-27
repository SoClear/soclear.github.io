# SPI

## 什么是 Java SPI？

SPI（Service Provider Interface）是 Java 提供的一套用来被第三方实现或者扩展的 API，它可以用来启用框架扩展和替换组件。
SPI 的核心思想是**解耦**，通过在 `META-INF/services` 目录下配置接口的实现类全限定名，`java.util.ServiceLoader` 会在运行时动态加载这些实现类。
JDBC 驱动加载、SLF4J 日志门面等都广泛使用了这个机制。

## 项目结构

在项目中创建以下文件结构：

```text
src/main/
├── java/spi/
│   ├── MessageServiceProvider.java    # 服务接口
│   ├── EmailServiceProvider.java      # 实现类 1（邮件服务）
│   ├── SmsServiceProvider.java        # 实现类 2（短信服务）
│   └── SpiDemo.java                   # 测试主类
└── resources/META-INF/services/
    └── spi.MessageServiceProvider     # SPI 注册配置文件
```

## 代码详解

### 1. 定义服务接口

`MessageServiceProvider.java`定义一个规范接口，供第三方去实现。

```java
package spi;

public interface MessageServiceProvider {
    void sendMessage(String message);
}
```

### 2. 提供具体实现类

`EmailServiceProvider.java` 和 `SmsServiceProvider.java` 提供了该接口的两个不同实现：邮件发送和短信发送。

```java
package spi;

public class EmailServiceProvider implements MessageServiceProvider {
    @Override
    public void sendMessage(String message) {
        System.out.println("Sending Email: " + message);
    }
}
```

```java
package spi;

public class SmsServiceProvider implements MessageServiceProvider {
    @Override
    public void sendMessage(String message) {
        System.out.println("Sending SMS: " + message);
    }
}
```

### 3. 创建 SPI 配置文件

`spi.MessageServiceProvider` 是 SPI 的核心约定：在 `resources/META-INF/services/` 目录下创建一个以 **接口全限定名** 命名的文件，文件内容为 **实现类的全限定名**（每行一个）。

```text
spi.EmailServiceProvider
spi.SmsServiceProvider
```

### 4. 客户端加载和调用

`SpiDemo.java`使用 JDK 自带的 `ServiceLoader` 去动态发现并加载服务。

```java
package spi;

import java.util.ServiceLoader;

public class SpiDemo {
    public static void main(String[] args) {
        System.out.println("--- Starting SPI Demo ---");
        
        // 动态加载所有 MessageServiceProvider 的实现
        ServiceLoader<MessageServiceProvider> serviceLoader = ServiceLoader.load(MessageServiceProvider.class);

        // 遍历所有被发现的服务并调用
        for (MessageServiceProvider provider : serviceLoader) {
            System.out.println("Found provider: " + provider.getClass().getSimpleName());
            provider.sendMessage("Hello SPI!");
        }
        
        System.out.println("--- SPI Demo Finished ---");
    }
}
```

## 运行结果

```text
--- Starting SPI Demo ---
Found provider: EmailServiceProvider
Sending Email: Hello SPI!
Found provider: SmsServiceProvider
Sending SMS: Hello SPI!
--- SPI Demo Finished ---
```

如果您后续想要新增其他的消息服务（比如 `WeChatServiceProvider`），只需要编写新的实现类，并在 `META-INF/services/spi.MessageServiceProvider` 文件中追加一行新类的全路径即可，完全不需要修改 `SpiDemo` 中的调用代码，实现了很好的可扩展性。

## Java SPI 和 依赖注入的区别

Java SPI（Service Provider Interface）和依赖注入（Dependency Injection, DI）虽然都涉及“接口与实现的分离”以及“面向接口编程”，但它们的**核心目的、工作机制和应用场景**截然不同。

简单来说：**SPI 侧重于“服务发现与框架扩展”，而 DI 侧重于“对象组装与组件解耦”。**

以下是它们的详细区别：

### 1. 核心概念与目的

- **Java SPI (服务发现机制)**
  - **是什么**：Java 核心库内置的一种服务提供发现机制（主要通过 `java.util.ServiceLoader` 实现）。
  - **目的**：解决**如何动态发现并加载接口的实现类**。它允许第三方为某个接口提供实现，并在运行时被主程序找到，非常适合用于开发插件系统或框架的扩展点。
- **依赖注入 DI (设计模式/架构理念)**
  - **是什么**：一种实现控制反转（IoC）的设计模式，通常由 Spring、Guice 等框架提供支持。
  - **目的**：解决**如何将一个对象所依赖的其他对象传递（注入）给它**。它将对象的创建和依赖关系的维护交给了 IoC 容器，从而降低了业务组件之间的耦合度。

### **2. 关键区别对比**

- **获取对象的方式 (Pull vs Push)**
  - **SPI（主动拉取）**：调用方需要主动调用 `ServiceLoader.load(Interface.class)` 去“拉取”所有的实现类，并自己决定使用哪一个。
  - **DI（被动接收）**：对象不需要自己去寻找依赖，而是由 DI 容器（如 Spring 容器）在创建该对象时，主动将依赖“推”（注入）到它的构造函数或属性中。
- **对象的生命周期管理**
  - **SPI**：能力非常基础。每次调用 `iterator.next()` 实例化时，通常都是通过反射调用无参构造函数创建一个**新对象**（除非调用方自己缓存）。它不具备复杂的生命周期管理能力。
  - **DI**：框架提供了极其强大的生命周期管理能力。可以轻松配置对象是单例（Singleton）、原型（Prototype）、还是请求级别（Request），并支持初始化和销毁的回调。
- **依赖图与嵌套解析**
  - **SPI**：只负责实例化当前接口的实现类。如果这个实现类内部又依赖了其他对象，SPI **不会**帮你自动装配，你需要手动处理内部依赖。
  - **DI**：擅长处理复杂的**依赖树/依赖图**。如果 A 依赖 B，B 依赖 C，DI 容器会自动先创建 C，注入给 B，再把 B 注入给 A，甚至能处理循环依赖问题。
- **粒度与应用边界**
  - **SPI**：通常用于**模块间、组件间或框架层面**的粗粒度替换。例如：替换整个数据库驱动、替换日志底层实现。
  - **DI**：通常用于**应用程序内部**的细粒度对象管理。例如：Controller 注入 Service，Service 注入 Repository。

### **3. 典型应用场景**

- **Java SPI 的经典场景**
  - **JDBC 驱动加载**：Java 定义了 `java.sql.Driver` 接口，MySQL、Oracle 各自提供实现，并在 `META-INF/services/` 下配置。`DriverManager` 通过 SPI 发现并加载它们。
  - **SLF4J 日志门面**：通过 SPI 寻找底层的日志实现（如 Logback 或 Log4j）。
  - **Dubbo 的扩展机制**：Dubbo 自己实现了一套增强版的 SPI，用于动态加载负载均衡算法、序列化协议等插件。

- **依赖注入 (DI) 的经典场景**
  - **业务逻辑解耦**：在 Spring Boot 应用中，使用 `@Autowired` 或构造器注入，将数据访问层（DAO）注入到业务逻辑层（Service）中，使得 Service 可以方便地进行 Mock 测试。

### **总结**

可以将它们的关系比喻为：

- **SPI 是“招聘平台”**：公司（主程序）发布了一个岗位（接口），外部的候选人（实现类）投递简历（`META-INF/services`），公司去平台上搜索并挑选符合条件的人来干活。
- **DI 是“公司大管家”**：你（业务类）在公司里只需要说“我需要一台电脑和一个助手”（声明依赖），大管家（DI 容器）就会自动把电脑和助手分配到你的工位上，你不需要关心电脑去哪买、助手从哪招的。

在现代的高级框架中（如 Spring、Dubbo），**两者经常结合使用**：框架内部使用 SPI 机制来加载外部的扩展模块，而在应用程序的业务代码中，使用 DI 来组装这些模块和管理这些被加载进来的组件。
