# Android 基本组件

Android 基本组件指 Activity、Fragment、Service、BroadcastReceiver、ContentProvider 等等。

## Activity 间的数据通信【强制】

Activity 间的数据通信，对于数据量比较大的，  
避免使用 Intent + Parcelable的方式，  
可以考虑 EventBus 等替代方案，  
以免造成 TransactionTooLargeException。  

## Activity#onSaveInstanceState()方法不保证一定会被调用【推荐】

Activity#onSaveInstanceState()方法不是 Activity 生命周期方法，也不保证一定会被调用。  
它是用来在 Activity 被意外销毁时保存 UI 状态的，只能用于保存临时性数据，例如 UI 控件的属性等，不能跟数据的持久化存储混为一谈。
持久化存储应该在 Activity#onPause()/onStop()中实行。

## 跳转Activity前检查resolveActivity【强制】

Activity 间通过隐式 Intent 的跳转，在发出 Intent 之前必须通过 resolveActivity
检查，避免找不到合适的调用组件，造成 ActivityNotFoundException 的异常。

正例：

```java
public void viewUrl(String url, String mimeType) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(Uri.parse(url), mimeType);
        if (getPackageManager().resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY) != null) {
            try {
                startActivity(intent);
            } catch (ActivityNotFoundException e) {
                if (Config.LOGD) {
                    Log.d(LOGTAG, "activity not found for " + mimeType + " over " + Uri.parse(url).getScheme(), e);
                }
            }
        }
    }
```

反例：

```java
Intent intent = new Intent();
intent.setAction("com.great.activity_intent.Intent_Demo1_Result3");
```

## 避免在 Service#onStartCommand()/onBind()方法中执行耗时操作【强制】

避免在 Service#onStartCommand()/onBind()方法中执行耗时操作，
如果确实有需求，应改用 IntentService 或采用其他异步机制完成。

正例：

```java
public class MainActivity extends Activity {
        @Override
        public void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.main);
        }

        public void startIntentService(View source) {
            Intent intent = new Intent(this, MyIntentService.class);
            startService(intent);
        }
    }

    public class MyIntentService extends IntentService {
        public MyIntentService() {
            super("MyIntentService");
        }

        @Override
        protected void onHandleIntent(Intent intent) {
            synchronized (this) {
                try {
                    // ...
                } catch (Exception e) {
                    // ...
                }
            }
        }
    }
```

## 避免在 BroadcastReceiver#onReceive()中执行耗时操作【强制】

避免在 BroadcastReceiver#onReceive()中执行耗时操作，
如果有耗时工作，应该创建 IntentService 完成，而不应该在 BroadcastReceiver 内创建子线程去做。

说明：  
由于该方法是在主线程执行，如果执行耗时操作会导致 UI 不流畅。可以使用
IntentService 、 创 建 HandlerThread 或者调用 Context#registerReceiver
(BroadcastReceiver, IntentFilter, String, Handler)方法等方式，在其他 Wroker 线程
执行 onReceive 方法。BroadcastReceiver#onReceive()方法耗时超过 10 秒钟，可
能会被系统杀死。

正例：

```java
IntentFilter filter = new IntentFilter();
filter.addAction(LOGIN_SUCCESS);
this.registerReceiver(mBroadcastReceiver, filter);
mBroadcastReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        Intent userHomeIntent = new Intent();
        userHomeIntent.setClass(this, UseHomeActivity.class);
        this.startActivity(userHomeIntent);
    }
};
```

反例：

```java
mBroadcastReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        MyDatabaseHelper myDB = new MyDatabaseHelper(context);
        myDB.initData();
        // have more database operation here
    }
};
```

## 避免使用隐式 Intent 广播敏感信息【强制】

避免使用隐式 Intent 广播敏感信息，信息可能被其他注册了对应BroadcastReceiver 的 App 接收。

说明：

通过 Context#sendBroadcast()发送的隐式广播会被所有感兴趣的 receiver 接收，恶
意应用注册监听该广播的 receiver 可能会获取到 Intent 中传递的敏感信息，并进行
其他危险操作。如果发送的广播为使用 Context#sendOrderedBroadcast()方法发送
的有序广播，优先级较高的恶意 receiver 可能直接丢弃该广播，造成服务不可用，
或者向广播结果塞入恶意数据。

