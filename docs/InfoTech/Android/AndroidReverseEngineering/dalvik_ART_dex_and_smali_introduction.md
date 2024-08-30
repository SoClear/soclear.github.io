# dalvik、ART、dex 和 smali 简介

## dalvik和ART

dalvik 和 ART(Android Runtime) 是 JVM 的在 Android 上的实现，

Dalvik和ART（Android Runtime）都是Android操作系统中用于执行应用程序的核心组件之一。它们都是虚拟机实现，用于运行Android应用的字节码（通常存储在.dex文件中）。让我们详细了解一下这两个虚拟机的不同之处：

### Dalvik虚拟机

- **历史**：Dalvik虚拟机最初被设计并用于Android操作系统中，直到Android 4.4 KitKat版本之前一直是Android系统的标准虚拟机。
- **架构**：Dalvik是一个基于寄存器的虚拟机，它的设计目的是为了在资源受限的移动设备上高效运行多个虚拟机实例。
- **编译模式**：Dalvik使用的是即时编译（Just-In-Time, JIT）技术，这意味着应用程序在每次启动时都会将字节码转换为本地机器码。这种编译方式会导致应用启动时稍显缓慢。
- **垃圾回收**：Dalvik的垃圾回收机制相对简单，可能会导致一些性能问题。

### ART虚拟机

- **引入**：ART是在Android 4.4 KitKat版本中作为实验性功能首次出现，并在Android 5.0 Lollipop版本中成为默认的运行时环境。
- **架构**：ART同样是一个基于寄存器的虚拟机，但它针对现代移动设备进行了优化。
- **编译模式**：ART采用了超前编译（Ahead-Of-Time, AOT）技术，在应用安装时将字节码预编译为本地机器码。这样可以显著提高应用的启动速度和运行效率。
- **垃圾回收**：ART改进了垃圾回收机制，提供了更好的内存管理和更少的暂停时间，从而提高了整体性能。
- **其他特性**：ART还支持运行时编译优化和可选的JIT编译器等特性，以进一步优化性能。

### 总结

- **性能**：ART通过AOT编译提供了更好的性能，尤其是在应用启动速度方面。
- **内存使用**：ART虽然可能需要更多的存储空间来存放预编译的代码，但是它可以降低运行时的内存使用，并减少内存碎片。
- **兼容性**：ART保持了与Dalvik的二进制兼容性，这意味着大多数应用无需修改即可在ART上运行。

从Android 5.0开始，ART逐渐取代了Dalvik成为Android平台的标准运行时环境。

## dex

Dex是Dalvik Executable的缩写，它是一种专为Android平台设计的字节码格式。.dex文件包含了应用程序的指令集、类定义、字段信息、方法信息以及常量池等数据结构，这些数据构成了一个完整的程序执行单元。下面是一些关于Dex的关键点：

### Dex格式的特点

- **单个文件**：Dex文件通常被打包在一个单一的文件中，这个文件包含了所有相关的类信息和字节码指令。
- **高效的内存使用**：Dex格式旨在最小化内存占用，因此特别适合于资源有限的移动设备。
- **多线程友好**：Dex格式支持多线程，允许在不同的线程中并发执行多个方法。
- **基于寄存器的架构**：Dex指令集是基于寄存器的，这意味着它们直接操作寄存器而不是栈，这有助于提高执行效率。
- **优化的执行**：Dex格式被设计成可以直接由Dalvik或ART虚拟机解释执行，也可以被编译成本地机器码进行执行。

### Dex文件结构

Dex文件具有一个固定的结构，主要包括以下几个部分：

- **文件头**：包含文件标识符、版本号和其他元数据。
- **字符串表**：包含了所有字符串的列表，用于描述类名、方法名等。
- **类型表**：包含了所有类类型的列表。
- **方法表**：包含了所有方法的列表，包括方法签名和返回类型。
- **类定义表**：包含了每个类的定义，包括其字段、方法和父类信息。
- **代码段**：包含了每个方法的实际字节码指令。
- **数据段**：包含了常量池和其他静态数据。

### Dex与Java字节码的区别

尽管Dex和Java字节码都用于虚拟机执行，但它们之间存在一些关键差异：

