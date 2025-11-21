# Xposed模块显示Compose悬浮窗

FakedComposeView.kt:

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

hook:

```kotlin
findAndHookMethod(
    "com.example.MainActivity",
    loadPackageParam.classLoader,
    "onCreate",
    Bundle::class.java,
    object : XC_MethodHook() {
        override fun afterHookedMethod(param: MethodHookParam) {
            val activity = param.thisObject as Activity
            val windowManager = activity.windowManager
            val layoutParams = WindowManager.LayoutParams().apply {
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
            var composeViewInstance: FakedComposeView? = null

            composeViewInstance = FakedComposeView(activity) {
                var show by remember { mutableStateOf(false) }
                Column(modifier = Modifier.alpha(0.8f)) {
                    Button(
                        modifier = Modifier
                            .pointerInput(Unit) {
                                detectDragGestures { change, dragAmount ->
                                    change.consume() // 消费事件，防止传递给下层
                                    // onDrag(dragAmount) // 回调给外部去更新 WindowManager
                                    layoutParams.x += dragAmount.x.roundToInt()
                                    layoutParams.y += dragAmount.y.roundToInt()
                                    composeViewInstance?.view?.let {
                                        windowManager.updateViewLayout(it, layoutParams)
                                    }
                                }
                            },
                        onClick = {
                            show = !show
                            if (show) {
                                // 开启输入模式：移除 NOT_FOCUSABLE
                                layoutParams.flags =
                                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                            } else {
                                // 关闭输入模式：恢复 NOT_FOCUSABLE (不抢占按键)
                                layoutParams.flags =
                                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                                            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            }
                            composeViewInstance?.view?.let {
                                windowManager.updateViewLayout(it, layoutParams)
                            }
                        }
                    ) {
                        Text(text = "弹出输入框")
                    }
                    if (show) {
                        Column(
                            modifier = Modifier.background(MaterialTheme.colorScheme.primary)
                        ) {
                            var text by remember { mutableStateOf("") }
                            TextField(text, onValueChange = { text = it })
                        }
                    }
                }
            }

            windowManager.addView(
                composeViewInstance.view,
                layoutParams
            )
        }
    }
)
```
