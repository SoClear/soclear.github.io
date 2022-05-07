# Bitmap、Drawable 与动画

## 异步加载图片【强制】

加载大图片或者一次性加载多张图片，应该在异步线程中进行。  
图片的加载，涉及到 IO 操作，以及 CPU 密集操作，很可能引起卡顿。

正例：

个人注：AsyncTask 已被弃用，请使用其他异步方案

```java
class BitmapWorkerTask extends AsyncTask<Integer, Void, Bitmap> {
 ...

    // 在后台进行图片解码
    @Override
    protected Bitmap doInBackground(Integer... params) {
        final Bitmap bitmap = BitmapFactory.decodeFile("some path");
        return bitmap;
    }
 ...
}
```

反例：

```java
Button btnLoadImage = (Button) findViewById(R.id.btn);  
btnLoadImage.setOnClickListener(new

OnClickListener() {
    public void onClick (View v){
        Bitmap bitmap = BitmapFactory.decodeFile("some path");
    }
});
```

## 避免图片内存泄漏，使用图片库【强制】

在 ListView，ViewPager，RecyclerView，GirdView 等组件中使用图片时，应做好图片的缓存，避免始终持图片导致内存泄露，也避免重复创建图片，引起性能问题。  
建议使用 [Fresco](https://github.com/facebook/fresco)、[Glide](https://github.com/bumptech/glide)、等图片库。  
个人注：强烈建议使用 [coil](https://github.com/coil-kt/coil) 图片库。

正例：

例如使用系统 LruCache 缓存，参考：<https://developer.android.com/topic/performance/graphics/cache-bitmap.html>

```java
private LruCache<String, Bitmap> mMemoryCache;

@Override
protected void onCreate(Bundle savedInstanceState) {
    ...
    // 获取可用内存的最大值，使用内存超出这个值将抛出 OutOfMemory 异常。LruCache 通
    过构造函数传入缓存值，以 KB 为单位。
    final int maxMemory = (int) (Runtime.getRuntime().maxMemory() / 1024);
    // 把最大可用内存的 1/8 作为缓存空间
    final int cacheSize = maxMemory / 8;
    mMemoryCache = new LruCache<String, Bitmap>(cacheSize) {
        @Override
        protected int sizeOf(String key, Bitmap bitmap) {
            return bitmap.getByteCount() / 1024;
        }
    };
    ...
}

public void addBitmapToMemoryCache(String key, Bitmap bitmap) {
    if (getBitmapFromMemCache(key) == null) {
        mMemoryCache.put(key, bitmap);
    }
}

public Bitmap getBitmapFromMemCache(String key) {
    return mMemoryCache.get(key);
}

public void loadBitmap(int resId, ImageView imageView) {
    final String imageKey = String.valueOf(resId);

    final Bitmap bitmap = getBitmapFromMemCache(imageKey);
    if (bitmap != null) {
        mImageView.setImageBitmap(bitmap);
    } else {
        mImageView.setImageResource(R.drawable.image_placeholder);
        BitmapWorkerTask task = new BitmapWorkerTask(mImageView);
        task.execute(resId);
    }
}

class BitmapWorkerTask extends AsyncTask<Integer, Void, Bitmap> {
    ...

    // 在后台进行图片解码
    @Override
    protected Bitmap doInBackground(Integer... params) {
        final Bitmap bitmap = decodeSampledBitmapFromResource(getResources(),
                params[0], 100, 100));
        addBitmapToMemoryCache(String.valueOf(params[0]), bitmap);
        return bitmap;
    }
    ...
}
```

反例：

没有存储，每次都需要解码，或者有缓存但是没有合适的淘汰机制，导致缓存效果很差，依然经常需要重新解码。

## png 图片使用 tinypng 或者类似工具压缩处理，减少包体积【强制】

## 根据需要展示压缩过的图片【推荐】

应根据实际展示需要，压缩图片，而不是直接显示原图。  
手机屏幕比较小，直接显示原图，并不会增加视觉上的收益，但是却会耗费大量宝贵的内存。

正例：

```java
public static Bitmap decodeSampledBitmapFromResource(Resources res, int resId, int reqWidth, int reqHeight) {
    // 首先通过 inJustDecodeBounds=true 获得图片的尺寸
    final BitmapFactory.Options options = new BitmapFactory.Options();
    options.inJustDecodeBounds = true;
    BitmapFactory.decodeResource(res, resId, options);
    // 然后根据图片分辨率以及我们实际需要展示的大小，计算压缩率
    options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight);
    // 设置压缩率，并解码
    options.inJustDecodeBounds = false;
    return BitmapFactory.decodeResource(res, resId, options);
}
```

反例：

不经压缩显示原图。

## 使用完毕的图片，应该及时回收，释放宝贵的内存【强制】

正例：

```java
Bitmap bitmap = null;
loadBitmapAsync(new OnResult(result) {
    bitmap = result;
});
...使用该 bitmap...
// 使用结束，在 2.3.3 及以下需要调用 recycle()函数，在 2.3.3 以上 GC 会自动管理，除非你明确不需要再用。
if(Build.VERSION.SDK_INT <=10){
    bitmap.recycle();
}
bitmap =null;
```

反例：

使用完成图片，始终不释放资源。

## 针对不同的屏幕密度，提供对应的图片资源

针对不同的屏幕密度，提供对应的图片资源，使内存占用和显示效果达到合理的平衡。  
如果为了节省包体积，可以在不影响 UI 效果的前提下，省略低密度图片。

## 在 Activity.onPause()或 Activity.onStop()回调中，关闭当前 activity 正在执行的的动画【强制】

正例：

```java
public class MyActivity extends Activity {
    ImageView mImageView;
    Animation mAnimation;
    Button mBtn;

    /**
     * 首次创建 activity 时调用
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        mImageView = (ImageView) findViewById(R.id.ImageView01);
        mAnimation = AnimationUtils.loadAnimation(this, R.anim.anim);
        mBtn = (Button) findViewById(R.id.Button01);
        mBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mImageView.startAnimation(mAnimation);
            }
        });
    }

    public void onPause() {
        //页面退出，及时清理动画资源
        mImageView.clearAnimation();
    }
}
```

反例：

页面退出时，不关闭该页面相关的动画。

## 考虑回调时刻的环境是否还支持业务处理【推荐】

在动画或者其他异步任务结束时，应该考虑回调时刻的环境是否还支持业务处理。  
例如 Activity 的 onStop()函数已经执行，且在该函数中主动释放了资源，此时回调中如果不做判断就会空指针崩溃。

正例：

```java
public class MyActivity extends Activity {
    private ImageView mImageView;
    private Animation mAnimation;

    /**
     * 首次创建 activity 时调用
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        mImageView = (ImageView) findViewById(R.id.ImageView01);
        mAnimation = AnimationUtils.loadAnimation(this, R.anim.anim);
        mAnimation.setAnimationListener(new AnimationListener() {
            @Override
            public void onAnimationEnd(Animation arg0) {
                //判断一下资源是否被释放了
                if (mImageView != null) {
                    mImageView.clearAnimation();
                }
            }
        });
        mImageView.startAnimation(mAnimation);
    }
}
```

反例：

动画结束回调中，直接使用资源不加判断，导致异常。

## 使用 inBitmap 重复利用内存空间，避免重复开辟新内存【推荐】

正例：

```java
public static Bitmap decodeSampledBitmapFromFile(String filename, int reqWidth, int reqHeight, ImageCache cache) {
    final BitmapFactory.Options options = new BitmapFactory.Options();
    ...
    BitmapFactory.decodeFile(filename, options);
    ...
    // 如果在 Honeycomb 或更新版本系统中运行，尝试使用 inBitmap
    if (Utils.hasHoneycomb()) {
        addInBitmapOptions(options, cache);
    }
    ...
    return BitmapFactory.decodeFile(filename, options);
}

private static void addInBitmapOptions(BitmapFactory.Options options, ImageCache cache) {
    // inBitmap 只处理可变的位图，所以强制返回可变的位图
    options.inMutable = true;
    if (cache != null) {
        Bitmap inBitmap = cache.getBitmapFromReusableSet(options);
        if (inBitmap != null) {

        }
        options.inBitmap = inBitmap;
    }
}
```
