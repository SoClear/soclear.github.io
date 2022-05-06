# 进程、线程与消息通信

## 不要通过 Intent 在 Android 基础组件之间传递大数据【强制】

不要通过 Intent 在 Android 基础组件之间传递大数据（binder transaction 缓存为 1MB），可能导致 OOM。

## 确保只在自己需要的进程初始化【强制】

在 Application 的业务初始化代码加入进程判断，确保只在自己需要的进程初始化。  
特别是后台进程减少不必要的业务初始化。

正例：

```java
public class MyApplication extends Application {
    @Override
    public void onCreate() {
        //在所有进程中初始化
        ....
        //仅在主进程中初始化
        if (mainProcess) {
            ...
        }
        //仅在后台进程中初始化
        if (bgProcess) {
            ...
        }
    }
}
```

## 通过线程池创建新线程【强制】

新建线程时，必须通过线程池提供（AsyncTask 或者 ThreadPoolExecutor或者其他形式自定义的线程池），不允许在应用中自行显式创建线程。

说明：

使用线程池的好处是减少在创建和销毁线程上所花的时间以及系统资源的开销，解决资源不足的问题。  
如果不使用线程池，有可能造成系统创建大量同类线程而导致消耗完内存或者“过度切换”的问题。  
另外创建匿名线程不便于后续的资源使用分析，对性能分析等会造成困扰。

正例：

```java
int NUMBER_OF_CORES = Runtime.getRuntime().availableProcessors();
int KEEP_ALIVE_TIME = 1;
TimeUnit KEEP_ALIVE_TIME_UNIT = TimeUnit.SECONDS;
BlockingQueue<Runnable> taskQueue = new LinkedBlockingQueue<Runnable>();
ExecutorService executorService = new ThreadPoolExecutor(NUMBER_OF_CORES,
        NUMBER_OF_CORES * 2, KEEP_ALIVE_TIME, KEEP_ALIVE_TIME_UNIT, taskQueue,
        new BackgroundThreadFactory(), new DefaultRejectedExecutionHandler());
//执行任务
executorService.execute(new Runnnable() {
    ...
});
```

反例：

```java
new Thread(new Runnable() {
    @Override
    public void run() {
        //操作语句
        ...
    }
}).start();
```

## 通过 ThreadPoolExecutor 创建线程池

线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 的方式，这样的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险。

说明：

Executors 返回的线程池对象的弊端如下：

- FixedThreadPool 和 SingleThreadPool ：允许的请求队列长度为Integer.MAX_VALUE，可能会堆积大量的请求，从而导致 OOM。
- CachedThreadPool 和 ScheduledThreadPool ：允许创建线程数量为 Integer.MAX_VALUE，可能会创建大量的线程，从而导致 OOM。

正例：

```java
int NUMBER_OF_CORES = Runtime.getRuntime().availableProcessors();
int KEEP_ALIVE_TIME = 1;
TimeUnit KEEP_ALIVE_TIME_UNIT = TimeUnit.SECONDS;
BlockingQueue<Runnable> taskQueue = new LinkedBlockingQueue<Runnable>();
ExecutorService executorService = new ThreadPoolExecutor(NUMBER_OF_CORES, 
NUMBER_OF_CORES*2, KEEP_ALIVE_TIME, KEEP_ALIVE_TIME_UNIT, 
taskQueue, new BackgroundThreadFactory(), new DefaultRejectedExecutionHandler());
```

反例：

```java
ExecutorService cachedThreadPool = Executors.newCachedThreadPool();
```

## 子线程中不能更新界面【强制】

子线程中不能更新界面，更新界面必须在主线程中进行，网络操作不能在主线程中调用。

## 不要在非 UI 线程中初始化 ViewStub，否则会返回 null【强制】

## 尽量减少不同 APP 之间的进程间通信及拉起行为【推荐】

尽量减少不同 APP 之间的进程间通信及拉起行为。拉起导致占用系统资源，影响用户体验。

## 新建线程时，定义能识别自己业务的线程名称，便于性能优化和问题排查【推荐】

正例：

```java
public class MyThread extends Thread {
    public MyThread() {
        super.setName("ThreadName");
        ……
    }
}
```

## ThreadPoolExecutor 设置线程存活时间(setKeepAliveTime)，确保空闲时线程能被释放【推荐】

## 禁止在多进程之间用SharedPreferences共享数据【推荐】

禁止在多进程之间用SharedPreferences共享数据，虽然可以(MODE_MULTI_PROCESS)，但官方已不推荐。

## 谨慎使用 Android 的多进程【推荐】

谨慎使用 Android 的多进程，多进程虽然能够降低主进程的内存压力，但会遇到如下问题：

- 不能实现完全退出所有 Activity 的功能；
- 首次进入新启动进程的页面时会有延时的现象（有可能黑屏、白屏几秒，是白屏还是黑屏和新 Activity 的主题有关）；
- 应用内多进程时，Application 实例化多次，需要考虑各个模块是否都需要在所有进程中初始化；
- 多进程间通过 SharedPreferences 共享数据时不稳定。
