# Service

安卓的Service是一种应用组件，它可以在后台执行长时间运行的操作而不需要用户界面。Service 主要用于处理那些无需用户交互但需要长期运行的任务，比如播放音乐、处理网络请求、或在后台执行文件下载等。它可以运行在主线程或独立的工作线程中。

## Service的生命周期

- **onCreate()** ：当服务首次创建时调用。用于执行一次性的初始化操作。
- **onStartCommand(Intent intent, int flags, int startId)** ：每次通过`startService()`方法启动服务时调用。可以在这里处理每次启动服务的请求。
- **onBind(Intent intent)** ：当组件通过`bindService()`方法绑定到服务时调用。返回一个IBinder接口，用于客户端与服务之间的通信。如果不允许绑定，返回null。
- **onUnbind(Intent intent)** ：当所有绑定的组件解绑时调用。
- **onRebind(Intent intent)** ：当有新的客户端绑定到服务时调用，且之前调用过`onUnbind`。
- **onDestroy()** ：服务销毁时调用。用于清理资源。

## Service的类型

### 1 按照是否绑定组件

分为 Started Service（启动服务）和 Bound Service（绑定服务）

#### 1.1 **Started Service（启动服务）**

通过调用`startService()`方法启动。当服务启动后，它可以在后台无限期地运行，即使启动它的组件（如Activity）被销毁。服务需要通过调用`stopSelf()`或`stopService()`方法来停止。

1.1.1 创建服务类

```kotlin
class MyService : Service() {

    override fun onCreate() {
        super.onCreate()
        // 初始化操作
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        thread {
            // Service的具体操作
            stopSelf()
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        // 清理操作
    }
}
```

1.1.2 声明服务

确保在 `AndroidManifest.xml` 中声明你的服务：

```xml
<service android:name=".MyService" />
```

1.1.3 启动服务

```kotlin
val myServiceIntent = Intent(context, MyService::class.java)
context.startService(myServiceIntent)
```

1.1.4 停止服务

```kotlin
context.stopService(myServiceIntent)
```

#### 1.2 **Bound Service（绑定服务）**

通过调用`bindService()`方法启动。当一个组件（如Activity）通过绑定方式连接到服务时，可以与服务进行通信，发送请求，获取结果。绑定服务只在有组件绑定时运行，当所有绑定的组件解绑后，服务会销毁。

1.2.1 创建服务类

```kotlin
import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import android.util.Log

class MyBoundService : Service() {

    private val binder = LocalBinder()

    // Binder class to return the current instance of MyBoundService
    inner class LocalBinder : Binder() {
        fun getService(): MyBoundService = this@MyBoundService
    }

    override fun onBind(intent: Intent?): IBinder {
        Log.d(TAG, "onBind")
        return binder
    }

    override fun onUnbind(intent: Intent?): Boolean {
        Log.d(TAG, "onUnbind")
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        Log.d(TAG, "onDestroy")
        super.onDestroy()
    }

    fun getRandomNumber(): Int {
        return (1..100).random()
    }

    companion object {
        private const val TAG = "MyBoundService"
    }
}
```

1.2.2 声明服务

确保在 `AndroidManifest.xml` 中声明你的服务：

```xml
<service android:name=".MyBoundService" />
```

1.2.3 绑定服务

在你的 `Activity` 中绑定到服务，并使用服务的方法：

示例代码：MainActivity.kt

```kotlin
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private var myBoundService: MyBoundService? = null
    private var isBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as MyBoundService.LocalBinder
            myBoundService = binder.getService()
            isBound = true
            Log.d(TAG, "Service Connected")
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            isBound = false
            Log.d(TAG, "Service Disconnected")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Bind to MyBoundService
        Intent(this, MyBoundService::class.java).also { intent ->
            bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (isBound) {
            unbindService(serviceConnection)
            isBound = false
        }
    }

    companion object {
        private const val TAG = "MainActivity"
    }
}
```

1.2.4 使用服务方法

