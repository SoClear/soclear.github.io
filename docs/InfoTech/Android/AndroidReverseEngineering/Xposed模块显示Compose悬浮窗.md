# Xposed模块显示Compose悬浮窗

## FakedComposeView.kt

```kotlin
// From: https://github.com/Fate-Grand-Automata/FGA/blob/master/app/src/main/java/io/github/fate_grand_automata/util/FakeLifecycleOwner.kt
// From: https://gist.github.com/handstandsam/6ecff2f39da72c0b38c07aa80bbb5a2f

import android.content.Context
import android.os.Bundle
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Recomposer
import androidx.compose.ui.platform.AndroidUiDispatcher
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.compositionContext
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

private class FakeLifecycleOwner : SavedStateRegistryOwner {
    private var lifecycleRegistry = LifecycleRegistry(this)
    private var savedStateRegistryController = SavedStateRegistryController.create(this)
    override val savedStateRegistry: SavedStateRegistry
        get() = savedStateRegistryController.savedStateRegistry

    override val lifecycle: Lifecycle get() = lifecycleRegistry

    fun setCurrentState(state: Lifecycle.State) {
        lifecycleRegistry.currentState = state
    }

    fun handleLifecycleEvent(event: Lifecycle.Event) {
        lifecycleRegistry.handleLifecycleEvent(event)
    }

    fun performRestore(savedState: Bundle?) {
        savedStateRegistryController.performRestore(savedState)
    }

    fun performSave(outBundle: Bundle) {
        savedStateRegistryController.performSave(outBundle)
    }
}

class FakedComposeView(
    context: Context,
    content: @Composable () -> Unit
) : AutoCloseable {
    val viewModelStoreOwner = object : ViewModelStoreOwner {
        override val viewModelStore: ViewModelStore = ViewModelStore()
    }
    private val lifecycleOwner = FakeLifecycleOwner()

    private val coroutineContext = AndroidUiDispatcher.CurrentThread
    private val runRecomposeScope = CoroutineScope(coroutineContext)
    private val recomposer = Recomposer(coroutineContext)

    val view: ComposeView = ComposeView(context).also {
        it.setContent { content() }

        // Trick The ComposeView into thinking we are tracking lifecycle
        lifecycleOwner.performRestore(null)
        lifecycleOwner.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        it.setViewTreeLifecycleOwner(lifecycleOwner)
        it.setViewTreeViewModelStoreOwner(viewModelStoreOwner)
        it.setViewTreeSavedStateRegistryOwner(lifecycleOwner)

        it.compositionContext = recomposer
        runRecomposeScope.launch {
            recomposer.runRecomposeAndApplyChanges()
        }
    }

    override fun close() {
        lifecycleOwner.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        runRecomposeScope.cancel()
    }
}
```

## ComposeViewContainer.kt

