# 构建 Kotlin 应用程序示例

- [groovy DSL](https://docs.gradle.org/current/samples/zips/sample_building_kotlin_applications-groovy-dsl.zip)

- [Kotlin DSL](https://docs.gradle.org/current/samples/zips/sample_building_kotlin_applications-kotlin-dsl.zip)

本指南演示如何使用 Gradle 创建 Kotlin 应用程序。您可以按照指南分步从头开始创建新项目，或使用上面的链接下载完整的示例项目。`gradle init`

## [您将构建的内容](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#what_youll_build)

您将生成一个遵循 Gradle 约定的 Kotlin 应用程序。

## [您将需要什么](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#what_youll_need)

- 文本编辑器或IDE - 例如 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)

- Java Development Kit （JDK），版本 8 或更高版本 - 例如 [AdoptOpenJDK](https://adoptopenjdk.net/)

- 最新的 [Gradle 发行版](https://gradle.org/install)

## [创建项目文件夹](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#create_a_project_folder)

Gradle 附带了一个名为 的内置任务，用于初始化空文件夹中的新 Gradle 项目。该任务使用（也是内置的）任务来创建 Gradle 包装器脚本 。`init init wrapper gradlew`

第一步是为新项目创建一个文件夹，并将目录更改为该文件夹。

## [运行初始化任务](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#run_the_init_task)

在新项目目录中，使用终端中的以下命令运行任务：。出现提示时，选择项目类型和实现语言。接下来，您可以选择用于编写构建脚本的 DSL - 或 。对于其他问题，请按 Enter 键以使用默认值。`init gradle init 2: application 4: Kotlin 1 : Groovy 2: Kotlin`

输出将如下所示：

```bash
$ gradle init

Select type of project to generate:
  1: basic
  2: application
  3: library
  4: Gradle plugin
Enter selection (default: basic) [1..4] 2

Select implementation language:
  1: C++
  2: Groovy
  3: Java
  4: Kotlin
  5: Scala
  6: Swift
Enter selection (default: Java) [1..6] 4

Select build script DSL:
  1: Groovy
  2: Kotlin
Enter selection (default: Groovy) [1..2] 1

Project name (default: demo):
Source package (default: demo):


BUILD SUCCESSFUL
2 actionable tasks: 2 executed
```

该任务将生成具有以下结构的新项目：`init`

Kotlin

```text
├── gradle (1)
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew (2)
├── gradlew.bat (2)
├── settings.gradle.kts (3)
└── app
    ├── build.gradle.kts (4)
    └── src
        ├── main
        │   └── kotlin (5)
        │       └── demo
        │           └── App.kt
        └── test
            └── kotlin (6)
                └── demo
                    └── AppTest.kt
```

- (1) 为wrapper文件生成的文件夹
- (2) Gradle wrappe 启动脚本
- (3) 用于定义生成名称和子项目的设置文件
- (4) 项目app的构建脚本
- (5) 默认 Kotlin 源文件夹
- (6) 默认 Kotlin 测试源文件夹

现在，您已经设置了构建 Kotlin 应用程序的项目。

## [](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#review_the_project_files)[查看项目文件](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#review_the_project_files)

该文件有两行有趣的行：`settings.gradle(.kts)`

Kotlin

settings.gradle.kts

```text
rootProject.name = "demo"
include("app")
```

- `rootProject.name`为生成分配一个名称，这将覆盖在生成所在的目录之后命名生成的默认行为。建议设置一个固定名称，因为如果项目是共享的，文件夹可能会更改 - 例如，作为Git存储库的根目录。

- `include("app")`定义生成由一个调用的子项目组成，该子项目包含实际代码和生成逻辑。可以通过其他语句添加更多子项目。`app``include(…)`

我们的构建包含一个名为 subproject 的子项目，它代表我们正在构建的 Kotlin 应用程序。它在文件中配置：`app``app/build.gradle(.kts)`

Kotlin

app/build.gradle.kts

```kotlin
plugins {
    id("org.jetbrains.kotlin.jvm") version "1.5.31" (1)

    application (2)
}

repositories {
    mavenCentral() (3)
}

dependencies {
    implementation(platform("org.jetbrains.kotlin:kotlin-bom")) (4)

    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8") (5)

    implementation("com.google.guava:guava:30.1.1-jre") (6)

    testImplementation("org.jetbrains.kotlin:kotlin-test") (7)

    testImplementation("org.jetbrains.kotlin:kotlin-test-junit") (8)
}

application {
    mainClass.set("demo.AppKt") (9)
}
```

- (1) 应用 `org.jetbrains.kotlin.jvm` 插件来添加对 Kotlin 的支持。
- (2) 应用应用程序插件以添加对在 Java 中构建 CLI 应用程序的支持。
- (3) 使用 Maven Central 解析依赖关系。
- (4) 对齐所有 Kotlin 组件的版本
- (5) 使用 Kotlin JDK 8 标准库。
- (6) 应用程序使用此依赖项。
- (7) 使用 Kotlin 测试库。
- (8) 使用 Kotlin JUnit 集成。
- (9) 定义应用程序的主类。

该文件如下所示：`src/main/kotlin/demo/App.kt`

Generate src/main/kotlin/demo/App.kt

```kotlin
/*
 * This Kotlin source file was generated by the Gradle 'init' task.
 */
package demo

class App {
    val greeting: String
        get() {
            return "Hello World!"
        }
}

fun main() {
    println(App().greeting)
}
```

生成的测试如下所示：`src/test/kotlin/demo/App.kt`

Generate src/test/kotlin/demo/AppTest.kt

```kotlin
/*
 * This Kotlin source file was generated by the Gradle 'init' task.
 */
package demo

import kotlin.test.Test
import kotlin.test.assertNotNull

class AppTest {
    @Test fun appHasAGreeting() {
        val classUnderTest = App()
        assertNotNull(classUnderTest.greeting, "app should have a greeting")
    }
}
```

生成的测试类具有单个 _kotlin.test_ 测试。测试实例化该类，对其调用一个方法，并检查它是否返回预期值。`App`

## [运行应用程序](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#run_the_application)

借助该插件，您可以直接从命令行运行应用程序。该任务告诉 Gradle 在分配给该属性的类中执行该方法。`application``run``main``mainClass`

```bash
$ ./gradlew run

> Task :app:run
Hello world!

BUILD SUCCESSFUL
2 actionable tasks: 2 executed
```

> 首次运行包装脚本时，可能会出现延迟，而该版本的 下载并将其本地存储在您的文件夹中。`gradlewgradle~/.gradle/wrapper/dists`

## [打包应用程序](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#bundle_the_application)

该插件还为您打包了应用程序及其所有依赖项。存档还将包含一个脚本，用于使用单个命令启动应用程序。`application`

```bash
$ ./gradlew build

BUILD SUCCESSFUL in 0s
8 actionable tasks: 8 executed
```

如果您按上所示运行完整构建，Gradle 将为您生成两种格式的存档：`app/build/distributions/app.tar`和`app/build/distributions/app.zip`。

## [发布生成扫描](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#publish_a_build_scan)

要详细了解生成在后台执行的操作，最佳方法是发布[生成扫描](https://scans.gradle.com/)。为此，只需使用 `--scan` 模式运行Gradle即可。`--scan`

```bash
$ ./gradlew build --scan

BUILD SUCCESSFUL in 0s
8 actionable tasks: 8 executed

Publishing a build scan to scans.gradle.com requires accepting the Gradle Terms of Service defined at https://gradle.com/terms-of-service.
Do you accept these terms? [yes, no] yes

Gradle Terms of Service accepted.

Publishing build scan...
https://gradle.com/s/5u4w3gxeurtd2
```

单击链接并浏览哪些任务在何处执行，哪些依赖项已下载以及更多详细信息！

## [](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#summary)[总结](https://docs.gradle.org/current/samples/sample_building_kotlin_applications.html#summary)

就是这样！现在，您已经使用 Gradle 成功配置并构建了一个 Kotlin 应用程序项目。您已经学会了如何：

- 初始化生成 Kotlin 应用程序的项目

- 运行生成并查看测试报告

- 使用插件中的任务执行 Kotlin 应用程序`run` `application`

- 将应用程序打包到存档中
