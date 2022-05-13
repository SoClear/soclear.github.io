# Activity

## 生命周期状态与生命周期回调

简化的生命周期
![简化的生命周期](activity_lifecycle.jfif)

完整的生命周期
![完整的生命周期](activity_lifecycle_accurate.jfif)
| 状态   | 是否有内存实例 | 用户是否可见 | 是否活跃在前台 |
| ------ | -------------- | ------------ | -------------- |
| 不存在 | 否             | 否           | 否             |
| 停止   | 是             | 否           | 否             |
| 暂停   | 是             | 是或部分*    | 否             |
| 运行   | 是             | 是           | 是             |

\* 某些场景下，暂停状态的activity可能会部分或完全可见。

- 不存在（Nonexistent）表示某个activity还没启动或已销毁（例如，用户按了回退键）。因为已销毁这个可能状态，所以不存在状态有时被称为已销毁状态。此时，内存里没有这个activity实例，也没有用户可见或可交互的关联视图。

- 停止（Stopped）表示某个activity实例在内存里，但用户在屏幕上看不到关联视图。在某个activity刚开始出现前作为瞬间状态存在，但在activity的关联视图被完全遮挡时又重现该状态（例如，用户启动另一个用户可见的全屏activity，点击Home键，或者使用预览界面切换任务）。

- 暂停（Paused）表示某个activity处于前台非活动状态，关联视图可见或部分可见。如果用户启动一个新的对话框形式，或者透明的activity在某个activity之上，我们就说该activity处于部分可见状态。一个activity也可能完全可见，但并不处于前台，比如用户在多窗口模式（又叫分屏模式）下同时查看两个activity。

- 运行（Resumed）表示某个activity实例在内存里，用户完全可见，且处于前台。用户当前正与之交互。设备上有很多应用，但是，任何时候只能有一个activity处于能与用户交互的运行状态。这也意味着，如果某个activity进入继续运行状态，那么其他activity可能正在退出运行状态。

切记，千万不要自己去调用onCreate(Bundle?)函数或任何其他activity生命周期函数。为通知activity状态变化，你只需在Activity子类里覆盖这些函数，Android会适时调用它们（看当前用户状态以及系统运行情况）。

activity一直在运行、暂停、停止和不存在这四种状态间转换。  
activity何时被销毁有两种情况：

- 用户结束使用activity
- 因设备配置改变，被系统销毁。

一般来讲，当用户结束使用activity时，都希望重置应用的UI状态。而当用户旋转activity时，他们又希望旋转前后UI状态保持一致。

通过检查activity的isFinishing属性可以知道哪一场景正在上演。  
如果isFinishing属性值是true，那么activity正在被用户销毁，因为用户结束使用当前activity了（比如按了回退键，或者从概览屏消除了应用卡片）。  
如果isFinishing属性值是false，activity则正在被系统销毁，因为设备配置改变了。

如果 `Activity.isFinishing` 是 `true` ，即用户主动销毁Activity，那么与该Activity关联的ViewModel对象也会被销毁。

## Activity.onSaveInstanceState(Bundle)

### 介绍与使用

只要在未结束使用的activity进入停止状态时（比如用户按了Home按钮，启动另一个应用时），操作系统都会调用Activity.onSaveInstanceState(Bundle)。  
这个时间点很重要，因为停止的activity会被标记为killable。  
如果应用进程因低优先级被“杀死”，那么，你大可放心Activity.onSaveInstanceState(Bundle)肯定已被调用过。

onSaveInstanceState(Bundle)的默认实现要求所有activity视图将自身状态数据保存在Bundle对象中。  
Bundle是存储字符串键与特定类型值之间映射关系（键值对）的一种结构。

覆盖onSaveInstanceState(...)函数：

```kotlin
override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        Log.d(TAG, "onCreate(Bundle?) called")
        outState.putString("your key","your value")
    }
```

onCreate接受传入可空值bundle。这是因为用户首次启动的activity新实例是没有状态的，自然对应的bundle为空。当设备旋转或进程被销毁后重建应用activity时，Bundle对象就有值了。此时的bundle会保存你在`onSaveInstanceState(Bundle)`里添加的键值对。另外，Bundle对象里也可能包含系统框架添加的额外信息，比如某个EditText的内容或者其他基本UI部件的状态。

### 最佳实践

常见的做法是:

- 覆盖onSaveInstanceState(Bundle)函数，在Bundle对象中，保存当前activity小的或暂存状态的数据；
- 覆盖onStop()函数，保存永久性数据，比如用户编辑的文字等。调用完onStop()函数后，activity随时会被系统销毁，所以用它保存永久性数据。

### 注意事项

那么暂存的activity记录到底可以保留多久呢？前面说过，用户按了回退键后，系统会彻底销毁当前的activity。此时，暂存的activity记录会同时被清除。此外，如果系统重启，那么暂存的activity记录也会被清除。

因为保留实例状态数据是要序列化到磁盘的，所以应避免用它保存任何大而复杂的对象。
