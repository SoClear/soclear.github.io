# FFM

## 前言

Java 22 于 2024/03/19 发布了 GA 版本，同时宣布 [Foreign Function & Memory API](https://link.zhihu.com/?target=https%3A//openjdk.org/jeps/454) 退出预览，这意味着在 Java 22 以后，[FFM API](https://zhida.zhihu.com/search?content_id=245940353&content_type=Article&match_order=1&q=FFM+API&zhida_source=entity) 基本不会有太大的改动，所以我们可以期待一下 2025 年 9 月的 Java 25 LTS 版本了

本文主要介绍 FFM API 的使用样例

本文中涉及到的全部代码已提交github仓库：

顾名思义，FFM API 全称 Foreign Function & Memory API ，由两部分组成，一个为 Foreign Function，另一个为 Memory API，以下优先介绍 Memory API

FFM 的概念由三部分组成：生命周期、内存分配、内存布局。很像用时间空间和结构来描述一个事物。

## Memory API

这是一个内存接口，主要用于管理外部内存

### Arena

这个接口用于控制内存申请后的用法和管理方式，所有的内存申请必须通过这个接口对象申请

- `ofAuto` 返回一个新对象，支持 Java GC 自动回收内存，可以由任何线程访问，无法调用 close()

- `global` 返回一个全局对象，可以由任何线程访问，无法调用 close()

- `ofConfined` 返回一个新对象，只能由当前线程访问，需要调用 close()

- `ofShared` 返回一个新对象，可以由任何线程访问，需要调用 close()

本文的代码中将统一使用 ofAuto ，且为同一个对象：

```java
private static final Arena arena = Arena.ofAuto();
```

获取到 Arena 对象后就可以开始申请内存了，这里有一个简单的案例：

```java
private static void stringTest() {
    MemorySegment cString = arena.allocateFrom("Panama");
    String jString = cString.getString(1L);
    System.out.println(jString);
}
```

以上代码将会打印 “anama”

> 由于使用的 utf8 编码是 1 字节编码，转为字符串后可以直接通过偏移 1 字节来正确的截取字符串

## Foreign Function

这是一个外部函数接口，简称 FFI，用于实现 Java 代码和外部代码之间相互操作

### Linker

当前版本中，这个接口只能通过 _nativeLinker()_ 获取到全局唯一对象

本文代码中将使用同一个对象：

```java
private static final Linker linker = Linker.nativeLinker();
```

> 对象中的方法放到实际使用时介绍

### SymbolLookup

外部代码在 Java 中表示的对象，如 .so/.dll 之类的库

本文中只涉及到基础库的api，所以将使用同一个对象：

```java
private static final SymbolLookup lookup = linker.defaultLookup();
```

### java 调用外部方法

获取到外部代码对象后就可以进行查找并调用外部方法了，这里有一个简单的例子：

```java
private static void strlen() throws Throwable {
    // size_t strlen(const char *s);
    MethodHandle strlen = linker.downcallHandle(
            lookup.find("strlen").get(),
            FunctionDescriptor.of(JAVA_LONG, ADDRESS)
    );
    MemorySegment str = arena.allocateFrom("Hello");
    long len = (long) strlen.invoke(str);
    System.out.println(len); // 5
}
```

以上代码将会打印 “5”以下是一些解析

通过 lookup 可以查找外部对象，这里的 lookup 是一个默认库对象，在**当前版本中**包含了标准 c 库的一些 api

通过查阅文档，可以找到标准 c 库中有一个函数：

```c
size_t strlen(const char *s);
```

然后构造函数描述：

```java
FunctionDescriptor.of(JAVA_LONG, ADDRESS)
```

> 这里的 JAVA\_LONG,ADDRESS 全部为 java.lang.foreign.ValueLayout 中的字段  
> 本文的代码静态导入了这个类 `import static java.lang.foreign.ValueLayout.*;`

有了外部代码和函数描述之后，就可以获取到函数句柄（示例中的 MethodHandle strlen）

然后通过 arena 将字符串放到外部内存中，提供给外部函数使用

strlen 返回值可以直接强制转换为 long 类型，这个类型由 获取函数句柄 时保证，如果函数描述中的类型表示错误，将会在获取函数句柄时抛出异常：

```text
class java.lang.Integer cannot be cast to class java.lang.Long (java.lang.Integer and java.lang.Long are in module java.base of loader 'bootstrap')
```

### 外部方法调用 java

外部方法可以获取到函数句柄，java方法也可以获取到函数句柄，这里有一个简单的例子：

```java
private static void qsort() throws Throwable {
    // MethodHandles.lookup().unreflect(FFMTest.class.getDeclaredMethod("qsortCompare", MemorySegment.class, MemorySegment.class));
    MethodHandle comparHandle = MethodHandles.lookup().findStatic(FFMTest.class, "qsortCompare",
            MethodType.methodType(int.class, MemorySegment.class, MemorySegment.class)
    );
    MemorySegment comparFunc = linker.upcallStub(comparHandle,
            FunctionDescriptor.of(JAVA_INT,
                    ADDRESS.withTargetLayout(JAVA_INT),
                    ADDRESS.withTargetLayout(JAVA_INT)),
            arena
    );
    // void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));
    MethodHandle qsort = linker.downcallHandle(
            lookup.find("qsort").get(),
            FunctionDescriptor.ofVoid(ADDRESS, JAVA_LONG, JAVA_LONG, ADDRESS)
    );
    MemorySegment array = arena.allocateFrom(JAVA_INT,
            0, 9, 3, 4, 6, 5, 1, 8, 2, 7
    );
    qsort.invoke(array, 10L, JAVA_INT.byteSize(), comparFunc);
    int[] sorted = array.toArray(JAVA_INT);
    System.out.println(Arrays.toString(sorted)); // [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
}

private static int qsortCompare(MemorySegment elem1, MemorySegment elem2) {
    return Integer.compare(elem1.get(JAVA_INT, 0), elem2.get(JAVA_INT, 0));
}
```

可以直接通过反射获取，或者使用 MethodHandles.lookup() 类中的方法获取到 java 中任意的字段/构造器/方法的句柄，然后通过 linker.upcallStub 将java方法转为一个外部函数指针（MemorySegment）

需要注意的是这里的 ADDRESS 需要指定内部存储的对象结构，然后在 java 方法中才能正常读取这个对象

查阅文档，找到标准 c 库中的qsort函数：

```c
void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));
```

获取到函数指针（MethodHandle qsort）

通过 arena 在外部内存中构造一个未排序的 int 数组（MemorySegment array），并调用 qsort

qsort中将会对这个 int 数组通过传入的比较方法进行排序

调用后记得要将外部内存中的数组读取出来再查看。

## 结构体的定义和使用

通过现有 API，我们可以在 Java 中定义外部内存中的结构体，这里有一个简单的例子：

```java
private static void struct() {
    // struct Point {
    //     int x;
    //     int y;
    // } pts[10];
    SequenceLayout ptsLayout = MemoryLayout.sequenceLayout(10,
            MemoryLayout.structLayout(
                    ValueLayout.JAVA_INT.withName("x"),
                    ValueLayout.JAVA_INT.withName("y")
            )
    );
    VarHandle xHandle = ptsLayout.varHandle(PathElement.sequenceElement(),
            PathElement.groupElement("x"));
    VarHandle yHandle = ptsLayout.varHandle(PathElement.sequenceElement(),
            PathElement.groupElement("y"));
    MemorySegment segment = arena.allocate(ptsLayout);
    for (int i = 0; i < ptsLayout.elementCount(); i++) {
        xHandle.set(segment,
                /* base */ 0L,
                /* index */ (long) i,
                /* value to write */ i); // x
        yHandle.set(segment,
                /* base */ 0L,
                /* index */ (long) i,
                /* value to write */ i); // y
    }
    for (int i = 0; i < ptsLayout.elementCount(); i++) {
        System.out.println("index[" + i + "].x=" + xHandle.get(segment, 0L, i));
        System.out.println("index[" + i + "].y=" + yHandle.get(segment, 0L, i));
    }
}
```

这是一个结构体数组，内部有x，y两个成员

使用sequenceLayout表达最外层的数组；中间是一个普通结构体，使用 structLayout；内部有两个成员，使用ValueLayout；

> 注意：这里的ValueLayout可以不写名字，但是在java中读取结构体数据时就只能使用 PathElement.groupElement(0) 这种根据成员在结构体中的顺序来获取值

通过 varHandle 方法可以构造一个获取结构体成员的值的变量句柄，这样就可以在循环内设置或读取值

## 实例

通过 MuMu 模拟器安装路径下的 `shell/sdk/external_renderer_ipc.dll` 来操作模拟器。

```kotlin
import org.bytedeco.opencv.global.opencv_core.CV_8UC4
import org.bytedeco.opencv.global.opencv_core.flip
import org.bytedeco.opencv.global.opencv_highgui.*
import org.bytedeco.opencv.global.opencv_imgproc.COLOR_RGBA2BGRA
import org.bytedeco.opencv.global.opencv_imgproc.cvtColor
import org.bytedeco.opencv.opencv_core.Mat
import java.lang.foreign.*
import kotlin.time.measureTimedValue

fun main() {
    MuMu().use { player ->
        val initialized = player.initialize("""E:\softwares\MuMu Player 12""")
        if (!initialized) return
        var lastUpdateTime = System.nanoTime()
        val frameInterval = 1_000_000_000L / 30 // 30 FPS
        while (true) {
            when (waitKey(1)) {
                27 -> {
                    destroyAllWindows()
                    return
                }
                else -> {
                    val currentTime = System.nanoTime()
                    if (currentTime - lastUpdateTime >= frameInterval) {
                        val (mat,t) = measureTimedValue {
                            player.captureAsMat()
                        }
                        println(t)
                        imshow("截屏", mat)

                        lastUpdateTime = currentTime
                    }
                }
            }
        }
    }
}

class MuMu : AutoCloseable {
    private var handle = 0
    private lateinit var size: Size
    private lateinit var bufferMat: Mat
    private lateinit var resultMat: Mat
    private var dataAddress = 0L

    fun initialize(path: String, index: Int = 0): Boolean = try {
        val handle = connect(path, index)
        captureDisplayHandle.invoke(handle, 0, 0, widthPointer, heightPointer, MemorySegment.NULL)
        size = Size(
            widthPointer.get(ValueLayout.JAVA_INT, 0),
            heightPointer.get(ValueLayout.JAVA_INT, 0)
        )
        bufferMat = Mat(size.height, size.width, CV_8UC4)
        resultMat = Mat(size.height, size.width, CV_8UC4)
        dataAddress = bufferMat.data().address()
        this.handle = handle
        println("连接 $path 位置，编号为 $index 的模拟器成功。")
        println("模拟器分辨率为宽：${size.width}，高：${size.height}")
        true
    } catch (_: Exception) {
        println("连接 $path 位置，编号为 $index 的模拟器失败！")
        false
    }


    private fun connect(path: String, index: Int): Int {
        val connectHandle = linker.downcallHandle(
            symbolLookup.find("nemu_connect").get(),
            FunctionDescriptor.of(
                // 返回值 handle，int 类型
                ValueLayout.JAVA_INT,
                // 模拟器路径，字符串
                ValueLayout.ADDRESS,
                // 要连接的模拟器索引号，int
                ValueLayout.JAVA_INT
            )
        )
        return Arena.ofConfined().use { arena ->
            connectHandle.invoke(arena.allocateArray(ValueLayout.JAVA_CHAR, *path.toCharArray()), index) as Int
        }
    }

    fun captureAsMat(): Mat {
        captureDisplayHandle.invoke(
            handle,
            0,
            size.byteBufferSize,
            widthPointer,
            heightPointer,
            MemorySegment.ofAddress(dataAddress)
        )
        bufferMat.copyTo(resultMat)
        cvtColor(resultMat, resultMat, COLOR_RGBA2BGRA)
        flip(resultMat, resultMat, 0)
        resultMat.reshape(-1, widthPointer.get(ValueLayout.JAVA_INT, 0))
        return resultMat
    }

    override fun close() {
        bufferMat.release()
        resultMat.release()
        linker.downcallHandle(
            symbolLookup.find("nemu_disconnect").get(),
            // 无返回值，参数为 模拟器的 handle，int 类型
            FunctionDescriptor.ofVoid(ValueLayout.JAVA_INT)
        ).invoke(handle)
    }

    companion object {
        private val symbolLookup = SymbolLookup.libraryLookup(
            """E:\softwares\MuMu Player 12\shell\sdk\external_renderer_ipc.dll""",
            Arena.global()
        )
        private val linker = Linker.nativeLinker()

        private val captureDisplayHandle = linker.downcallHandle(
            symbolLookup.find("nemu_capture_display").get(),
            FunctionDescriptor.of(
                // 返回值类型 int
                ValueLayout.JAVA_INT,
                // 模拟器的 handle，int
                ValueLayout.JAVA_INT,
                // 常量值 0 ，unsigned int (在Java中用JAVA_INT表示unsigned int)
                ValueLayout.JAVA_INT,
                // 截图字节数，等于 宽*高*4
                ValueLayout.JAVA_INT,
                // 宽
                ValueLayout.ADDRESS,
                // 高
                ValueLayout.ADDRESS,
                // 截图数据，用 ByteBuffer 类型
                ValueLayout.ADDRESS
            )
        )
        val widthPointer: MemorySegment = Arena.global().allocate(ValueLayout.JAVA_INT)
        val heightPointer: MemorySegment = Arena.global().allocate(ValueLayout.JAVA_INT)

        data class Size(val width: Int, val height: Int) {
            // 用于分配内存来接收像素数据 (RGBA format, 4 bytes per pixel)
            val byteBufferSize = width * height * 4
        }
    }
}
```

感谢 sakura2107 的 [OpenAR](https://github.com/sakura2107/OpenAR/blob/main/ARFrameWork/src/Controller/MuMuController.cpp) 项目，参考了该 dll 中函数的调用方式。

前文来自于 [Java 22 FFM API(Project Panama) 简单介绍和使用](https://zhuanlan.zhihu.com/p/710138989)
