# 其他

## 不要通过 Msg 传递大的对象，会导致内存问题【强制】

## 不能使用 `System.out.println` 打印 log【强制】

正例：

`Log.d(TAG, "Some Android Debug info ...");`

反例：

`System.out.println("System out println ...");`

## Log 的 tag 不能是" "【强制】

说明：

日志的 tag 是空字符串没有任何意义，也不利于过滤日志。

正例：

```java
private static String TAG = "LoginActivity";
Log.e(TAG, "Login failed!");
```

反例：

```java
Log.e("", "Login failed!");
```
