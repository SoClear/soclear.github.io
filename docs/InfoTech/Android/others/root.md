# 执行root命令

```kotlin
fun suExecute(command: String): String? {
    var process: Process? = null
    var inputStream: InputStream? = null
    var outputStream: OutputStream? = null
    return try {
        process = Runtime.getRuntime().exec("su")
        inputStream = process.inputStream
        outputStream = process.outputStream

        outputStream.run {
            write("$command\n".toByteArray())
            write("exit\n".toByteArray())
            flush()
        }

        inputStream.bufferedReader().readText()
    } catch (_: Exception) {
        null
    } finally {
        try {
            process?.destroy()
            inputStream?.close()
            outputStream?.close()
        } catch (_: Exception) {
        }
    }
}
```
