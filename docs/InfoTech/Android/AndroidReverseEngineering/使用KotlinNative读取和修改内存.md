# 使用KotlinNative读取和修改内存

目录结构：

```txt
/path/to/your/project
│   .gitignore
│   build.gradle.kts
│   gradle.properties
│   gradlew
│   gradlew.bat
│   README.md
│   settings.gradle.kts
│
├───gradle
│   │   libs.versions.toml
│   │
│   └───wrapper
│           gradle-wrapper.jar
│           gradle-wrapper.properties
│
└───src
    ├───nativeMain
    │   └───kotlin
    │           Main.kt
    │
    └───nativeTest
        └───kotlin
                Test.kt
```

libs.versions.toml:

```toml
[versions]
kotlin = "2.2.20"
kotlinx-io-core = "0.8.0"

[libraries]
kotlinx-io-core = { group = "org.jetbrains.kotlinx", name = "kotlinx-io-core", version.ref = "kotlinx-io-core" }

[plugins]
kotlinMultiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
```

settings.gradle.kts:

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

rootProject.name = "KotlinNativeTemplate"
```

build.gradle.kts:

```kotlin
plugins {
    alias(libs.plugins.kotlin.multiplatform)
}

group = "me.user"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

kotlin {
    applyDefaultHierarchyTemplate()

    val nativeTarget = androidNativeArm64()

    nativeTarget.apply {
        binaries {
            executable {
                entryPoint = "main"
            }
        }
    }

    sourceSets {
        nativeMain.dependencies {
            implementation(libs.kotlinx.io.core)
        }
    }
}
```

Main.kt:

```kotlin
import kotlinx.cinterop.BooleanVar
import kotlinx.cinterop.ByteVar
import kotlinx.cinterop.CValuesRef
import kotlinx.cinterop.CVariable
import kotlinx.cinterop.DoubleVar
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.FloatVar
import kotlinx.cinterop.IntVar
import kotlinx.cinterop.LongVar
import kotlinx.cinterop.ShortVar
import kotlinx.cinterop.UByteVar
import kotlinx.cinterop.UIntVar
import kotlinx.cinterop.ULongVar
import kotlinx.cinterop.UShortVar
import kotlinx.cinterop.alloc
import kotlinx.cinterop.memScoped
import kotlinx.cinterop.ptr
import kotlinx.cinterop.sizeOf
import kotlinx.cinterop.toLong
import kotlinx.cinterop.value
import kotlinx.io.buffered
import kotlinx.io.files.Path
import kotlinx.io.files.SystemFileSystem
import kotlinx.io.readLine
import kotlinx.io.readString
import platform.posix.O_RDWR
import platform.posix.PTRACE_ATTACH
import platform.posix.PTRACE_DETACH
import platform.posix.PTRACE_PEEKDATA
import platform.posix.PTRACE_POKEDATA
import platform.posix.SEEK_SET
import platform.posix.close
import platform.posix.errno
import platform.posix.lseek
import platform.posix.open
import platform.posix.perror
import platform.posix.ptrace
import platform.posix.read
import platform.posix.set_posix_errno
import platform.posix.waitpid
import platform.posix.write
import kotlin.contracts.ExperimentalContracts


fun main(args: Array<String>) {
//    byPtrace(args)
//    byProc(args)
    auto(args)
}

fun auto(args: Array<String>) {
    val pid = getPid("com.ea.game.pvzfree_row")
    if (pid == null) {
        println("未找到 植物大战僵尸 进程")
        return
    }

    val moduleAddress = getModuleAddress(pid, "libpvz.so")
    if (moduleAddress == null) {
        println("未找到模块 libpvz.so")
        return
    }

    ProcMem(pid).use { mem ->
        val p1 = mem.readLong(moduleAddress + 0x01F729C0) ?: return@use null
        val p2 = mem.readLong(p1 + 0x1E0) ?: return@use null
        val p3 = mem.readLong(p2 + 0x48) ?: return@use null
        val p4 = mem.readLong(p3 + 0xB0) ?: return@use null
        val sunAddress = p4 + 0x8C
        println("阳光地址: $sunAddress")
        val sun = mem.readInt(sunAddress) ?: return@use null
        println("当前阳光: $sun")
        val newSun = args.firstOrNull()?.toIntOrNull() ?: return@use null
        mem.writeInt(newSun, sunAddress)
        println("修改成功")
    }
}

