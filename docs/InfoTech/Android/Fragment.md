# Fragment

## 介绍

采用fragment而不是activity来管理应用UI可让应用具有灵活性。

fragment是一种控制器对象，activity可委派它执行任务。  
这些任务通常就是管理用户界面。  
受管的用户界面可以是一整屏或整屏的一部分。

管理用户界面的fragment又称为UI fragment。  
它也有自己的视图（由布局文件实例化而来）。  
fragment视图包含了用户可以交互的可视化UI元素。

activity视图能预留位置供fragment视图插入。  
如果有多个fragment要插入，activity视图就提供多个位置。

根据应用和用户的需求，可联合使用fragment及activity来组装或重组用户界面。  
在整个生命周期中，activity视图还是那个视图。  
因此不必担心会违反Android系统的activity使用规则。

下面来看看应用该如何支持在同一屏中显示列表与明细内容。  
我们应用的activity视图会由一个列表fragment和一个明细fragment组成。  
明细视图负责显示列表项的明细内容。

选择不同的列表项就显示对应的明细视图，activity负责以一个明细fragment替换另一个明细fragment，如图所示。  
这样，视图切换的过程中，也不用销毁activity了。  
有fragment助阵，一切就这么简单。

![明细fragment的切换](Fragment_1.jfif)

图 明细fragment的切换

除列表明细类应用外，使用UI fragment将应用的UI分解成构建块，同样适用于其他类型的应用。  
例如，利用单个构建块，可以方便地构建分页界面、动画侧边栏界面等更多定制界面。  
另外，一些新的Android Jetpack API，比如导航控制器（navigation controller），就能完美地支持fragment。  
所以，请放心整合使用fragment和Jetpack API。

## 总体理解

ctivity在其视图层级里提供一个位置，用来放置fragment视图。  
fragment本身没有在屏幕上显示视图的能力。  
因此，只有将它的视图放置在activity的视图层级结构中，fragment视图才能显示在屏幕上。

![Activity与Fragment的关系](Fragment_2.jfif)

示例：

![Activity与Fragment的关系](Fragment_3.jfif)

## 创建UI fragment

创建UI fragment与创建activity的步骤相同：

1. 定义UI布局文件；
2. 创建fragment类并设置其视图为第一步定义的布局；
3. 编写代码以实例化部件。

### 定义布局

`res/layout/fragment_crime.xml`

### 创建自定义Fragment类

继承 `androidx.fragment.app.Fragment` 基类：

```kotlin
import androidx.fragment.app.Fragment

class CrimeFragment : Fragment() {

    private lateinit var crime: Crime

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        crime = Crime()
    }
}
```

首先，`Fragment.onCreate(Bundle?)` 是公共函数，而 `Activity.onCreate(Bundle?)` 是受保护函数。（如果没有可见性修饰符，那么Kotlin函数默认是公共的。） `Fragment.onCreate(Bundle?)` 函数及其他 `Fragment` 生命周期函数必须是公共函数，因为托管`fragment`的`activity`要调用它们。

其次，类似于`activity`，`fragment`同样具有保存及获取状态的`bundle`。  
如同使用`Activity.onSaveInstanceState(Bundle)`函数那样，你也可以根据需要覆盖`Fragment.onSaveInstanceState(Bundle)`函数。

最后，`fragment`的视图并没有在`Fragment.onCreate(Bundle?)`函数中生成。虽然我们在该函数中配置了`fragment`实例，但创建和配置`fragment`视图是另一个`Fragment`生命周期函数完成的：`onCreateView(LayoutInflater, ViewGroup?, Bundle?)`。

该函数会实例化`fragment`视图的布局，然后将实例化的`View`返回给托管`activity`。`LayoutInflater`及`ViewGroup`是实例化布局的必要参数。  
`Bundle`用来存储恢复数据，可供该函数从保存状态下重建视图。

