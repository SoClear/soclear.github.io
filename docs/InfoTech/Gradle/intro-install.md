# 介绍和安装

## [简介](https://baike.baidu.com/item/gradle/3066272)

Gradle是一个基于Apache Ant和Apache Maven概念的项目自动化构建开源工具。它使用一种基于Groovy的特定领域语言(DSL)来声明项目设置，也增加了基于Kotlin语言的kotlin-based DSL，抛弃了基于XML的各种繁琐配置。

面向Java应用为主。当前其支持的语言C++、Java、Groovy、Kotlin、Scala和Swift，计划未来将支持更多的语言。

Gradle是一个基于JVM的构建工具，是一款通用灵活的构建工具，支持maven， Ivy仓库，支持传递性依赖管理，而不需要远程仓库或者是pom.xml和ivy.xml配置文件，基于Groovy，build脚本使用Groovy编写。

## [关于Gradle，你需要知道的五件事](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things#five_things)

Gradle是一个灵活而强大的构建工具，当您第一次开始时很容易感到害怕。但是，了解以下核心原则将使Gradle更加平易近人，并且在不知不觉中，您将熟练使用该工具。

### [1. Gradle是一个通用的构建工具](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things#1_gradle_is_a_general_purpose_build_tool)

Gradle允许你构建任何软件，因为它对你试图构建的东西或应该如何完成它几乎没有假设。最明显的限制是依赖关系管理目前仅支持与 Maven 和 Ivy 兼容的存储库和文件系统。

