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

其中向宿主注入模块资源 见 [Xposed模块注入资源原理以及思路](Xposed模块注入资源原理以及思路.md)