如果广播仅限于应用内，则可以使用 LocalBroadcastManager#sendBroadcast()实
现，避免敏感信息外泄和 Intent 拦截的风险。

正例：

```java
Intent intent = new Intent("my-sensitive-event");
intent.putExtra("event", "this is a test event");
LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
```

反例：

```java
Intent intent = new Intent();
v1.setAction("com.sample.action.server_running");
v1.putExtra("local_ip", v0.h);
v1.putExtra("port", v0.i);
v1.putExtra("code", v0.g);
v1.putExtra("connected", v0.s);
v1.putExtra("pwd_predefined", v0.r);
if (!TextUtils.isEmpty(v0.t)) {
    v1.putExtra("connected_usr", v0.t);
}
context.sendBroadcast(v1);
```

以上广播可能被其他应用的如下 receiver 接收导致敏感信息泄漏

```java
final class MyReceiver extends BroadcastReceiver {
    public final void onReceive(Context context, Intent intent) {
        if (intent != null && intent.getAction() != null) {
            String s = intent.getAction();
            if (s.equals("com.sample.action.server_running") {
                String ip = intent.getStringExtra("local_ip");
                String pwd = intent.getStringExtra("code");
                String port = intent.getIntExtra("port", 8888);
                boolean status = intent.getBooleanExtra("connected", false);
            }
        }
    }
}
```

## 添加fragment时FragmentTransaction相关【推荐】

添加 Fragment 时 ， 确保 FragmentTransaction#commit() 在Activity#onPostResume()或者 FragmentActivity#onResumeFragments()内调用。  
不要随意使用 FragmentTransaction#commitAllowingStateLoss()来代替，
任何commitAllowingStateLoss()的使用必须经过 code review，确保无负面影响。

说明：

Activity可能因为各种原因被销毁，Android支持页面被销毁前通过Activity#onSaveInstanceState()保存自己的状态。  
但如果FragmentTransaction.commit()发生在 Activity 状态保存之后，就会导致 Activity 重建、恢复状态时无法还原页面状态，从而可能出错。  
为了避免给用户造成不好的体验，系统会抛出 IllegalStateExceptionStateLoss 异常。
推荐的做法是在 Activity 的 onPostResume() 或 onResumeFragments() （ 对 FragmentActivity ）里执行 FragmentTransaction.commit()，如有必要也可在 onCreate()里执行。  
不要随意改用 FragmentTransaction.commitAllowingStateLoss() 或者直接使用 try-catch 避免crash，这不是问题的根本解决之道，当且仅当你确认 Activity 重建、恢复状态时，本次 commit 丢失不会造成影响时才可这么做。

正例：

```java
public class MainActivity extends FragmentActivity {
    FragmentManager fragmentManager;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main2);
        fragmentManager = getSupportFragmentManager();
        FragmentTransaction ft = fragmentManager.beginTransaction();
        MyFragment fragment = new MyFragment();
        ft.replace(R.id.fragment_container, fragment);
        ft.commit();
    }
}
```

反例：

```java
public class MainActivity extends FragmentActivity {
    FragmentManager fragmentManager;

    @Override
    public void onSaveInstanceState(Bundle outState, PersistableBundle outPersistentState) {
        super.onSaveInstanceState(outState, outPersistentState);
        fragmentManager = getSupportFragmentManager();
        FragmentTransaction ft = fragmentManager.beginTransaction();
        MyFragment fragment = new MyFragment();
        ft.replace(R.id.fragment_container, fragment);
        ft.commit();
    }
}
```

## 不要在 Activity#onDestroy()内执行释放资源的工作【推荐】

不要在 Activity#onDestroy()内执行释放资源的工作，例如一些工作线程的销毁和停止。
因为 onDestroy()执行的时机可能较晚。
可根据实际需要，在Activity#onPause()/onStop()中结合 isFinishing()的判断来执行。

## 如非必须，避免使用嵌套的 Fragment。【推荐】

说明：

