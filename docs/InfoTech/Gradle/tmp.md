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
