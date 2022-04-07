---
title: Android
description: 
published: true
date: 2022-04-03T04:33:11.876Z
tags: 
editor: markdown
dateCreated: 2022-04-03T02:02:05.646Z
---

# 引入ViewModel
在Activity关联ViewModel需要在模块下引入依赖
```groovy
implementation "androidx.activity:activity-ktx:$activity_version"
implementation "androidx.fragment:fragment-ktx:$fragment_version"
```
用到那个引用哪个
使用方法:
```kotlin
val quizViewModel:QuizViewModel by viewModels()
```
QuizViewModel和MainActivity的关系是单向的。某个activity会引用其关联ViewModel，反过来则不行。一个ViewModel绝不能引用activity或view，否则会引发内存泄漏。

# 暂存状态
只要在未结束使用的activity进入停止状态时（比如用户按了Home按钮，启动另一个应用时），操作系统都会调用Activity.onSaveInstanceState(Bundle)。这个时间点很重要，因为停止的activity会被标记为killable。如果应用进程因低优先级被“杀死”，那么，你大可放心Activity.onSaveInstanceState(Bundle)肯定已被调用过。

保留实例状态数据是要序列化到磁盘的，所以应避免用它保存任何大而复杂的对象。

因而，常见的做法是，覆盖onSaveInstanceState(Bundle)函数，在Bundle对象中，保存当前activity小的或暂存状态的数据；覆盖onStop()函数，保存永久性数据，比如用户编辑的文字等。调用完onStop()函数后，activity随时会被系统销毁，所以用它保存永久性数据。

那么暂存的activity记录到底可以保留多久呢？
前面说过，用户按了回退键后，系统会彻底销毁当前的activity。此时，暂存的activity记录会同时被清除。
用户在任务界面清除应用，暂存的activity记录也会被清除。
此外，如果系统重启，那么暂存的activity记录也会被清除。

使用保留实例状态保存少量必需信息以重建UI状态（例如，GeoQuiz应用的currentIndex）。使用ViewModel保存的更丰富的数据，可以快速方便地取回来填充UI，以应对设备配置改变。如果activity是在进程销毁后重建，那就借助保留实例状态先创建ViewModel，从而达到ViewModel和activity从未失效的效果。

# 何时会销毁ViewModel?
两种情况:
- 用户主动销毁 : `Actiuvity.isFinishing`为`true`
- 被系统销毁 : `Actiuvity.isFinishing`为`false`

如果Activity被用户主动销毁就会同时销毁ViewModel

通过检查activity的isFinishing属性可以知道哪一场景正在上演。
如果isFinishing属性值是true，那么activity正在被销毁，因为用户结束使用当前activity了（比如按了回退键，或者从概览屏消除了应用卡片）。
如果isFinishing属性值是false，activity则正在被系统销毁，因为设备配置改变了。

# 新版Logcat
见 https://androidstudio.googleblog.com/2022/03/android-studio-dolphin-canary-6-now.html