在`CrimeFragment.kt`中，添加`onCreateView(...)`函数的实现代码，从`fragment_crime.xml`布局中实例化并返回视图，如代码清单所示。

代码清单　覆盖`onCreateView(...)`函数（`CrimeFragment.kt`）

```kotlin
class CrimeFragment : Fragment() {

    private lateinit var crime: Crime
    private lateinit var titleField: EditText
    private lateinit var dateButton: Button
    private lateinit var solvedCheckBox: CheckBox

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        crime = Crime()
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_crime, container, false)
        titleField = view.findViewById(R.id.crime_title) as EditText
        dateButton = view.findViewById(R.id.crime_date) as Button
        solvedCheckBox = view.findViewById(R.id.crime_solved) as CheckBox
        // ...
        return view
    }

    override fun onStart() {
        super.onStart()

        val titleWatcher = object : TextWatcher {

            override fun beforeTextChanged(
                sequence: CharSequence?,
                start: Int,
                count: Int,
                after: Int
            ) {
                // This space intentionally left blank
            }

            override fun onTextChanged(
            sequence: CharSequence?,
                start: Int,
                before: Int,
                count: Int
            ) {
                crime.title = sequence.toString()
            }

            override fun afterTextChanged(sequence: Editable?) {
                // This one too
            }
        }

        titleField.addTextChangedListener(titleWatcher)

        solvedCheckBox.apply {
            setOnCheckedChangeListener { _, isChecked ->
                crime.isSolved = isChecked
            }
        }
    }
}
```

在`onCreateView(...)`函数中，`fragment`的视图是直接通过调用`LayoutInflater.inflate(...)`函数并传入布局的资源`ID`生成的。  
第二个参数是视图的父视图，我们通常需要父视图来正确配置部件。  
第三个参数告诉布局生成器是否立即将生成的视图添加给父视图。  
这里传入了`false`参数，因为`fragment`的视图将由`activity`的容器视图托管。  
稍后，`activity`会处理。

`Fragment.onCreateView(...)`函数中的部件引用几乎等同于`Activity.onCreate(Bundle?)`函数的处理。  
唯一的区别是，你调用了`fragment`视图的`View.findViewById(Int)`函数。

## 托管UI fragment

为托管UI fragment，activity必须：

1. 在其布局中为fragment的视图安排位置；
2. 管理fragment实例的生命周期。

可以写代码把fragment添加给activity。  
这样，你自己便能决定何时添加fragment，以及随后可以完成何种任务。  
你也可以移除fragment，用其他fragment代替当前fragment，甚至重新添加已移除的fragment。

具体代码稍后会给出。现在，先来定义MainActivity的布局。

### 定义容器视图

虽然已选择在托管activity代码中添加UI fragment，但还是要在activity视图层级结构中为fragment视图安排位置。  
找到并打开MainActivity的布局文件res/layout/activity_main.xml，使用一个FrameLayout替换默认布局。  

`res/layout/activity_main.xml`:

```xml
<FrameLayout
        xmlns:android="http://schemas.android.com/apk/res/android"
        android:id="@+id/fragment_container"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>
```

FrameLayout是服务于CrimeFragment的容器视图。  
注意该容器视图是个通用视图，不单单用于某个具体的Fragment类，还可以用它托管其他的fragment。

注意，当前的activity_main.xml布局文件仅由一个服务于单个fragment的容器视图组成，但托管activity布局本身也可以非常复杂。  
除自身部件外，托管activity布局还可定义多个容器视图。

### 向 FragmentManager 中添加 UI fragment

自开始引入Fragment类的时候，为协同工作，Activity类中便添加了FragmentManager类。  
如图所示，这个FragmentManager类具体管理的对象有fragment队列和fragment事务回退栈（稍后会学习）。  
它负责将fragment视图添加到activity的视图层级结构中。

![Fragment Manager](Fragment_4.jfif)

#### 1. fragment事务

获取FragmentManager之后，再获取一个fragment交给它管理，如代码所示。

