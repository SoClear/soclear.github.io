# Timing API

## Time Measurement

### Wall clock

Wall clock time is influenced by the system clock, which can be adjusted by the user or the operating system, for example, by the user to synchronize the system clock with a time server.

Java's `System.currentTimeMillis()` is wall clock time, which is not suitable for measuring time intervals.

### Monotonic clock

Monotonic clock is a clock that is not affected by system clock adjustments, such as time synchronization.

Java's `System.nanoTime()` is monotonic clock, which is suitable for measuring time intervals.

### Kotlin time measurement

Kotlin provides `kotlin.time.measureTime` and `kotlin.time.measureTimedValue` functions to measure time intervals.

```kotlin
val duration = measureTime {
    println("Hello World")
}
println("took $duration")

val (value, duration2) = measureTimedValue {
    println("Hello World")
    6
}
println("value is $value , took $duration2")
```

## Duration

Kotlin provides `kotlin.time.Duration` class to represent time intervals.

```kotlin
val duration3 = 2.5.seconds
val duration4 = 2456.milliseconds
println("took $duration3 took $duration4")

delay(2.seconds + 250.milliseconds)

println(25.seconds.inWholeMilliseconds)
println(63.minutes.inWholeNanoseconds)
// 求完整的分钟：160秒等于2分40秒，完整的分钟为2
println(160.seconds.inWholeMinutes)

println(32.seconds.toDouble(DurationUnit.MINUTES))

val duration5 = 534_600.seconds
duration5.toComponents{days, hours, minutes, seconds , nanoseconds->
    println(days)
    println(hours)
    println(minutes)
}

println(200_200.seconds.toIsoString())
println(Duration.parseIsoString("PT55H36M40S"))
```

## Advanced Time Measurement

for example, writing a plugin:

```kotlin
import kotlin.time.ComparableTimeMark
import kotlin.time.Duration
import kotlin.time.TimeSource

interface FrameworkPlugin {
    fun initialize()
    fun allocateResources()
}

class StopWatchPlugin(private val timeSource: TimeSource.WithComparableMarks) : FrameworkPlugin {
    private lateinit var startTime: ComparableTimeMark
    private lateinit var endTime: ComparableTimeMark
    var duration: Duration? = null; private set

    override fun initialize() {
        startTime = timeSource.markNow()
    }

    override fun allocateResources() {
        endTime = timeSource.markNow()
        duration = endTime - startTime
    }
}
```

another example, measure time interval of every step:

```kotlin
import kotlin.time.TimeSource.Monotonic.ValueTimeMark
import kotlin.time.TimeSource.Monotonic.markNow

object Service {
    fun initialize() {}
    fun allocateResources() {}
    fun reticulateSplines() {}
}

data class Record(val label: String, val mark: ValueTimeMark)

infix fun String.at(mark: ValueTimeMark) = Record(this, mark)

val records = mutableListOf<Record>()

private fun main() {
    records.add("Started" at markNow())

    Service.initialize()
    records.add("Service initialized" at markNow())

    Service.allocateResources()
    records.add("Resource allocated" at markNow())

    Service.reticulateSplines()
    records.add("Resource reticulateSplines" at markNow())

    println("-------------")

    records.windowed(2) {(previous, current) ->
        println("${current.label} in ${current.mark - previous.mark}")
    }

    println("Total time: ${records.last().mark - records.first().mark}")
}
```
