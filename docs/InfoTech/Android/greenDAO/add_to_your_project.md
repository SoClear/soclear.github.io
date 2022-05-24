# 引入到你的项目

## 将greenDAO添加到您的项目的gradle配置中

greenDAO在Maven Central上可用。  
请确保您使用的是最新版本的[greenDAO](https://search.maven.org/search?q=g:org.greenrobot%20AND%20a:greendao)和[greenDAO-gradle-plugin](https://search.maven.org/search?q=g:org.greenrobot%20AND%20a:greendao-gradle-plugin)工件。

将以下 Gradle 配置添加到您的 Android 项目中。在根文件中：`build.gradle`

```groovy
buildscript {
    repositories {
        jcenter()
        mavenCentral() // add repository
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.5.3'
        classpath 'org.greenrobot:greendao-gradle-plugin:3.3.0' // add plugin
    }
}
```

在应用模块文件中：`app/build.gradle`

```groovy
apply plugin: 'com.android.application'
apply plugin: 'org.greenrobot.greendao' // apply plugin
 
dependencies {
    implementation 'org.greenrobot:greendao:3.3.0' // add library
}
```

请注意，这会将 greenDAO Gradle 插件连接到您的构建过程。当您构建项目时，它会生成 DaoMaster、DaoSession 和 DAO 等类。

在[“入门”](https://greenrobot.org/greendao/documentation/how-to-get-started/)页上继续。

## R8, ProGuard

如果您的项目使用 R8 或 ProGuard，请添加以下规则：

```shell
-keepclassmembers class * extends org.greenrobot.greendao.AbstractDao {
public static java.lang.String TABLENAME;
}
-keep class **$Properties { *; }

# If you DO use SQLCipher:
-keep class org.greenrobot.greendao.database.SqlCipherEncryptedHelper { *; }

# If you do NOT use SQLCipher:
-dontwarn net.sqlcipher.database.**
# If you do NOT use RxJava:
-dontwarn rx.**
```

## 创建实体模型

Build > Make Project