通过 `myBoundService` 引用，你可以调用服务中的方法。例如：

```kotlin
override fun onStart() {
    super.onStart()
    if (isBound) {
        val randomNumber = myBoundService?.getRandomNumber()
        Log.d(TAG, "Random Number: $randomNumber")
    }
}
```

### 2 按照前后台分

分为 Background Service（ 后台服务）和 Foreground Service（前台服务）

#### 2.1 **Background Service（ 后台服务）**

后台服务是默认的Service类型，是不需要用户意识到其存在的Service，通常在用户不需要直接交互的情况下运行。后台Service的优先级较低，系统在内存不足时可能会终止它。

**特性：**

1. **无通知要求**：后台Service不需要显示通知，用户通常不会直接意识到它的存在。
2. **较低优先级**：由于后台Service的优先级较低，系统在内存不足的情况下，会优先终止后台Service以释放资源。这对短期任务或是资源不紧张的任务是合适的。
3. **任务执行**：后台Service适合用于执行短时间的后台任务，比如数据同步、文件上传等。

代码示例

```kotlin
class MyBackgroundService : Service() {

    override fun onCreate() {
        super.onCreate()
        // 初始化操作
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        thread {
            // Service的具体操作
            stopSelf()
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        // 清理操作
    }
}
```

#### 2.2 **Foreground Service（前台服务）**  

前台Service是用户意识到其存在的Service，它具有更高的优先级，不容易被系统杀掉。前台Service通常用于需要持续通知用户的任务，比如音乐播放、下载文件、或是位置跟踪等。

**特性：**

1. **通知栏显示** ：前台Service必须在启动后立即显示一个通知。这个通知会一直显示在通知栏，直到Service被停止为止。这保证了用户知道有一个Service正在运行。
2. **高优先级** ：前台Service被赋予了较高的优先级，系统在内存不足的情况下，不会轻易终止它。这对需要长期运行的任务非常重要。
3. **用户交互** ：由于前台Service必须显示通知，用户可以通过通知栏与其进行交互。这通常会提供停止或暂停Service的选项。

使用方式：`startForeground(NOTIFICATION_ID, createNotification(CHANNEL_ID))`  
创建前台服务需要确保在代码中创建通知渠道并显示通知，以满足Android 8.0及更高版本的要求。  
注意！创建渠道的 channelId 必须和创建通知的 channelId 一致

```kotlin
class MyForegroundService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 前台服务
        startForeground(NOTIFICATION_ID, createNotification(CHANNEL_ID))
        // Service的具体操作
        Log.i(TAG, "执行任务A")
        thread {
            Log.i(TAG, "执行任务B")
            Thread.sleep(5000L)
            stopSelf()
        }

        return START_STICKY
    }

    // 创建通知渠道
    private fun createNotificationChannel(channelId: String) {
        // 从 Android 8.0（API 级别 26）开始，所有通知必须分配到一个渠道。
        // 你需要在创建通知前创建通知渠道。
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                channelId,
                "Foreground Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager: NotificationManager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    // 创建通知
    private fun createNotification(channelId: String): Notification {
        // 注意！创建渠道的 channelId 必须和创建通知的 channelId 一致
        createNotificationChannel(channelId)

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("前台服务")
            .setContentText("服务正在运行...")
            .setSmallIcon(R.drawable.dice_1)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val CHANNEL_ID = "MyForegroundServiceChannel"
        private const val NOTIFICATION_ID = 1
        private const val TAG = "MyForegroundService"
    }
}
```

## 声明Service

Service 必须在清单文件中注册。这是为了让Android系统知道应用中存在这些Service，并能够正确地管理它们的生命周期。  
前台服务需要声明其类型 `android:foregroundServiceType="【替换成你的前台服务类型】"`。

```xml
<!-- 后台服务 -->
<service android:name=".capture.MyService" />
<!-- 前台服务 -->
<service
    android:name=".capture.MyForegroundService"
    android:foregroundServiceType="shortService" />
```