```kotlin
import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.PixelFormat
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewStructure
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.FrameLayout
import androidx.compose.runtime.Composable
import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XposedHelpers
import kotlin.math.roundToInt

// 不直接把 ComposeView 加到 WindowManager，而是加到这个 FrameLayout 里
class ComposeViewContainer(
    activity: Activity,
    content: @Composable (ComposeViewContainer) -> Unit
) : FrameLayout(activity) {
    val windowManager: WindowManager = activity.windowManager
    val layoutParams: WindowManager.LayoutParams = WindowManager.LayoutParams().apply {
        // 只在应用内显示，一般不需要 TYPE_APPLICATION_OVERLAY
        type = WindowManager.LayoutParams.TYPE_APPLICATION
        format = PixelFormat.TRANSLUCENT
        flags = WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE

        softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
        width = WindowManager.LayoutParams.WRAP_CONTENT
        height = WindowManager.LayoutParams.WRAP_CONTENT
        @SuppressLint("RtlHardcoded")
        gravity = Gravity.LEFT or Gravity.TOP
        x = 0
        y = 0
        windowAnimations = android.R.style.Animation_Toast
    }

    val fakedComposeView = FakedComposeView(activity) {
        content(this)
    }

    init {
        // 1. 设置容器属性：告诉系统这个 View 对无障碍服务不重要，不要遍历它，还要隐藏子 View (Compose)
        // 这能解决 findViewByAccessibilityIdTraversal 的无限递归问题
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
        // 2. 告诉系统不要尝试在这个 View 上进行自动填充 (Android 8.0+)
        // 浏览器通常有很强的自动填充机制，容易与悬浮窗冲突
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            importantForAutofill = IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS
        }
        addView(fakedComposeView.view)
    }

    fun updateViewLayout() {
        windowManager.updateViewLayout(this, layoutParams)
    }

    // 允许聚焦。true 为允许弹出输入法，不输入时请及时设置为 false 来让手势操作传给宿主
    fun setFlagFocusable(focusable: Boolean) {
        if (focusable) {
            layoutParams.flags =
                layoutParams.flags and WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE.inv()
        } else {
            layoutParams.flags = layoutParams.flags or WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
        }
        updateViewLayout()
    }


    // 供 Compose 调用的更新位置方法
    fun updatePosition(deltaX: Float, deltaY: Float) {
        layoutParams.x += deltaX.roundToInt()
        layoutParams.y += deltaY.roundToInt()
        try {
            updateViewLayout()
        } catch (_: Exception) {
            // 忽略 View 未 attach 的错误
        }
    }

    // 拦截 1: 禁止子 View (Compose) 发出的无障碍事件向上传递
    // 这样系统就不会知道这里有输入框获得了焦点，也就不会触发后续的查找死循环
    override fun requestSendAccessibilityEvent(child: View, event: AccessibilityEvent): Boolean {
        return false
    }

    // 拦截 2: 禁止自动填充系统扫描这个 View 的结构
    override fun dispatchProvideAutofillStructure(structure: ViewStructure, flags: Int) {
        // 留空，不调用 super，直接切断自动填充扫描
    }
}

fun showFloatingWindow(modulePath: String, content: @Composable (ComposeViewContainer) -> Unit) {
    // 显示悬浮窗要求向宿主注入模块资源
    addAssetPath(modulePath)
    XposedHelpers.findAndHookMethod(
        Activity::class.java,
        "onCreate",
        Bundle::class.java,
        object : XC_MethodHook() {
            override fun afterHookedMethod(param: MethodHookParam) {
                val activity = param.thisObject as Activity
                val floatingComposeView = ComposeViewContainer(activity, content)
                activity.windowManager.addView(
                    floatingComposeView,
                    floatingComposeView.layoutParams
                )
            }
        }
    )
}
```

## 更简单的实现方式

清除该节点及其子节点的所有语义（Accessibility/Autofill 也就看不到它了）：

```kotlin
modifier = Modifier.clearAndSetSemantics {}
```

这样可以防止点击输入框卡死闪退。

### 探索过程

#### 现象

点击注入 Edge 浏览器的 Compose 界面的输入框会卡死甚至闪退。

#### 原因

这是一个非常典型的 **“宿主应用（Edge浏览器）的自定义 View 遍历机制”** 与 **“Jetpack Compose 虚拟视图树（Semantics/Autofill）”** 发生冲突导致的无限递归/死循环问题。

日志中的关键点是：

1. `java.lang.OutOfMemoryError: Failed to allocate...`
2. 堆栈指向：  
   `java.lang.AbstractStringBuilder.append`  
   `java.lang.StringBuilder.append`  
   `qj00.run(395500023:100)`

**为什么会在 `TextField` 输入时发生 OOM？**

