# ViewModel

## 概念

在项目里添加ViewModel类。  
这个类来自一个叫lifecycle-extensions的Android Jetpack库：  
`implementation 'androidx.lifecycle:lifecycle-extensions:2.0.0'`  

ViewModel持有模型对象。  
使用ViewModel，可以把所有要显示在用户界面上的数据汇集在一处，统一格式化加工处理供其他对象获取。

在Activity首次访问ViewModel对象时，ViewModelProvider会创建并返回一个QuizViewModel新实例。  
在设备配置改变之后，Activity再次访问ViewModel对象时，它返回的是之前创建的QuizViewModel。  
在MainActivity完成使命销毁时（比如用户按了回退键），ViewModel-Activity这对好朋友也就从内存里抹掉了。

## 注意

请在Activity里惰性初始化ViewModel对象。
