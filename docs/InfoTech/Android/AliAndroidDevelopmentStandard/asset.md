# Android 资源文件命名与使用

## 资源文件需带模块前缀【推荐】

## layout 文件的命名方式【推荐】

- Activity 的 layout 以 module_activity 开头
- Fragment 的 layout 以 module_fragment 开头
- Dialog 的 layout 以 module_dialog 开头
- include 的 layout 以 module_include 开头
- ListView 的行 layout 以 module_list_item 开头
- RecyclerView 的 item layout 以 module_recycle_item 开头
- GridView 的行 layout 以 module_grid_item 开头

## drawable 资源名称【推荐】

drawable 资源名称以小写单词+下划线的方式命名，根据分辨率不同存放
在不同的 drawable 目录下，建议只使用一套,例如 drawable-xhdpi。  
采用规则如下:  
`模块名_业务功能描述_控件描述_控件状态限定词`  
例如：`module_login_btn_pressed`，`module_tabs_icon_home_normal`

## anim 资源名称【推荐】

anim 资源名称以小写单词+下划线的方式命名，采用以下规则：  
`模块名_逻辑名称_[方向|序号]`  

tween 动画资源 ： 尽可能以通用的动画名称命名，如 module_fade_in ,
module_fade_out , module_push_down_in (动画+方向)。

frame 动画资源：尽可能以`模块+功能命名+序号`。如：module_loading_grey_001

## color 资源【推荐】

color 资源使用#AARRGGBB 格式，写入 module_colors.xml 文件中，命
名格式采用以下规则：  
`模块名_逻辑名称_颜色`  
如：

```xml
<color name="module_btn_bg_color">#33b5e5e5</color>
```

## dimen 资源【推荐】

dimen 资源以小写单词+下划线方式命名，写入 module_dimens.xml 文件中，
采用以下规则：  
`模块名_描述信息`  
如：  

```xml
<dimen name="module_horizontal_line_height">1dp</dimen>
```

## style 资源【推荐】

采用小写单词+下划线方式命名，写入 module_styles.xml 文件中，
采用以下规则：  
`父 style 名称.当前 style 名称`  
如:

```xml
<style name="ParentTheme.ThisActivityTheme">
 …
</style>
```

## string资源【推荐】

string资源文件或者文本用到字符需要全部写入module_strings.xml文件中，
字符串以小写单词+下划线的方式命名，采用以下规则：  
`模块名_逻辑名称`  
如：moudule_login_tips,module_homepage_notice_desc

## Id 资源【推荐】

原则上以驼峰法命名，View 组件的资源 id 需要以 View 的缩写作为前缀。  
常用缩写表如下：

| 控件             | 缩写 |
| ---------------- | ---- |
| LinearLayout     | ll   |
| RelativeLayout   | rl   |
| ConstraintLayout | cl   |
| ListView         | lv   |
| ScollView        | sv   |
| TextView         | tv   |
| Button           | btn  |
| ImageView        | iv   |
| CheckBox         | cb   |
| RadioButton      | rb   |
| EditText         | et   |

其它控件的缩写推荐使用小写字母并用下划线进行分割，例如：  
ProgressBar 对应的缩写为 progress_bar  
DatePicker 对应的缩写为 date_picker  

## 大分辨率图片放置目录【推荐】

大分辨率图片（单维度超过 1000）建议统一放在 xxhdpi 目录下管理，否则将导致占用内存成倍数增加。

说明：  
为了支持多种屏幕尺寸和密度，Android 为多种屏幕提供不同的资源目录进行适配。  
为不同屏幕密度提供不同的位图可绘制对象，可用于密度特定资源的配置限定符（在
下面详述） 包括 ldpi（低）、mdpi（中）、 hdpi（高）、xhdpi（超高）、xxhdpi （超超高）和 xxxhdpi（超超超高）。  
例如，高密度屏幕的位图应使用 drawable-hdpi/。  
根据当前的设备屏幕尺寸和密度，将会寻找最匹配的资源，如果将高分辨率图片放
入低密度目录，将会造成低端机加载过大图片资源，又可能造成 OOM，同时也是资
源浪费，没有必要在低端机使用大图。

正例：  
将 144\*144 的应用图标 PNG 文件放在 drawable-xxhdpi 目录  
反例：  
将 144\*144 的应用图标 PNG 文件放在 drawable-mhdpi 目录
