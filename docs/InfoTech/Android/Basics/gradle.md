# Gradle

有时，出于某种原因，可能需要脱离Android Studio编译代码。最简单的方法是使用命令行编译工具。Android编译系统使用的编译工具叫Gradle。

（注意，能读懂本节内容并按步骤操作是最好的。如果看不懂，甚至不知道为什么要手动编译代码，或者是无法正确使用命令行，也不必太在意，请继续学习下一章内容。命令行工具的具体使用不在本书讨论范围内。）

要从命令行使用Gradle，请切换至项目目录并执行以下命令：  
`./gradlew tasks`

如果是Windows系统，执行以下命令：  
`gradlew.bat tasks`

执行以上命令会显示一系列可用任务。你需要的任务是`installDebug`，因此，再执行以下命令：
`./gradlew installDebug`

如果是Windows系统，执行以下命令：  
`gradlew.bat installDebug`  

以上命令将把应用安装到当前连接的设备上，但不会运行它。要运行应用，需要在设备上手动启动。

构建debug版apk： `assembleDebug`  
构建release版apk： `assembleRelease`