添加一个CrimeFragment（MainActivity.kt）:

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val currentFragment =
            supportFragmentManager.findFragmentById(R.id.fragment_container)

        if (currentFragment == null) {
            val fragment = CrimeFragment()
            supportFragmentManager
                .beginTransaction()
                .add(R.id.fragment_container, fragment)
                .commit()
        }
    }
}
```

为了以代码的方式把fragment添加给activity，这里显式调用了activity的FragmentManager。  
我们使用supportFragmentManager属性就能获取activity的fragment管理器。  
因为使用了Jetpack库版本的fragment和AppCompatActivity类，所以这里用的是supportFragmentManager。  
前缀support表明它最初来自v4支持库。  
现在，支持库已重新打包为androidx放在Jetpack库里。

以上代码中，获取fragment不难理解。  
add(...)函数及其相关代码才是重点。  
这段代码创建并提交了一个fragment事务：

```kotlin
if (currentFragment == null) {
    val fragment = CrimeFragment()
    supportFragmentManager
        .beginTransaction()
        .add(R.id.fragment_container, fragment)
        .commit()
}
```

fragment事务被用来添加、移除、附加、分离或替换fragment队列中的fragment。  
它们允许你按组执行多个操作，例如，同时添加多个fragment到不同的视图容器里。  
这是使用fragment动态组装和重新组装用户界面的关键。

FragmentManager维护着一个fragment事务回退栈，你可以查看、历数它们。  
如果fragment事务包含多个操作，那么在事务从回退栈里移除时，其批量操作也会回退。  
基于这个原因，UI状态更好控制了。

`FragmentManager.beginTransaction()`函数创建并返回FragmentTransaction实例。  
FragmentTransaction类支持流接口（fluent interface）的链式函数调用，以此配置FragmentTransaction再返回它。  
因此，以上代码可解读为：“创建一个新的fragment事务，执行一个fragment添加操作，然后提交该事务。”

`add(...)`函数是整个事务的核心，它有两个参数：容器视图资源ID和新创建的CrimeFragment。容器视图资源ID你应该很熟悉了，它是定义在activity_main.xml中的FrameLayout部件的资源ID。

容器视图资源ID的作用有：

- 告诉FragmentManager，fragment视图应该出现在activity视图的什么位置；
- 唯一标识FragmentManager队列中的fragment。

如需从FragmentManager中获取CrimeFragment，使用容器视图资源ID就行了：

```kotlin
val currentFragment =
    supportFragmentManager.findFragmentById(R.id.fragment_container)