@OptIn(ExperimentalForeignApi::class)
fun byPtrace(args: Array<String>) {
    if (args.size < 2) {
        println("Usage: sudo ./your_program.kexe <PID> <HexAddress>")
        println("Example: sudo ./your_program.kexe 1234 0x7ffc123abc")
        return
    }

    val targetPid = args[0].toIntOrNull()
    if (targetPid == null) {
        println("Invalid PID: ${args[0]}")
        return
    }

    val addressString = args[1]

    val addressToRead = addressString.hexToLong()

    println("Attaching to PID: $targetPid")

    println("Reading memory at address: 0x${addressToRead.toString(16)}")

    // 1. 附加到目标进程
    if (ptrace(PTRACE_ATTACH, targetPid!!, null, null) == -1L) {
        perror("PTRACE_ATTACH failed")
        return
    }
    println("Successfully attached. Waiting for process to stop...")


    memScoped {
        val status = alloc<IntVar>() // Allocate memory for a C integer

        // 2. 等待进程停止
        if (waitpid(targetPid, status.ptr, 0) == -1) { // Pass the pointer
            perror("waitpid failed")
            // 尝试分离，即使失败了也要继续
            ptrace(PTRACE_DETACH, targetPid!!, null, null)
            return@memScoped // Exit the memScoped block
        }
    }

    println("Process stopped.")

    // 3. 读取内存数据
    set_posix_errno(0)
    val data = ptrace(PTRACE_PEEKDATA, targetPid!!, addressToRead, null)

    if (data == -1L && errno != 0) {
        perror("PTRACE_PEEKDATA failed")
    } else {
        val intValue = data.toInt()

        println("---- Read Data ----")
        println("data.toHexString() is ${data.toHexString()}")
        println("Read 8-byte word (Hex): 0x${data.toULong().toString(16)}")
        println("Extracted 4-byte signed integer (Decimal): $intValue")
        println("Extracted 4-byte signed integer (Hex): 0x${intValue.toUInt().toString(16)}")
        println("-------------------")
    }

    println("请输入要修改的值，输入 n 取消修改")
    val input = readln()
    if (input == "n") {
        println("取消修改")
    } else {
        val newValue = input.toInt()
        val writeResult = ptrace(PTRACE_POKEDATA, targetPid!!, addressToRead, newValue)

        if (writeResult == -1L) {
            perror("PTRACE_POKEDATA failed")
        } else {
            println("Successfully modified memory at address: 0x${addressToRead.toString(16)}")
        }
    }

    val detach = ptrace(PTRACE_DETACH, targetPid!!, null, null)
    println("detach is $detach")
    // 4. 从进程分离
    if (detach == -1L) {
        perror("PTRACE_DETACH failed")
    } else {
        println("Successfully detached. Target process is resuming.")
    }
}

@OptIn(ExperimentalForeignApi::class)
fun byProc(args: Array<String>) {
    val pid = args.getOrNull(0)?.toIntOrNull() ?: throw IllegalArgumentException("请输入进程ID")
    if (pid < 0) {
        throw IllegalArgumentException("请输入正确的进程ID")
    }
    val offset = args.getOrNull(1)?.hexToLong() ?: throw IllegalArgumentException("请输入偏移地址")

    ProcMem(pid).use {
        val sun = it.readInt(offset)
        println("sun is $sun")

        println("是否修改阳光？输入数量修改阳光，输入 n 取消修改")
        val input = readln()
        if (input == "n") {
            println("取消修改")
            return@use
        }
        val newSun = input.toInt()
        it.writeInt(newSun, offset)
        println("修改成功")
    }
}


fun getPid(processName: String): Int? {
    val procDir = Path("/proc")
    if (!SystemFileSystem.exists(procDir)) {
        return null
    }

    SystemFileSystem.list(procDir).forEach { path ->
        val dirName = path.name
        val pid = dirName.toIntOrNull() ?: return@forEach
        val cmdlinePath = Path(procDir, dirName, "cmdline")
        try {

            val cmdline = SystemFileSystem.source(cmdlinePath).buffered().use { it.readString().split('\u0000')[0] }
            if (cmdline == processName) {
                return pid
            }
        } catch (_: Exception) {
        }
    }

    return null
}

fun getModuleAddress(pid: Int, moduleName: String): Long? {
    val mapsPath = Path("/proc/$pid/maps")
    try {
        SystemFileSystem.source(mapsPath).buffered().use { a ->
            while (true) {
                val line = a.readLine() ?: break

                if (line.endsWith(moduleName)) {
                    val strings = line.split(' ')
                    if (strings[1] == "r-xp") {
                        return strings[0].substringBefore("-").toLong(16)
                    }
                }
            }
        }
    } catch (_: Exception) {
    }
    return null
}

class ProcMem(val pid: Int) {
    init {
        if (pid < 0) {
            throw IllegalArgumentException("please input a valid pid")
        }
    }

    var fd = -1
        private set

    fun open(): Int {
        return open("/proc/$pid/mem", O_RDWR).also {
            fd = it
        }
    }

    fun close(): Int {
        return close(fd)
    }

