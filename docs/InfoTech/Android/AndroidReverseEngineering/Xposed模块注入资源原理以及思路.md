# Xposed模块注入资源原理以及思路

在使用 xposed 进行 hook 宿主 App 的时候，有时候需要调用模块内的 Resources

默认下访问的是宿主App的进程也就是宿主App的资源

知识储备:

[Lsposed原理](https://www.52pojie.cn/forum.php?mod=viewthread&tid=1694093&highlight=lsposed)  
[android插件化技术](https://blog.csdn.net/SEU_Calvin/article/details/53785404)

## 原理

在 android 的插件化技术中得知，android 资源是通过 `AssetManager` 类的 `addAssetPath` 函数去加载的:

```java
/**
 * @deprecated Use {@link #setApkAssets(ApkAssets[], boolean)}
 * @hide
 */
@Deprecated
@UnsupportedAppUsage
public int addAssetPath(String path) {
    return addAssetPathInternal(List.of(new ApkKey(path, false, false)), false);
}
```

```java
private int addAssetPathInternal(List<ApkKey> apkKeys, boolean presetAssets) {
    Objects.requireNonNull(apkKeys, "apkKeys");
    if (apkKeys.isEmpty()) {
        return 0;
    }

    synchronized (this) {
        ensureOpenLocked();

        // See if we already have some of the apkKeys loaded.
        final int originalAssetsCount = mApkAssets.length;

        // Getting an assets' path is a relatively expensive operation, cache them.
        final ArrayMap<String, Integer> assetPaths = new ArrayMap<>(originalAssetsCount);
        for (int i = 0; i < originalAssetsCount; i++) {
            assetPaths.put(mApkAssets[i].getAssetPath(), i);
        }

        final var newKeys = new ArrayList<ApkKey>(apkKeys.size());
        int lastFoundIndex = -1;
        for (int i = 0, pathsSize = apkKeys.size(); i < pathsSize; i++) {
            final var key = apkKeys.get(i);
            final var index = assetPaths.get(key.path);
            if (index == null) {
                newKeys.add(key);
            } else {
                lastFoundIndex = index;
            }
        }
        if (newKeys.isEmpty()) {
            return lastFoundIndex + 1;
        }
        
        // 关键代码
        final var newAssets = loadAssets(newKeys);
        if (newAssets.isEmpty()) {
            return 0;
        }
        // 关键代码
        mApkAssets = makeNewAssetsArrayLocked(newAssets);
        // 关键代码
        nativeSetApkAssets(mObject, mApkAssets, true, presetAssets);
        invalidateCachesLocked(-1);
        return originalAssetsCount + 1;
    }
}
```

在 `loadAssets` 函数中通过资源管理器加载 APK 资源:

```java
private static @NonNull ArrayList<ApkAssets> loadAssets(@NonNull ArrayList<ApkKey> keys) {
    final int pathsSize = keys.size();
    final var loadedAssets = new ArrayList<ApkAssets>(pathsSize);
    final var resourcesManager = ResourcesManager.getInstance();
    for (int i = 0; i < pathsSize; i++) {
        final var key = keys.get(i);
        try {
            // ResourcesManager has a cache of loaded assets, ensuring we don't open the same
            // file repeatedly, which is useful for the common overlays and registered
            // shared libraries.
            loadedAssets.add(resourcesManager.loadApkAssets(key));
        } catch (IOException e) {
            Log.w(TAG, "Failed to load asset, key = " + key, e);
        }
    }
    return loadedAssets;
}
```

并在 `nativeSetApkAssets` 去解析apk中的资源

## 具体实现方式

那么思路很简单我们主动调用 `addAssetPath` 函数去把模块的资源加载到宿主App

需要用到 xposed 的 `IXposedHookZygoteInit` 接口

重写 `initZygote` 函数:

```java
@Override
public void initZygote(StartupParam startupParam) throws Throwable {  
    modulePath=startupParam.modulePath; 
}
```

这个函数用来获取模块 apk 路径( `/data/app/.....` )

在 `handleLoadPackage` 函数里，通过去 hook 获取到宿主 App 的 `Context` 去主动调用 `addAssetPath`

```java
@Override 
public void handleLoadPackage(XC_LoadPackage.LoadPackageParam lpparam) throws Throwable {  
    XposedHelpers.findAndHookMethod(Application.class, "attach", Context.class, new XC_MethodHook() {  
        @Override 
        protected void afterHookedMethod(MethodHookParam param) throws Throwable {  
            super.afterHookedMethod(param);  
            Context context = (Context) param.args[0];  
            ClassLoader classLoader = context.getClassLoader();  
            XposedHelpers.callMethod(context.getResources().getAssets(),"addAssetPath",modulePath);  
        }  
    });  
}
```

然后后面我们可以随意去使用我们的资源(drawable,mipmap,values,layout....)

注意使用的时候，调用的 context 是使用的宿主 App 的

## initZygote是怎么获取的模块路径

`XposedBridge` 的 `loadModule(String apk)` ：

```java
/**
 * Load a module from an APK by calling the init(String) method for all classes defined
 * in <code>assets/xposed_init</code>.
 */
private static void loadModule(String apk) {
    log("Loading modules from " + apk);

    if (!new File(apk).exists()) {
        log("  File does not exist");
        return;
    }

    ClassLoader mcl = new PathClassLoader(apk, BOOTCLASSLOADER);
    InputStream is = mcl.getResourceAsStream("assets/xposed_init");
    if (is == null) {
        log("assets/xposed_init not found in the APK");
        return;
    }

    BufferedReader moduleClassesReader = new BufferedReader(new InputStreamReader(is));
    try {
        String moduleClassName;
        while ((moduleClassName = moduleClassesReader.readLine()) != null) {
            moduleClassName = moduleClassName.trim();
            if (moduleClassName.isEmpty() || moduleClassName.startsWith("#"))
                continue;

            try {
                log ("  Loading class " + moduleClassName);
                Class<?> moduleClass = mcl.loadClass(moduleClassName);

                if (!IXposedMod.class.isAssignableFrom(moduleClass)) {
                    log ("    This class doesn't implement any sub-interface of IXposedMod, skipping it");
                    continue;
                } else if (disableResources && IXposedHookInitPackageResources.class.isAssignableFrom(moduleClass)) {
                    log ("    This class requires resource-related hooks (which are disabled), skipping it.");
                    continue;
                }

                final Object moduleInstance = moduleClass.newInstance();
                if (isZygote) {
                    if (moduleInstance instanceof IXposedHookZygoteInit) {
                        IXposedHookZygoteInit.StartupParam param = new IXposedHookZygoteInit.StartupParam();
                        param.modulePath = apk;
                        param.startsSystemServer = startsSystemServer;
                        ((IXposedHookZygoteInit) moduleInstance).initZygote(param);
                    }

                    if (moduleInstance instanceof IXposedHookLoadPackage)
                        hookLoadPackage(new IXposedHookLoadPackage.Wrapper((IXposedHookLoadPackage) moduleInstance));

                    if (moduleInstance instanceof IXposedHookInitPackageResources)
                        hookInitPackageResources(new IXposedHookInitPackageResources.Wrapper((IXposedHookInitPackageResources) moduleInstance));
                } else {
                    if (moduleInstance instanceof IXposedHookCmdInit) {
                        IXposedHookCmdInit.StartupParam param = new IXposedHookCmdInit.StartupParam();
                        // 关键代码
                        param.modulePath = apk;
                        param.startClassName = startClassName;
                        ((IXposedHookCmdInit) moduleInstance).initCmdApp(param);
                    }
                }
            } catch (Throwable t) {
                log(t);
            }
        }
    } catch (IOException e) {
        log(e);
    } finally {
        try {
            is.close();
        } catch (IOException ignored) {}
    }
}
```

`XposedBridge` 的 `loadModules()` ：

```java
/**
 * Try to load all modules defined in <code>BASE_DIR/conf/modules.list</code>
 */
private static void loadModules() throws IOException {
    final String filename = BASE_DIR + "conf/modules.list";
    BaseService service = SELinuxHelper.getAppDataFileService();
    if (!service.checkFileExists(filename)) {
        Log.e(TAG, "Cannot load any modules because " + filename + " was not found");
        return;
    }

    InputStream stream = service.getFileInputStream(filename);
    BufferedReader apks = new BufferedReader(new InputStreamReader(stream));
    String apk;
    while ((apk = apks.readLine()) != null) {
        loadModule(apk);
    }
    apks.close();
}
```

可以看到是通过 `SELinuxHelper.getAppDataFileService` 服务读取了 `/data/data/de.robv.android.xposed.installer/conf/modules.list` 路径的文件读取

来源： [Xposed模块注入资源原理以及思路](https://bbs.binmt.cc/thread-147411-1-1.html)
