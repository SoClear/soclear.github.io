# HexFormat

## 整数与 Hex String 互转

```kotlin
val byte:Byte = 0x20
val hexString = byte.toHexString()
// 20
println(hexString)
// 32
println("20".hexToByte())
```

`toHexString()` 会根据整数的位数自动补 0 ：

```kotlin
val short:Short = 0x20
// 0020
println(short.toHexString())
```

## 修改 HexString 的格式

```kotlin
val short:Short = 0x20

// 修改 HexString 的格式
val format = HexFormat {
    // 指定前缀
    number.prefix = "%"
    // 去掉前面的0
    number.removeLeadingZeros = true
}

// %20
println(short.toHexString(format))
// 32
println("%20".hexToByte(format))
```

## ByteArray 转 IPv6 String

```kotlin
val array = Random.Default.nextBytes(16)

val ipv6Format = HexFormat {
    upperCase = true
    bytes.bytesPerGroup = 2
    bytes.groupSeparator =":"
}
// 3CF8:6F77:3D36:A5D4:B6BF:4D01:5439:FC84
println(array.toHexString(ipv6Format))
```
