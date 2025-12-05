# tmp

## gradle wapper

进入目录，输入命令`gradle wrapper`，即可创建特定版本的gradle工程

下载他人项目，进入项目，输入命令`gradle wrapper`，自动下载对应gradle版本

项目目录`gradlew` 命令

```kotlin
task("任务名"){
    // 这里直接写代码运行在configuration阶段
    println("hello")
    // 依赖于某个任务
    dependsOn("任务名") 
    // 调用这个任务时才会运行
    doLast {
        // ...
    }
}
```

## [构建阶段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:build_phases)

Gradle 版本有三个不同的阶段。

### 初始化

Gradle 支持单项目和多项目构建。在初始化阶段，Gradle 确定哪些项目将参与构建，并为每个项目创建一个[项目](https://docs.gradle.org/current/userguide/build_lifecycle.html../dsl/org.gradle.api.Project.html)实例。

### 配置

这个阶段配置项目对象，执行所有属于构建项目的构建脚本。

### 执行

Gradle 确定要执行的任务子集，这些任务在配置阶段创建和配置。子集由传递给命令和当前目录的任务名称参数确定。然后，Gradle 执行每个选定的任务。

## buildScript

buildScript用来配置gradle脚本运行环境。
gradle脚本也是运行在JVM上的，gradle脚本也能导入第三方的gradle脚本（jar包）

```kotlin
buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath("组织名:包名:版本")
    }
}
```

## Gradle-Wrapper

Gradle-Wrapper是简化Gardle的安装和部署，出发点是让任意的gradle的项目都不需要单独安装环境，项目会自动识别有无环境，如果在本地没有找到与wrapper.properties版本相同的Gardle，IDEA就会帮你下载一个gradle环境，官方的出发点是好的，下面我们来了解下这些配置的意义。

## 热重载

### 1. `./gradlew -t build` (太慢，不推荐)

* **做了什么**：它执行的是 Gradle 的完整生命周期。
  * 编译代码 (Compile)
  * 处理资源 (Process Resources)
  * 打包 (Jar)
  * **运行所有测试 (Run Tests)**
  * 代码检查 (Lint/Check)
* **缺点**：每次你改一行代码保存，它不仅会编译，还会把你的单元测试全部跑一遍。如果你的测试很多，等待时间会非常长，严重拖慢热重载的节奏。

### 2. `./gradlew -t installDist` (较快，官方文档常用)

* **做了什么**：它由 `application` 插件提供。
  * 编译代码 (Compile)
  * 处理资源 (Process Resources)
  * **跳过测试 (Skips Tests)**
  * 将编译后的文件和依赖库复制到 `build/install` 目录下，生成可运行的文件结构。
* **优点**：因为它不跑测试，所以速度比 `build` 快得多。它能确保你的应用依赖和资源都被正确生成。

---

### 3. 🚀 最佳方案：`./gradlew -t classes` (最快，强烈推荐)

如果你只是想让 Ktor 检测到变化并热重载，其实你不需要打包，也不需要生成安装目录，只需要**编译出 `.class` 文件**即可。

* **做了什么**：
  * 只编译 Kotlin/Java 源码。
  * 只处理 `src/main/resources` 资源。
* **优点**：这是**耗时最短**的任务。当你按下保存键，Gradle 几乎瞬间就能完成编译，Ktor 也能立刻监测到 `build/classes` 目录的变化并重启。

### 总结建议

为了最极致的开发体验，请使用：

```bash
./gradlew -t classes
```

**对比总结表：**

| 命令 | 包含编译 | 包含资源处理 | **运行测试** | **打包/安装** | **热重载速度** |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `build` | ✅ | ✅ | ✅ (慢) | ✅ | 🐢 慢 |
| `installDist`| ✅ | ✅ | ❌ | ✅ | 🚗 快 |
| **`classes`** | ✅ | ✅ | ❌ | ❌ | 🚀 **极快** |

**建议：** 除非你的 `application.yaml` 配置非常特殊（依赖于完整的 install 目录结构），否则平时开发直接用 **`classes`** 即可。

### ktor 最佳实践

ktor application.yaml 配置文件:

```yaml
ktor:
    development: true
    application:
        modules:
            - com.example.ApplicationKt.module
    deployment:
        port: 9292
        watch:
          - classes
          - resources
```

在IDEA控制台执行 `./gradlew -t classes` 命令，在 Run/Debug Configurations 中添加 `./gradlew run` 并点击绿色三角图标执行。
