# 如何提高多模块项目的Gradle的编译速度？

Android 项目一旦引入多模块架构，构建速度往往会像踩了刹车一样骤降。很多人第一反应是“Gradle 太慢了”，但实际上**大部分项目的编译瓶颈，并非来自 Gradle 本身，而是我们的代码组织与配置方式拖了后腿**。

本文将从 Gradle 配置、模块管理、注解处理器和依赖设计四个维度，给出一套可落地的编译优化方案，帮你把浪费在构建上的时间夺回来。

## 一、基础配置——让 Gradle 火力全开

在写任何业务代码之前，先检查项目的 `gradle.properties` 是否正确配置。以下是一套推荐的基础优化

```ini
# gradle.properties

# JVM 参数：给 Gradle Daemon 足够的内存，并启用堆转储用于排查 OOM
org.gradle.jvmargs=-Xmx4g -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8

# 并行构建：让各模块同时编译
org.gradle.parallel=true

# 配置缓存（Gradle 7.0+）：缓存配置阶段的结果，二次构建显著提速
org.gradle.configuration-cache=true

# 按需配置：只配置真正参与构建的模块
org.gradle.configure-on-demand=true

# 构建缓存：缓存任务输出，避免重复工作
org.gradle.caching=true

# 资源优化：非传递性 R 类，减小编译产物和避免资源冲突
android.nonTransitiveRClass=true
android.nonFinalResIds=true
```

简单说明：

- **`configuration-cache`** 是 Gradle 的杀手级特性，它能记住整个工程的配置结果，使得配置阶段几乎瞬间完成，尤其对多模块项目效果拔群。如果遇到兼容性问题，可以暂时关闭，但尽量适配它。

- **`parallel=true`** 允许独立模块并行编译，多核 CPU 的利用率大幅提升。

- **`caching=true`** 配合远程构建缓存，能让 CI 和团队成员之间共享编译结果，下文会细讲。

## 二、模块级优化——增量编译与按需构建

### 1\. 开启增量编译

在模块的 `build.gradle.kts` 中，确保 Kotlin 和 Java 的增量编译都已开启：

```kotlin
// app/build.gradle.kts 或各模块的构建脚本
android {
    compileOptions {
        isIncremental = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        // 启用更严格的 JSR-305 注解处理，辅助增量编译
        freeCompilerArgs += listOf("-Xjsr305=strict")
    }
}
```

Kotlin 增量编译依赖于代码的稳定性。如果你的模块经常出现“改了 1 行代码，整个模块重新编译”的情况，往往是以下原因导致增量编译失败：

- 使用 `kapt` 时生成的代码不稳定；

- 模块间不合理的 `api` 依赖导致上游变更波及下游；

- 常量或内联函数的修改强制重编译。

### 2\. 按需构建，不要一把梭

对于大型项目，并不是每次都需要编译所有模块。你可以通过以下手段按需构建：

- **命令行指定模块**：只编译你关心的部分

```bash
./gradlew :features:home:assembleDebug
```

**模块动态包含**：某些老旧模块（比如 `features:legacy`）只在有特定需求时才参与编译

```kotlin
// settings.gradle.kts 动态 include（需结合属性判断）
// 或直接在依赖处条件化
dependencies {
    if (project.hasProperty("includeLegacy")) {
        implementation(project(":features:legacy"))
    }
}
```

- **单模块独立运行**：如果你已经做到了组件化（可独立运行的模块），开发时直接编译运行该组件即可，完全摆脱宿主 App，编译时间降到最低。

## 三、注解处理器——从 kapt 迁移到 ksp

这是**见效最显著**的编译优化手段之一。`kapt`（Kotlin Annotation Processing Tool）会把 Kotlin 代码转为 Java 桩代码再执行注解处理，过程冗长且缓慢。`ksp`（Kotlin Symbol Processing）则是直接在 Kotlin 语法树上工作，通常能带来 3～5 倍的编译速度提升。

**迁移方法**：将注解处理器的依赖从 `kapt` 换为 `ksp`。

```kotlin
// 顶层 build.gradle.kts
plugins {
    id("com.google.devtools.ksp") version "1.9.22-1.0.17" apply false
}

// 模块 build.gradle.kts
plugins {
    id("com.google.devtools.ksp")
}

dependencies {
    // Room：使用 ksp 代替 kapt
    ksp("androidx.room:room-compiler:2.6.0")

    // Hilt：最新版本已支持 ksp
    ksp("com.google.dagger:hilt-compiler:2.48")

    // 其他支持 ksp 的库……
}
```

