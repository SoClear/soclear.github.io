# JDK8时间类

JDK8 时间相关  
**注意：所有对时间的修改不会修改原有对象，而是返回新对象**

## ZoneId 时区

```kotlin
// 获取所有时区名称
ZoneId.getAvailableZoneIds()
// 获取系统当前默认时区
ZoneId.systemDefault()
// 获取指定时区
ZoneId.of("Asia/Shanghai")
```

## Instant 时间戳

```kotlin
// 当前时间戳
Instant.now()
// 从1970年1月1日起的3毫秒后的时间戳
Instant.ofEpochMilli(3L)
// 从1970年1月1日起的1秒零1000000000纳秒后的时间戳
Instant.ofEpochSecond(1L, 1000000000L)
// 指定时区，返回值是 ZonedDateTime
Instant.now().atZone(ZoneId.of("Asia/Shanghai"))

// 比较时间戳 isXXX
val instant1 = Instant.ofEpochMilli(0L)
val instant2 = Instant.ofEpochMilli(1000L)
println(instant1.isBefore(instant2))

// 加减时间戳
val instant3 = Instant.ofEpochSecond(1L)
println(instant3.minusSeconds(1L))
println(instant3.plusSeconds(3L))
```

## ZonedDateTime 带时区的时间

```kotlin
// 当前带时区的时间
ZonedDateTime.now()
// 以年月日时分秒纳秒和时区的方式指定时间
ZonedDateTime.of(2022, 11, 11, 11, 11, 11, 11, ZoneId.of("Asia/Shanghai"))

// 通过Instant加时区的方式指定时间
val instant4 = Instant.now()
val zoneId4 = ZoneId.of("Asia/Shanghai")
val zonedDateTime1 = ZonedDateTime.ofInstant(instant4, zoneId4)

// withXXX 修改时间
zonedDateTime1.withYear(2023)
// minusXXX plusXXX 加减时间
zonedDateTime1.minusYears(1)
zonedDateTime1.plusDays(2)
```

## DateTimeFormatter 日期时间格式化

```kotlin
val zonedDateTime2 = Instant.now().atZone(ZoneId.of("Asia/Shanghai"))
val dateTimeFormatter2 = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss EEEE a")
println(dateTimeFormatter2.format(zonedDateTime2))
```

## 本地时间相关

```kotlin
/**
 * Calendar 日期类
 * LocalDate 年月日
 * LocalTime 时分秒纳秒
 * LocalDateTime 年月日时分秒
 * MonthDay 月日
 */
// 当前时间
LocalDate.now()
LocalTime.now()
LocalDateTime.now()

// 指定时间
val time1 = LocalDate.of(2022, 11, 11)
val time2 = LocalTime.of(11, 11, 11)
val time3 = LocalDateTime.of(2022, 11, 11, 11, 11, 11)

// 获取属性
// NOVEMBER
time1.month
// 11
time1.monthValue
// 获取小时
time2.hour
// 获取一月中的第几天
time3.dayOfMonth
// 获取一周中的第几天，FRIDAY
time3.dayOfWeek
// 获取一周中的第几天，5
println(time3.dayOfWeek.value)
// 获取一年中的第几天
time3.dayOfYear

// isXXX 比较时间
time3.isBefore(LocalDateTime.now())
time3.isAfter(LocalDateTime.now())

// 修改时间
time3.withYear(2022)
time3.minusMonths(2)
time3.plusDays(2)

// 判断生日
// 生日
val birthday = LocalDate.of(2000, 11, 13)
// 生日的月日
val birthdayMonthDay = MonthDay.from(birthday)
// 当前月日
val nowMonthDay = MonthDay.of(birthday.month, birthday.dayOfMonth)
// 判断是否相等
println(nowMonthDay.equals(birthdayMonthDay))
```

## 时间间隔

```kotlin
/**
 * 时间间隔
 * Period 时间间隔，年月日
 * Duration 时间间隔，秒 纳秒
 * ChronoUnit 时间间隔，所有单位
 */
// Period
val today2 = LocalDate.now()
val birthday2 = LocalDate.of(2000,11,11)
// 第二个参数减去第一个参数
val period = Period.between(birthday2,today2)
// PaaYbbMbbD，Period aa 年 bb 月 cc 日
println(period)
// 相差多少年
println(period.years)
// 相差多少月
println(period.months)
// 相差多少日
println(period.days)

// Duration
val today3 = LocalDateTime.now()
val birthday3 = LocalDateTime.of(2022,11,11,11,11,11)
// PTaaHbbMcc.dd aa 小时 bb 分钟 cc.dd秒
val duration = Duration.between(birthday3, today3)
// 相差天数
duration.toDays()
// 相差小时数
duration.toHours()
// 相差分钟数
duration.toMinutes()
// 相差毫秒数
duration.toMillis()
// 相差纳秒数
duration.toNanos()

// ChronoUnit
ChronoUnit.YEARS.between(birthday3,today3)
ChronoUnit.MONTHS.between(birthday3,today3)
ChronoUnit.WEEKS.between(birthday3,today3)
ChronoUnit.DAYS.between(birthday3,today3)
ChronoUnit.HOURS.between(birthday3,today3)
ChronoUnit.MINUTES.between(birthday3,today3)
ChronoUnit.SECONDS.between(birthday3,today3)
ChronoUnit.MILLIS.between(birthday3,today3)
ChronoUnit.MICROS.between(birthday3,today3)
ChronoUnit.NANOS.between(birthday3,today3)
// 半天
ChronoUnit.HALF_DAYS.between(birthday3,today3)
// 十年
ChronoUnit.DECADES.between(birthday3,today3)
// 百年
ChronoUnit.CENTURIES.between(birthday3,today3)
// 千年
ChronoUnit.MILLENNIA.between(birthday3,today3)
// 纪元，一个纪元等于十亿年
ChronoUnit.ERAS.between(birthday3,today3)
```