if (currentFragment == null) {
    val fragment = CrimeFragment()
    supportFragmentManager
        .beginTransaction()
        .add(R.id.fragment_container, fragment)
        .commit()
}
```

FragmentManager使用FrameLayout的资源ID来识别CrimeFragment，这看上去可能有点怪。  
但实际上，使用容器视图资源ID识别UI fragment就是FragmentManager的一种内部实现机制。  
如果要向activity中添加多个fragment，通常需要分别为每个fragment创建具有不同ID的各种容器。

现在，从头至尾做一个总结。

首先，使用R.id.fragment_container的容器视图资源ID，向FragmentManager请求并获取fragment。如果要获取的fragment在队列中，FragmentManager就直接返回它。

为什么要获取的fragment可能已在队列中了呢？  
前面说过，设备旋转或回收内存时，Android系统会销毁MainActivity，而后重建时，会调用MainActivity.onCreate(Bundle?)函数。  
activity被销毁时，它的FragmentManager会将fragment队列保存下来。  
这样，activity重建时，新的FragmentManager会首先获取保存的队列，然后重建fragment队列，从而恢复到原来的状态。

当然，如果指定容器视图资源ID的fragment不存在，则fragment变量为空值。  
这时应该新建CrimeFragment，并启动一个新的fragment事务，将新建fragment添加到队列中。

#### 2. FragmentManager与fragment生命周期

fragment有类似于activity的生命周期：有同样的停止、暂停和运行状态；有可以覆盖的函数，让你能在某些关键时点执行特定任务，而且，这些函数大多和activity生命周期相对应。

![Fragment生命周期](Fragment_5.jfif)

这个对应太重要了。  
因为fragment代表activity工作，所以它的状态要能反映activity状态。  
因此，需要对应的生命周期函数处理activity的工作。

activity的生命周期函数由操作系统负责调用，而fragment的生命周期函数由托管activity的FragmentManager负责调用。  
对于activity用来管理事务的fragment，操作系统概不知情。  
添加fragment供FragmentManager管理时，onAttach(Context?)、onCreate(Bundle?)和onCreateView(...)函数会被调用。

托管activity的onCreate(Bundle?)函数执行后，onActivityCreated(Bundle?)函数也会被调用。  
因为是在MainActivity.onCreate(Bundle?)函数中添加CrimeFragment，所以fragment被添加后，该函数会被调用。

在activity处于运行状态时，添加fragment会发生什么呢？  
这种情况下，FragmentManager会立即驱赶fragment，调用一系列必要的生命周期函数，快速跟上activity的步伐（与activity的最新状态保持同步）。  
例如，向处于运行状态的activity中添加fragment时，以下fragment生命周期函数会被依次调用：

1. onAttach(Context?)
2. onCreate(Bundle?)
3. onCreateView(...)
4. onViewCreated(...)
5. onActivityCreated(Bundle?)
6. onStart()
7. onResume()

一旦追上，托管activity的FragmentManager就会边接收操作系统的调用指令，边调用其他生命周期函数，让 fragment与activity保持步调一致。

## 合理使用 Fragment

设计应用时，正确使用fragment非常重要。  
然而，许多开发者学习了fragment之后，为了复用部件，只要可能，就直接使用fragment。  
这实际是在滥用fragment。

使用fragment的本意是封装关键部件以方便复用。  
这里所说的关键部件，是针对应用的整个屏幕来讲的。  
如果单屏就使用大量fragment，不仅应用代码充斥着fragment事务处理，模块的职责分工也会不清晰。  
如果有很多零碎小部件要复用，比较好的架构设计是使用定制视图（使用View子类）。

总之，一定要合理使用fragment。实践证明，应用单屏最多使用2～3个fragment。

使用fragment的理由：  
使用fragment一直是Android社区争论的焦点。  
有些人认为，fragment及其生命周期会让项目变得复杂，因而从不用它。  
我们认为，这种做法过于极端，因为有好几个Android API，比如ViewPager和JetPack导航库，都依赖于fragment。  
所以，如果要用这些API，就得使用fragment。

除了使用依赖fragment的API外，对于需求复杂的大型应用而言，fragment还是很好用的。  
至于简单的单屏应用，fragment及其生命周期确实显得有点复杂了，因此没必要使用。

不幸的是，经验表明，后期添加fragment就如同掉进泥坑。  
从activity管理用户界面调整到由activity托管UI fragment虽然不难，但会有一大堆恼人的问题等着你。  
你也可能会想让部分用户界面仍由activity管理，部分用户界面改用fragment管理，这只会让事情更糟。  
哪些不改，哪些要改，光厘清这些问题就够你头痛的了。  
显然，从一开始就使用fragment更容易，既不用返工，也不会出现厘不清哪个部分使用了哪种视图控制风格这种事了。

因而，对于是否使用fragment，我们有自己的原则：总是使用fragment。  
如果你知道要开发的应用很简单，多花力气去用fragment就不太值得了，因此不用也罢。  
对于大型应用，fragment带来的灵活性能抵消其复杂性，给项目带来的好处显而易见。

从现在开始，大部分应用开发会使用fragment。不过，假如只需开发一个小应用，简单起见，就不用fragment了。  
然而，对于稍复杂些的应用，不用多想，肯定要用fragment。  
这样既方便应用的未来扩展，也能让你获得足够多的开发体验。