嵌套 Fragment 是在 Android API 17 添加到 SDK 以及 Support 库中的功能，
Fragment 嵌套使用会有一些坑，容易出现 bug，比较常见的问题有如下几种：

- onActivityResult()方法的处理错乱，内嵌的 Fragment 可能收不到该方法的回调，
需要由宿主 Fragment 进行转发处理；
- 突变动画效果；
- 被继承的 setRetainInstance()，导致在 Fragment 重建时多次触发不必要的逻
辑。

非必须的场景尽可能避免使用嵌套 Fragment，如需使用请注意上述问题。

正例：

```java
FragmentManager fragmentManager = getFragmentManager();
Fragment fragment = fragmentManager.findFragmentByTag(FragmentB.TAG);
if (null == fragment) {
    FragmentB fragmentB = new FragmentB();
    FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
    fragmentTransaction.add(R.id.fragment_container, fragmentB,
            FragmentB.TAG).commit();
}
```

反例：

```java
Fragment videoFragment = new VideoPlayerFragment();
FragmentTransaction transaction = 
currentFragment.getChildFragmentManager().beginTransaction();
transaction.add(R.id.video_fragment, videoFragment).commit();
```

## 总是使用显式 Intent 启动或者绑定 Service【推荐】

总是使用显式 Intent 启动或者绑定 Service，且不要为服务声明 Intent Filter，
保证应用的安全性。如果确实需要使用隐式调用，则可为 Service 提供 Intent Filter
并从 Intent 中排除相应的组件名称，但必须搭配使用 Intent#setPackage()方法设置
Intent 的指定包名，这样可以充分消除目标服务的不确定性。

## 使用 IntentService代替 Service 以多线程来并发处理多个启动请求【推荐】

Service 需要以多线程来并发处理多个启动请求，建议使用 IntentService，
可避免各种复杂的设置。

说明：

Service 组件一般运行主线程，应当避免耗时操作，如果有耗时操作应该在 Worker
线程执行。 可以使用 IntentService 执行后台任务。

正例：