Edge 浏览器（`com.microsoft.emmx`）内部有自己的一套非常复杂的网页阅读、翻译、密码自动填充（Autofill）或无障碍（Accessibility）节点抓取机制（即混淆的 `qj00` 类）。
当你点击 Compose 的 `TextField` 弹出软键盘时，会触发系统的 Autofill 或 Accessibility 结构请求。Edge 监听到这个事件后，它的 `qj00` 类试图去遍历当前界面的 View 树（提取文本结构，所以一直在疯狂执行 `StringBuilder.append` 拼接字符串）。
但是，**Compose 的视图节点是虚拟的（Semantic Node）**，Edge 的传统 View 遍历逻辑无法正确理解 `AndroidComposeView` 的虚拟结构，导致其在解析 Compose 树时陷入了**无限循环（死循环）**，疯狂拼接字符串，几秒钟内吃光了 256MB 的内存限制，最终导致卡顿并 OOM 闪退。

#### 探索解决方案1

```kotlin
// 为了防止影响宿主，要使用模块的 classLoader
fun patchComposeRecursion(classLoader: ClassLoader) {
    try {
        // 注意：这个类在 androidx.compose.ui.platform 包下
        val targetClass = findClassIfExists(
            "androidx.compose.ui.platform.AndroidComposeView",
            classLoader
        ) ?: return

        val returnNull = XC_MethodReplacement.returnConstant(null)

        // 拦截无障碍 ID 遍历
        findAndHookMethod(
            targetClass,
            "findViewByAccessibilityIdTraversal",
            Int::class.javaPrimitiveType, // 参数是一个 int 类型的 ID
            returnNull
        )

        // 拦截 Assist 结构分发 (防止抓取屏幕结构时死循环)
        findAndHookMethod(
            targetClass,
            "dispatchProvideStructure",
            android.view.ViewStructure::class.java,
            returnNull
        )

        // 拦截 Autofill 虚拟结构提供 (防止 Edge 密码/表单自动填充死循环，最直接的 OOM 触发点)
        findAndHookMethod(
            targetClass,
            "onProvideAutofillVirtualStructure",
            android.view.ViewStructure::class.java,
            Int::class.javaPrimitiveType,
            returnNull
        )

        // (可选) 拦截 Autofill 动作执行
        findAndHookMethod(
            targetClass,
            "autofill",
            android.util.SparseArray::class.java,
            returnNull
        )
    } catch (t: Throwable) {
        XposedBridge.log(t)
    }
}
```

#### 探索解决方案2

上面我们在创建的 Compose 主界面上，成功设置了 importantForAutofill 和 importantForAccessibility，这保护了主界面。

但是，当你在 Compose 中调用 AlertDialog 时，Compose 会向 Android 系统申请创建一个全新的独立 Window（弹窗）。

在这个全新的 Window 中，Compose 会偷偷实例化一个新的 AndroidComposeView。而这个新的 View 并没有继承主界面的安全设置，它默认又是允许 Autofill 和无障碍遍历的！

因此，当你点击 AlertDialog 里的 OutlinedTextField 时，在这个新的弹窗 Window 里触发了死循环，导致卡死。

因此，我们需要在弹窗 Window 中，彻底禁用无障碍遍历和自动填充。

使用方式示例：

```kotlin
dialog.setContentView(ComposeView(moduleContext).apply {
    // 1. 彻底禁用自动填充，防止宿主的 Autofill 服务介入模块的 ComposeView
    importantForAutofill = View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS

    // 2. 彻底隐藏无障碍节点，防止宿主的无障碍服务遍历模块的 ComposeView dao'b死循环
    importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
    setContent {
        EdgeXTheme {
            Scaffold(
                modifier = Modifier
                // 3. 清除该节点及其子节点的所有语义（Accessibility/Autofill 也就看不到它了）
                .clearAndSetSemantics{}
                .fillMaxWidth()
            ) { innerPadding ->
                MainScreen(viewModel = viewModel, modifier = androidx.compose.ui.Modifier.padding(innerPadding))
            }
        }
    }
})
```

最后发现只一个 `modifier = Modifier.clearAndSetSemantics {}` 就可以解决问题。

其中向宿主注入模块资源 见 [Xposed模块注入资源原理以及思路](Xposed模块注入资源原理以及思路.md)