注意：并非所有注解处理器都已经支持 ksp，但主流库（Room、Hilt、Glide 等）正在快速跟进。对于仍需要 kapt 的库，尽量将其范围控制在最小。

## 四、依赖设计：`api` vs `implementation` 的艺术

在多模块项目中，依赖图越深、越宽，编译时波及的范围就越大。正确使用 `api` 和 `implementation` 是控制这一影响面的关键：

- **`implementation`**：依赖不会传递给下游模块。上游模块修改时，仅直接依赖它的模块需要重新编译。

- **`api`**：依赖会泄露给下游。上游模块更改任何一个 `api` 依赖的接口时，所有传递依赖链上的模块都会触发重编译。

**经验法则**：

- 除非你确实希望下游模块能直接使用某个第三方库的接口（比如模块对外暴露的类型使用了 `Retrofit` 的类），否则**一律用 `implementation`**。

- 时常审查模块的依赖列表，避免“为了方便”而滥用 `api`，这往往会在你不经意间织出一张庞大的重编译网络。

另一个容易被忽视的点是：**拆模块不是越细越好**。每个 Gradle 模块都有自己的初始化开销（配置、任务图构建）。拆分过细（比如每个页面一个模块）会让配置阶段耗时显著增加。建议以业务边界为基准拆分，一般 10～20 个模块以内是比较健康的状态，超过了就要评估合并的可能性。

## 五、诊断与排查：找出真正的瓶颈

当你配置完上述优化后编译仍然缓慢，就需要动手诊断了。

1. **生成构建扫描报告**

```bash
./gradlew assembleDebug --scan
```

1. 构建扫描会详细展示各阶段耗时、任务耗时、缓存命中率，帮你精准定位是配置阶段还是任务执行阶段拖慢了整体。

2. **检查 Kotlin 增量编译是否生效**  
    在 `gradle.properties` 中加入 `kotlin.incremental.usePreciseJavaTracking=true`（Gradle 8.1+ 默认开启），然后观察两次连续编译的耗时差异。如果变化不大，说明增量编译可能因代码结构问题失效。

3. **查看依赖树**

```bash
./gradlew :app:dependencies --configuration debugRuntimeClasspath
```

1. 找出重复依赖、冲突依赖和不该出现的传递依赖，及时排除。

## 六、进阶：远程构建缓存与 Daemon 调优

当团队规模扩大，**Remote Build Cache** 是质变级优化。它允许 CI 服务器将编译产物上传至共享存储（如 HTTP 缓存节点、Gradle Enterprise），其他开发者拉取代码后直接复用缓存，省去大量本地编译时间。配置方式为在 `settings.gradle.kts` 中启用：

```kotlin
buildCache {
    remote(HttpBuildCache::class) {
        url = uri("https://your-cache-server/")
        isPush = true
    }
}
```

另外，Gradle Daemon 和 Kotlin Daemon 的内存配置也很关键：

```ini
# gradle.properties
org.gradle.jvmargs=-Xmx4g -XX:+HeapDumpOnOutOfMemoryError
kotlin.daemon.jvmargs=-Xmx2g
```

Gradle 版本本身也在不断优化构建性能，**Gradle 8.x 的配置缓存稳定性和并行度均远胜 7.x**，条件允许的情况下尽量升级。

## 七、总结

“编译慢”不是 Gradle 的原罪，而是架构与配置失当的并发症。优化顺序应当是：

1. 先调好 `gradle.properties`，让基础设施跑满；

2. 用 ksp 替代 kapt，消除最大的热点；

3. 规范依赖关系，限制重编译半径；

4. 必要时诊断构建扫描，精准下刀；

5. 最后再用远程缓存等进阶手段锦上添花。

编译速度的提升不是一蹴而就的魔法，而是一次次针对性优化的积累。从今天起，别再忍受无谓的等待，动手还自己一个清爽的构建环境。

---

转自 [如何提高多模块项目的Gradle的编译速度？](https://mp.weixin.qq.com/s/7P_DE2brbx5sYsz4JHtrog)