```java
public class SingleIntentService extends IntentService {
    public SingleIntentService() {
        super("single-service thread");
    }
    @Override
    protected void onHandleIntent(Intent intent) {
        try {
            // 。。。
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

反例：

```java
public class HelloService extends Service {
 ...
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Toast.makeText(this, "service starting", Toast.LENGTH_SHORT).show();
        new Thread(new Runnable() {
            @Override
            public void run() {
                //操作语句
            }
        }).start();
 ...
    }
}
```

## 优先使用 LocalBroadcastManager

对于只用于应用内的广播，优先使用 LocalBroadcastManager 来进行注册
和发送，LocalBroadcastManager 安全性更好，同时拥有更高的运行效率。

说明：

对于使用 Context#sendBroadcast()等方法发送全局广播的代码进行提示。如果该广
播仅用于应用内，则可以使用 LocalBroadcastManager 来避免广播泄漏以及广播被
拦截等安全问题，同时相对全局广播本地广播的更高效。

正例：

```java
public class MainActivity extends ActionBarActivity {
    private MyReceiver receiver;
    private IntentFilter filter;
    private Context context;
    private static final String MY_BROADCAST_TAG = "com.example.localbroadcast";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        receiver = new MyReceiver();
        filter = new IntentFilter();
        filter.addAction(MY_BROADCAST_TAG);
        Button button = (Button) findViewById(R.id.button);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent();
                intent.setAction(MY_BROADCAST_TAG);
                LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
            }
        });
    }
    @Override
    protected void onResume() {
        super.onResume();
        LocalBroadcastManager.getInstance(context).registerReceiver(receiver, filter);
    }
    @Override
    protected void onPause() {
        super.onPause();
        LocalBroadcastManager.getInstance(context).unregisterReceiver(receiver);
    }
    class MyReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context arg0, Intent arg1) {
            // message received
        }
    }
}
```

反例：

所有广播都使用全局广播

```java
// In activity, sending broadcast
Intent intent = new Intent("com.example.broadcastreceiver.SOME_ACTION");
sendBroadcast(intent);
```

## 不要在 onPause 方法中做耗时较长的工作【推荐】

当前Activity的onPause方法执行结束后才会执行下一个Activity的onCreate
方法，所以在 onPause 方法中不适合做耗时较长的工作，这会影响到页面之间的跳
转效率。

## 不要在 Android 的 Application 对象中缓存数据。【强制】

不要在 Android 的 Application 对象中缓存数据。基础组件之间的数据共享
请使用 Intent 等机制，也可使用 SharedPreferences 等数据持久化机制。

反例：

```java
class MyApplication extends Application {
    String username;
    String getUsername() {
        return username;
    }
    void setUsername(String username) {
        this.username = username;
    }
}
class SetUsernameActivity extends Activity {
    void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.set_username);
        MyApplication app = (MyApplication) getApplication();
        app.setUsername("tester1");
        startActivity(new Intent(this, GetUsernameActivity.class));
    }
}
class GetUsernameActivity extends Activity {
    TextView tv;
    void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.get_username);
        tv = (TextView)findViewById(R.id.username);
    }
    void onResume() {
        super.onResume();
        MyApplication app = (MyApplication) getApplication();
        tv.setText("Welcome back ! " + app.getUsername().toUpperCase());
    }
}
```

## 定义一个全局的 Toast 对象【推荐】

使用 Toast 时，建议定义一个全局的 Toast 对象，这样可以避免连续显示
Toast 时不能取消上一次 Toast 消息的情况(如果你有连续弹出 Toast 的情况，避免
使用 Toast.makeText)。

## Adapter ViewHolder getView() convertView的每个子控件的属性【强制】

使用 Adapter 的时候，如果你使用了 ViewHolder 做缓存，在 getView()的
方法中无论这项 convertView 的每个子控件是否需要设置属性(比如某个 TextView
设置的文本可能为 null，某个按钮的背景色为透明，某控件的颜色为透明等)，都需
要为其显式设置属性(Textview 的文本为空也需要设置 setText("")，背景透明也需要
设置)，否则在滑动的过程中，因为 adapter item 复用的原因，会出现内容的显示错
乱。

正例：

```java
@Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder myViews;
        if (convertView == null) {
            myViews = new ViewHolder();
            convertView = mInflater.inflate(R.layout.list_item, null);
            myViews.mUsername = (TextView)convertView.findViewById(R.id.username);
            convertView.setTag(myViews);
        } else {
            myViews = (ViewHolder)convertView.getTag();
        }
        Info p = infoList.get(position);
        String dn = p.getDisplayName;
        三、Android 基本组件
        - 20 -
                myViews.mUsername.setText(StringUtils.isEmpty(dn) ? "" : dn);
        return convertView;
    }
    static class ViewHolder {
        private TextView mUsername;
    }
```

## Activity或者 Fragment 中动态注册BroadCastReceiver 时，registerReceiver()和 unregisterReceiver()要成对出现

说明：

如果 registerReceiver()和 unregisterReceiver()不成对出现，则可能导致已经注册的
receiver 没有在合适的时机注销，导致内存泄漏，占用内存空间，加重 SystemService
负担。
部分华为的机型会对 receiver 进行资源管控，单个应用注册过多 receiver 会触发管
控模块抛出异常，应用直接崩溃。

正例：

```java
public class MainActivity extends AppCompatActivity {
    private static MyReceiver myReceiver = new MyReceiver();
 ...
    @Override
    protected void onResume() {
        super.onResume();
        IntentFilter filter = new IntentFilter("com.example.myservice");
        registerReceiver(myReceiver, filter);
    }
    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceiver(myReceiver);
    }
 ...
}
```

反例：

```java
public class MainActivity extends AppCompatActivity {
    private static MyReceiver myReceiver;
    @Override
    protected void onResume() {
        super.onResume();
        myReceiver = new MyReceiver();
        IntentFilter filter = new IntentFilter("com.example.myservice");
        registerReceiver(myReceiver, filter);
    }
    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(myReceiver);
    }
}
```

Activity 的生命周期不对应，可能出现多次 onResume 造成 receiver 注册多个，但
最终只注销一个，其余 receiver 产生内存泄漏。