- **指令集**：Dex使用一套专门为移动设备优化的指令集。
- **内存模型**：Dex采用基于寄存器的内存模型，而Java字节码采用基于栈的内存模型。
- **多线程支持**：Dex设计时考虑了多线程执行，而Java字节码不是专门为多线程环境设计的。

### 编译过程

当开发者编写完Java源代码后，会使用Android SDK中的工具（如`dx`或`dex`命令）将Java字节码转换为Dex格式。这个过程通常在构建过程中自动完成，开发者不需要手动干预。

### 执行环境

- **Dalvik虚拟机**：早期的Android版本使用Dalvik虚拟机来执行Dex字节码。
- **ART虚拟机**：从Android 5.0 Lollipop开始，ART虚拟机成为了默认的执行环境，它支持AOT（Ahead-of-Time）编译，即在应用安装时将Dex字节码编译成本地机器码，从而提供更快的应用启动时间和更好的性能。

### 使用场景

除了Android应用程序之外，Dex格式也被用于一些其他场景，比如动态加载类、热修复（hot fix）等。

总之，Dex是一种轻量级的字节码格式，专为Android平台设计，旨在优化移动设备上的应用性能。

## smali

Smali是一种中间语言，它是Dex字节码的一种人类可读的文本表示形式。Smali通常用于逆向工程和调试Android应用程序，因为它允许开发人员查看和编辑应用程序的底层字节码。

### Smali的特点

- **可读性**：Smali代码是用文本形式表示的，类似于汇编语言，这让开发者能够更容易地理解和分析Dex字节码。
- **反编译**：Smali代码可以通过工具从Dex字节码文件中生成，这样就可以用来检查应用程序的行为或者查找潜在的安全漏洞。
- **编译**：Smali代码也可以重新编译回Dex字节码文件，这对于修改现有的Dex字节码非常有用，例如在进行热修复或安全补丁时。

### Smali的基本语法

Smali使用一种类似于汇编语言的语法来表示Dex字节码。这里有一些基本的概念和语法元素：

- **类定义**：以`.class`开头，后面跟着类的访问标志和全限定类名。
- **接口实现**：使用`.implements`来指定一个类实现的接口。
- **超类**：使用`.super`来指定一个类的超类。
- **字段定义**：以`.field`开头，后面跟着字段的访问标志、名称、类型和初始值。
- **方法定义**：以`.method`开头，后面跟着方法的访问标志、名称、参数列表和返回类型。
- **指令**：方法体内的每条指令都位于单独的一行上，例如调用方法、分配局部变量、加载常量等。

例如，一个简单的Smali方法可能看起来像这样：

```smali
.class public LHelloWorld;

#Ye olde hello world application
#To assemble and run this on a phone or emulator:
#
#java -jar smali.jar a -o classes.dex HelloWorld.smali
#zip HelloWorld.zip classes.dex
#adb push HelloWorld.zip /data/local
#adb shell dalvikvm -cp /data/local/HelloWorld.zip HelloWorld
#
#if you get out of memory type errors when running smali.jar, try
#java -Xmx512m -jar smali.jar HelloWorld.smali
#instead

.super Ljava/lang/Object;

.method public static main([Ljava/lang/String;)V
    .registers 2

    sget-object v0, Ljava/lang/System;->out:Ljava/io/PrintStream;

    const-string v1, "Hello World!"

    invoke-virtual {v0, v1}, Ljava/io/PrintStream;->println(Ljava/lang/String;)V

    return-void
.end method
```

这段代码定义了一个名为`main`的公共静态方法，该方法打印出“Hello World!”字符串。

### 工具链

- **baksmali**：这是一个工具，用于将Dex字节码反编译为Smali代码。
- **smali**：这是另一个工具，用于将Smali代码编译回Dex字节码。

谷歌维护的 smali 仓库：[smali](https://github.com/google/smali)

### 应用场景

- **逆向工程**：Smali经常被用于逆向工程Android应用，以便理解其内部工作原理或发现潜在的安全漏洞。
- **调试**：有时开发者需要查看或修改应用程序的底层字节码来解决特定的问题。
- **热修复**：在不更新整个应用程序的情况下，可以使用Smali来修改特定的方法或类。
- **安全研究**：对于安全研究人员来说，Smali是分析恶意软件和进行安全审计的重要工具。

总之，Smali提供了一种方便的方式来查看和修改Dex字节码，这对Android开发者和安全研究人员来说是非常有用的工具。
