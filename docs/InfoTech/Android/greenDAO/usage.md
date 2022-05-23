# 使用

## 将greenDAO添加到您的项目中

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

## 核心类

![核心类](Core-Classes.webp)

一旦你**定义了至少一个实体并构建了你的项目**，你就可以开始在你的Android项目中使用greenDAO。

以下核心类是 greenDAO 的基本接口：

### [DaoMaster](http://greenrobot.org/files/greendao/javadoc/current/org/greenrobot/greendao/AbstractDaoMaster.html)

使用绿色 DAO 的入口点。DaoMaster持有数据库对象（SQLiteDatabase）并管理特定模式的DAO类（而不是对象）。它具有用于创建表或删除表的静态方法。它的内部类OpenHelper和DevOpenHelper是SQLiteOpenHelper实现，用于在SQLite数据库中创建模式。

### [DaoSession](http://greenrobot.org/files/greendao/javadoc/current/org/greenrobot/greendao/AbstractDaoSession.html)

管理特定架构的所有可用 DAO 对象，您可以使用其中一个 getter 方法获取这些对象。DaoSession 还提供了一些通用的持久性方法，如实体的插入、加载、更新、刷新和删除。最后，DaoSession 对象还会跟踪标识范围。有关更多详细信息，请查看[会话文档](http://greenrobot.org/greendao/documentation/sessions/ "Sessions")。

### [DAOs](http://greenrobot.org/files/greendao/javadoc/current/org/greenrobot/greendao/AbstractDao.html)

数据访问对象 （DAO） 保留并查询实体。对于每个实体，greenDAO 都会生成一个 DAO。它具有比 DaoSession 更多的持久性方法，例如：count、loadAll 和 insertInTx。

### 实体

持久化对象。通常，实体是使用标准 Java 属性（如 POJO 或 JavaBean）表示数据库行的对象。

## 核心初始化

最后，初始化数据库和核心 greenDAO 类的第一步：

```java
// do this once, for example in your Application class
helper = new DaoMaster.DevOpenHelper(this, "notes-db", null);
db = helper.getWritableDatabase();
daoMaster = new DaoMaster(db);
daoSession = daoMaster.newSession();
// do this in your activities/fragments to get hold of a DAO
noteDao = daoSession.getNoteDao();
```

该示例假定注意`Note`存在。凭借其 DAO （`noteDao` object），我们可以调用此特定实体的持久性操作。
