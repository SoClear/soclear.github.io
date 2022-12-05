# Dagger子组件

## 组件依赖与子组件主要解决了不同作用域时组件之间复用问题

* 在一个组件指定作用域后，就已经确定了该组件创建对象的生命周期。  
 但是有些对象的实例例可能生命周期更短，这个时候就需要定义新的组件。
* 新组件需要使用原组件的部分资源。

## 两种实现方式

* 为 `@Component` 添加 `dependencies` 参数，指定该组件依赖于新的组件。
* 直接使用 `@Subcomponent` 注解创建新的组件，并装载到父组件中。

## 1. 自定义 Application

MyApplication.kt：

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        applicationComponent = DaggerApplicationComponent
            .builder()
            .build()
    }

    companion object {
        lateinit var applicationComponent: ApplicationComponent
            private set
    }
}
```

AndroidManifest.xml：

```xml
...
<application>
 android:name=".MyApplication"
 ...
</application>
```

## 2. 子组件

Student.kt：

```kotlin
class Student
```

StudentModule.kt：

```kotlin
@Module
class StudentModule {
    @Provides
    fun provideStudent() = Student()
}
```

StudentComponent.kt：

```kotlin
// 指定为子组件，子组件可以使用父组件的方法
@Subcomponent(modules = [StudentModule::class])
interface StudentComponent {
    @Subcomponent.Factory
    interface Factory {
        fun create():StudentComponent
    }
    fun inject(mainActivity: MainActivity)
}
```

SubComponentModule.kt：

```kotlin
@Module(subcomponents = [StudentComponent::class])
class SubComponentModule
```

## 3. ApplicationComponent

Application组件

ApplicationComponent.kt：

```kotlin
@Component(modules = [SubComponentModule::class])
interface ApplicationComponent {
    fun studentComponent():StudentComponent.Factory
}
```

## 4. MainActivity

MainActivity.kt：

```kotlin
class MainActivity : ComponentActivity() {
    @Inject lateinit var student:Student

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        MyApplication.applicationComponent.studentComponent().create().inject(this)
        Log.i("子组件", student.toString())
    }
}
```