这并不意味着您必须做很多工作才能创建构建。Gradle通过[_插件_](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsplugins.html#plugins)添加一层约定和预构建功能，可以轻松构建常见类型的项目（例如Java库）。您甚至可以创建和发布自定义插件来封装自己的约定并构建功能。

### [2. 核心模型基于任务](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things#the_core_model_is_based_on_tasks)

Gradle将其构建建模为任务（工作单元）的有向无环图（DAG）。这意味着生成实质上配置一组任务，并根据它们的依赖项将它们连接在一起以创建该 DAG。创建任务图后，Gradle 会确定哪些任务需要以何种顺序运行，然后继续执行这些任务。

此图显示了两个示例任务图，一个是抽象的，另一个是具体的，任务之间的依赖关系表示为箭头：

![Example task graphs](intro-install-task-dag-examples.png)

图 1.Gradle 任务图的两个示例

几乎任何构建过程都可以以这种方式建模为任务图，这也是Gradle如此灵活的原因之一。该任务图可以由插件和您自己的构建脚本定义，任务通过[任务依赖关系机制](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingstutorial_using_tasks.html#sec:task_dependencies)链接在一起。

任务本身包括：

- 操作 — 执行某些操作（如复制文件或编译源代码）的工作片段

- 输入 — 操作使用或操作的值、文件和目录

- 输出 — 操作修改或生成的文件和目录

实际上，上述所有内容都是可选的，具体取决于任务需要执行的操作。某些任务（如[标准生命周期任务](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsbase_plugin.html#sec:base_tasks)）甚至没有任何操作。为了方便起见，它们只是将多个任务聚合在一起。`test assemble`

> 你选择运行哪个任务。通过指定做你需要的任务来节省时间，但不要超过这个范围。如果你只想运行单元测试，选择做这个的任务--通常是测试。如果你想打包一个应用程序，大多数构建有一个`assemble`任务。

最后一件事：Gradle的[增量构建](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsmore_about_tasks.html#sec:up_to_date_checks)支持是强大而可靠的，所以除非你真的想执行 `clean` 任务，否则通过避免 `clean` 任务来保持你的构建快速运行。`clean`

### [](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things#3_gradle_has_several_fixed_build_phases)[3\. Gradle有几个固定的构建阶段](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things#3_gradle_has_several_fixed_build_phases)

重要的是要了解Gradle分三个阶段评估和执行构建脚本：

1. 初始化

    设置生成的环境，并确定哪些项目将参与其中。

2. 配置

    构造和配置生成的任务图，然后根据用户要运行的任务确定需要运行哪些任务以及运行顺序。

3. 执行

    运行在配置阶段结束时选择的任务。

这些阶段构成了 Gradle 的[构建生命周期](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsbuild_lifecycle.html#build_lifecycle)。

> 与 Apache Maven 术语的比较
>
> Gradle的构建阶段与Maven的阶段不同。Maven 使用其阶段将生成执行划分为多个阶段。它们的作用与Gradle的任务图类似，尽管不太灵活。
>
> Maven的构建生命周期概念与Gradle的生命周期任务大致相似。

设计良好的生成脚本主要由[声明性配置而不是命令性逻辑](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsauthoring_maintainable_build_scripts.html#sec:avoid_imperative_logic_in_scripts)组成。在配置阶段可以理解地评估该配置。即便如此，许多这样的构建还具有任务操作（例如 via 和块），这些操作在执行阶段进行评估。这一点很重要，因为在配置阶段评估的代码不会看到在执行阶段发生的更改。 `doLast {}` `doFirst {}`

配置阶段的另一个重要方面是，_每次运行生成时都会_ 评估其中涉及的所有内容。这就是为什么[在配置阶段避免昂贵的工作](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsauthoring_maintainable_build_scripts.html#sec:minimize_logic_executed_configuration_phase)是最佳做法。[构建扫描](https://scans.gradle.com/)可以帮助您识别此类热点等。

### [4. Gradle 以多种方式可扩展](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things#4_gradle_is_extensible_in_more_ways_than_one)

如果您只能使用与Gradle捆绑在一起的构建逻辑来构建项目，那就太好了，但这很少可能。大多数生成都有一些特殊要求，这意味着需要添加自定义生成逻辑。

Gradle 提供了几种允许您扩展它的机制，例如：

- [自定义任务类型](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingscustom_tasks.html#custom_tasks)。

    当您希望生成执行现有任务无法执行的某些工作时，只需编写自己的任务类型即可。通常，最好将自定义任务类型的源文件放在 [_buildSrc_](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsorganizing_gradle_projects.html#sec:build_sources) 目录或打包的插件中。然后，您可以使用自定义任务类型，就像Gradle提供的任何任务类型一样。

- 自定义任务操作。

    您可以通过 [Task.doFirst()](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:doFirst(org.gradle.api.Action))和 [Task.doLast()](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html#org.gradle.api.Task:doLast(org.gradle.api.Action)) 方法附加在任务之前或之后执行的自定义构建逻辑。

- 项目和任务的[额外属性](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingswriting_build_scripts.html#sec:extra_properties)。

    这些允许您将自己的属性添加到项目或任务中，然后可以从自己的自定义操作或任何其他生成逻辑中使用这些属性。额外的属性甚至可以应用于不是由您显式创建的任务，例如由Gradle的核心插件创建的任务。

- 自定义约定。

    约定是简化生成的一种强大方法，以便用户可以更轻松地理解和使用它们。这可以在使用标准项目结构和命名约定的构建（如 [Java 构建](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsbuilding_java_projects.html#building_java_projects)中看到）。您可以编写自己的插件来提供约定 - 它们只需要为构建的相关方面配置默认值。

- [自定义模型](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsimplementing_gradle_plugins.html#modeling_dsl_like_apis)。

    Gradle允许你在任务、文件和依赖性配置之外向构建中引入新的概念。你可以从大多数语言插件中看到这一点，它们在构建中加入了[源码集](https://docs.gradle.org/current/userguide/building_java_projects.html#sec:java_source_sets)的概念。对构建过程进行适当的建模，可以大大改善构建的易用性和效率。

### [5. 构建脚本针对 API 运行](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things#5_build_scripts_operate_against_an_api)

很容易将 Gradle 的构建脚本视为可执行代码，因为这就是它们的本质。但这是一个实现细节：精心设计的构建脚本应该描述构建软件所需的步骤 _是什么_ ，而不是这些步骤应该 _如何_ 完成工作。这是自定义任务类型和插件的工作。

> 人们普遍存在一种误解，认为Gradle的强大功能和灵活性来自于其构建脚本是代码的事实。这与事实大相径庭。底层模型和 API 提供了强大的功能。正如我们在最佳实践中建议的那样，您应该[避免在生成脚本中放置太多（如果有）命令性逻辑](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsauthoring_maintainable_build_scripts.html#sec:avoid_imperative_logic_in_scripts)

然而，将构建脚本视为可执行代码在一个方面很有用：了解构建脚本的语法如何映射到Gradle的API。API文档（由[Groovy DSL Reference](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things../dsl/)和[Javadocs](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things../javadoc/)组成）列出了方法和属性，并引用了闭包和操作。这些在构建脚本的上下文中意味着什么？查看 [Groovy 构建脚本入门](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_thingsgroovy_build_script_primer.html#groovy_build_script_primer)以了解该问题的答案，以便您可以有效地使用 API 文档。

> 由于 Gradle 在 JVM 上运行，因此构建脚本也可以使用标准的Java API。Groovy 构建脚本还可以使用 Groovy API，而 Kotlin 构建脚本可以使用 Kotlin 构建脚本。</td></tr></tbody></table>

## [通俗理解和与类似工具对比](https://www.zhihu.com/question/30432152)

gradle可以帮你管理项目中的差异,依赖,编译,打包,部署……你可以定义满足自己需要的构建逻辑，写入到build.gradle中供日后复用。

你都说了要通俗的理解，那就用不着学习什么理论了，通俗着来就是了。

通俗的说：gradle是打包用的。

你觉得解决你的问题了吗？如果没解决，那是你的问题提得不够好。比如我猜你应该提：为什么要打包发布，打包发布有几种常见方法，为什么这些常见方法中要选gradle，等等。

针对我猜的这些内容，通俗的讲是这样的：

以在eclipse里面写java程序为例

为什么需要打包：

最初写完了，直接右键run就可以了。但是程序写完了毕竟是要发布到服务器上或者给别人用的，你第一不可能让所有要运行的人都装个eclipse，第二不可能把源代码公布给所有人。所以你需要把你的代码发布成二进制形式，让其它环境方便运行，这就是打包。

为什么用ant

打包的时候要做很多事，比如说配置文件中的用户名和密码，你本地开发和程序实际运行时的内容肯定不一致，所以需要有两个文件，开发的时候用一个，实际运行的时候用一个。这样每次打包的时候都要重复的做这些事，ant可以让你用xml的形式把这些事情写成脚本，然后自动运行。

为什么用maven

你的项目要用很多jar包，比如你写日志要用个log4j吧，连数据库要用个connector吧。这年头写程序不用个spring都不好意思出门，下载下来的spring包打开一看，密密麻麻的好几十个jar，不知道用哪个不用哪个。而且，即便是你一狠心把这些jar包都放进来，很大可能性还是不能运行，因为还要依赖其它的jar包。哪天想升级个spring小版本，所有jar包都要重来一遍，你也不记得哪些是由于spring引进来的jar包了。

所以有了maven，你只要配置一下说我要用spring 3，所有jar包都给你下载好了，你直接运行就行了。赶明儿想升级版本，直接把3改成4，新的jar包也给你下载好了。

然后？

用了maven，jar包是方便了，但我打包的时候还是有好多事要做啊，然后你会发现maven实在是不知道怎么做这些事，于是开始怀念ant。

gradle就是又能干maven的活，又能干ant的活，用groove语言写脚本，表达能力还更强。

就这意思。

========================================

我也是这两天才看了两眼gradle，了解不深。简化版如下：

ant可以自动化打包逻辑。

maven也可以自动化打包，相比于ant，它多做的事是帮你下载jar包。

但是maven的打包逻辑太死板，定制起来太麻烦，不如ant好用。gradle就是又能自动下jar包，又能自己写脚本，并且脚本写起来还比ant好用的这么个东西。

## 安装

[下载地址](https://gradle.org/releases/)

[安装教程](https://gradle.org/install/)
