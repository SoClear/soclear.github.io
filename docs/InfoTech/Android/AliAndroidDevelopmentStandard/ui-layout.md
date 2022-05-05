# UI 与布局

## 降低嵌套数【强制】

布局中不得不使用 ViewGroup 多重嵌套时，不要使用 LinearLayout 嵌套，
改用 RelativeLayout，可以有效降低嵌套数。

说明：

Android 应用页面上任何一个 View 都需要经过 measure、layout、draw 三个步骤
才能被正确的渲染。  
从 xml layout 的顶部节点开始进行 measure，每个子节点都需要向自己的父节点提供自己的尺寸来决定展示的位置，在此过程中可能还会重新measure（由此可能导致 measure 的时间消耗为原来的 2-3 倍）。  
节点所处位置越深，套嵌带来的 measure 越多，计算就会越费时。  
这就是为什么扁平的 View 结构会性能更好。  
同时，页面拥上的 View 越多，measure、layout、draw 所花费的时间就越久。  
要缩短这个时间，关键是保持 View 的树形结构尽量扁平，而且要移除所有不需要渲染的View。  
理想情况下，总共的 measure，layout，draw 时间应该被很好的控制在 16ms以内，以保证滑动屏幕时 UI 的流畅。  
要找到那些多余的 View（增加渲染延迟的 view），可以用 Android Studio Monitor 里的 Hierarachy Viewer 工具，可视化的查看所有的 view。

正例：

```xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout>
 <RelativeLayout>
 <TextView/>
 ...
 <ImageView/>
 </RelativeLayout>
</android.support.constraint.ConstraintLayout>
```

反例：

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout>
 <LinearLayout>
 <RelativeLayout>
 <TextView/>
 ...
 <ImageView/>
 </RelativeLayout>
 </LinearLayout>
</LinearLayout>
```

多重嵌套导致 measure 以及 layout 等步骤耗时过多。