    @OptIn(ExperimentalContracts::class)
    fun <T> use(block: (ProcMem) -> T): T {
        if (open() < 0) {
            throw RuntimeException("open failed")
        }
        try {
            return block(this)
        } finally {
            close()
        }
    }

    fun lseek(offset: Long): Long {
        return lseek(fd, offset, SEEK_SET)
    }

    @OptIn(ExperimentalForeignApi::class)
    fun read(buf: CValuesRef<*>?, count: ULong, offset: Long? = null): Long {
        if (offset != null) {
            lseek(offset)
        }
        return read(fd, buf, count)
    }

    @OptIn(ExperimentalForeignApi::class)
    fun write(buf: CValuesRef<*>?, count: ULong, offset: Long? = null): Long {
        if (offset != null) {
            lseek(offset)
        }
        return write(fd, buf, count)
    }

    @OptIn(ExperimentalForeignApi::class)
    private inline fun <reified T : CVariable, R> read(offset: Long? = null, block: (T) -> R): R? {
        if (offset != null) {
            lseek(offset)
        }
        return memScoped {
            val buf = alloc<T>()
            buf.ptr.toLong()
            val read = read(buf.ptr, sizeOf<T>().toULong())
            if (read >= 0) block(buf) else null
        }
    }

    @OptIn(ExperimentalForeignApi::class)
    private inline fun <reified T : CVariable> write(offset: Long? = null, block: (T) -> Unit): Long {
        if (offset != null) {
            lseek(offset)
        }
        return memScoped {
            val buf = alloc<T>()
            block(buf)
            write(buf.ptr, sizeOf<T>().toULong())
        }
    }

    // region read
    @OptIn(ExperimentalForeignApi::class)
    fun readBoolean(offset: Long? = null): Boolean? = read<BooleanVar, Boolean>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readByte(offset: Long? = null): Byte? = read<ByteVar, Byte>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readShort(offset: Long? = null): Short? = read<ShortVar, Short>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readInt(offset: Long? = null): Int? = read<IntVar, Int>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readLong(offset: Long? = null): Long? = read<LongVar, Long>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readUByte(offset: Long? = null): UByte? = read<UByteVar, UByte>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readUShort(offset: Long? = null): UShort? = read<UShortVar, UShort>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readUInt(offset: Long? = null): UInt? = read<UIntVar, UInt>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readULong(offset: Long? = null): ULong? = read<ULongVar, ULong>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readFloat(offset: Long? = null): Float? = read<FloatVar, Float>(offset) { it.value }

    @OptIn(ExperimentalForeignApi::class)
    fun readDouble(offset: Long? = null): Double? = read<DoubleVar, Double>(offset) { it.value }
    // endregion

    // region write
    @OptIn(ExperimentalForeignApi::class)
    fun writeBoolean(value: Boolean, offset: Long? = null): Long = write<BooleanVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeByte(value: Byte, offset: Long? = null): Long = write<ByteVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeShort(value: Short, offset: Long? = null): Long = write<ShortVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeInt(value: Int, offset: Long? = null): Long = write<IntVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeLong(value: Long, offset: Long? = null): Long = write<LongVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeUByte(value: UByte, offset: Long? = null): Long = write<UByteVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeUShort(value: UShort, offset: Long? = null): Long = write<UShortVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeUInt(value: UInt, offset: Long? = null): Long = write<UIntVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeULong(value: ULong, offset: Long? = null): Long = write<ULongVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeFloat(value: Float, offset: Long? = null): Long = write<FloatVar>(offset) { it.value = value }

    @OptIn(ExperimentalForeignApi::class)
    fun writeDouble(value: Double, offset: Long? = null): Long = write<DoubleVar>(offset) { it.value = value }
    // endregion
}
```

使用 `gradle build` 命令构建，可执行文件在 `build/bin/androidNativeArm64/releaseExecutable/KotlinNativeTemplate.kexe`

使用 `adb push build/bin/androidNativeArm64/releaseExecutable/KotlinNativeTemplate.kexe /data/local/tmp` 命令将可执行文件推送到手机 `/data/local/tmp` 中

使用 `adb shell ps -A | grep [进程名称]` 命令查看进程的 `pid`

使用 GG 或者 CE 找出地址 `address`

使用 `adb shell` 命令进入手机的 shell

使用 `su` 命令切换到 root 用户

使用 `cd /data/local/tmp` 命令进入可执行文件的目录

使用 `chmod +x ./KotlinNativeTemplate.kexe` 命令修改可执行文件的权限

`byPtrace()` 或者 `byProc()` 使用 `./KotlinNativeTemplate.kexe [pid] [address]` 命令运行

`auto()` 使用 `./KotlinNativeTemplate.kexe` 命令来查看阳光，使用 `./KotlinNativeTemplate.kexe [阳光数量]` 命令来修改阳光
