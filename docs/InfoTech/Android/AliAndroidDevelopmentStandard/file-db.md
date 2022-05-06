# 文件与数据库

## 任何时候不要硬编码文件路径，请使用 Android 文件系统 API 访问【强制】

说明：

Android 应用提供内部和外部存储，分别用于存放应用自身数据以及应用产生的用户数据。可以通过相关 API 接口获取对应的目录，进行文件操作。

```java
android.os.Environment#getExternalStorageDirectory()
android.os.Environment#getExternalStoragePublicDirectory()
android.content.Context#getFilesDir()
android.content.Context#getCacheDir
```

正例：

```java
public File getDir(String alName) {
    File file = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), alName);
    if (!file.mkdirs()) {
        Log.e(LOG_TAG, "Directory not created");
    }
    return file;
}
```

反例：

```java
public File getDir(String alName) {
    // 任何时候都不要硬编码文件路径，这不仅存在安全隐患，也让 app 更容易出现适配问题
    File file = new File("/mnt/sdcard/Download/Album", alName);
    if (!file.mkdirs()) {
        Log.e(LOG_TAG, "Directory not created");
    }
    return file;
}
```

## 当使用外部存储时，必须检查外部存储的可用性

正例：

```java
// 读/写检查
public boolean isExternalStorageWritable() {
    String state = Environment.getExternalStorageState();
    if (Environment.MEDIA_MOUNTED.equals(state)) {
        return true;
    }
    return false;
}

// 只读检查
public boolean isExternalStorageReadable() {
    String state = Environment.getExternalStorageState();
    if (Environment.MEDIA_MOUNTED.equals(state) || Environment.MEDIA_MOUNTED_READ_ONLY.equals(state)) {
        return true;
    }
    return false;
}
```

## 使用 FileProvider 共享应用间文件【强制】

应用间共享文件时，不要通过放宽文件系统权限的方式去实现，而应使用FileProvider。

正例：

```xml
<!-- AndroidManifest.xml -->
<manifest>
    ...
    <application>
        ...
        <provider
                android:name="android.support.v4.content.FileProvider"
                android:authorities="com.example.fileprovider"
                android:exported="false"
                android:grantUriPermissions="true">
            <meta-data
                    android:name="android.support.FILE_PROVIDER_PATHS"
                    android:resource="@xml/provider_paths" />
        </provider>
        ...
    </application>
</manifest>

<!-- res/xml/provider_paths.xml -->
<paths>
<files-path path="album/" name="myimages" />
</paths>
```

```java
void getAlbumImage(String imagePath) {
    File image = new File(imagePath);
    Intent getAlbumImageIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    Uri imageUri = FileProvider.getUriForFile(
            this,
            "com.example.provider",
            image);
    getAlbumImageIntent.putExtra(MediaStore.EXTRA_OUTPUT, imageUri);
    startActivityForResult(takePhotoIntent, REQUEST_GET_ALBUMIMAGE);
}
```

反例：

```java
void getAlbumImage(String imagePath) {
    File image = new File(imagePath);
    Intent getAlbumImageIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    //不要使用 file://的 URI 分享文件给别的应用，包括但不限于 Intent
    getAlbumImageIntent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(image));
    startActivityForResult(takePhotoIntent, REQUEST_GET_ALBUMIMAGE);
}
```

## SharedPreference 中只能存储简单数据类型【推荐】

SharedPreference 中只能存储简单数据类型（int、boolean、String 等），复杂数据类型建议使用文件、数据库等其他方式存储。

正例：

```java
public void updateSettings() {
    SharedPreferences mySharedPreferences = getSharedPreferences("settings", Activity.MODE_PRIVATE);
    SharedPreferences.Editor editor = mySharedPreferences.edit();
    editor.putString("id", "foo");
    editor.putString("nick", "bar");
    //不要把复杂数据类型转成 String 存储
    editor.apply();
}
```

## SharedPreference 提 交 数 据 时 ， 尽 量 使 用 Editor#apply() 【推荐】

SharedPreference 提交数据时，尽量使用 Editor#apply() ，而非 Editor#commit()。一般来讲，仅当需要确定提交结果，并据此有后续操作时，才使用 Editor#commit()。

说明：

SharedPreference 相关修改使用 apply 方法进行提交会先写入内存，然后异步写入磁盘，commit 方法是直接写入磁盘。  
如果频繁操作的话 apply 的性能会优于 commit，apply 会将最后修改内容写入磁盘。  
但是如果希望立刻获取存储操作的结果，并据此做相应的其他操作，应当使用 commit。

正例：

```java
public void updateSettingsAsync() {
    SharedPreferences mySharedPreferences = getSharedPreferences("settings", Activity.MODE_PRIVATE);
    SharedPreferences.Editor editor = mySharedPreferences.edit();
    editor.putString("id", "foo");
    editor.apply();
}

public void updateSettings() {
    SharedPreferences mySharedPreferences = getSharedPreferences("settings", Activity.MODE_PRIVATE);
    SharedPreferences.Editor editor = mySharedPreferences.edit();
    editor.putString("id", "foo");
    if (!editor.commit()) {
        Log.e(LOG_TAG, "Failed to commit setting changes");
    }
}
```

反例：

```java
editor.putLong("key_name", "long value");
editor.commit();
```

## 数据库 Cursor 必须确保使用完后关闭，以免内存泄漏【强制】

说明：

Cursor 是对数据库查询结果集管理的一个类，当查询的结果集较小时，消耗内存不易察觉。  
但是当结果集较大，长时间重复操作会导致内存消耗过大，需要开发者在操作完成后手动关闭 Cursor。  
数据库 Cursor 在创建及使用时，可能发生各种异常，无论程序是否正常结束，必须
在最后确保 Cursor 正确关闭，以避免内存泄漏。  
同时，如果 Cursor 的使用还牵涉多线程场景，那么需要自行保证操作同步。

正例：

```java
public void handlePhotos(SQLiteDatabase db, String userId) {
    Cursor cursor;
    try {
        cursor = db.query(TUserPhoto, new String[]{"userId", "content"}, "userId=?", new String[]{userId}, null, null, null);
        while (cursor.moveToNext()) {
            // TODO
        }
    } catch (Exception e) {
        // TODO
    } finally {
        if (cursor != null) {
            cursor.close();
        }
    }
}
```

反例：

```java
public void handlePhotos(SQLiteDatabase db, String userId) {
    Cursor cursor = db.query(TUserPhoto, new String[]{"userId", "content"}, "userId=?", new
            String[]{userId}, null, null, null);
    while (cursor.moveToNext()) {
        // TODO
    }
// 不能放任 cursor 不关闭
}
```

## 多线程操作写入数据库时，需要使用事务，以免出现同步问题【强制】

说明：

Android 的通过 SQLiteOpenHelper 获取数据库 SQLiteDatabase 实例，Helper 中会
自动缓存已经打开的 SQLiteDatabase 实例，单个 App 中应使用 SQLiteOpenHelper
的单例模式确保数据库连接唯一。  
由于 SQLite 自身是数据库级锁，单个数据库操作是保证线程安全的（不能同时写入），transaction 时一次原子操作，因此处于事务中的操作是线程安全的。  
若同时打开多个数据库连接，并通过多线程写入数据库，会导致数据库异常，提示数据库已被锁住。

正例：

```java
public void insertUserPhoto(SQLiteDatabase db, String userId, String content) {
    ContentValues cv = new ContentValues();
    cv.put("userId", userId);
    cv.put("content", content);
    db.beginTransaction();
    try {
        db.insert(TUserPhoto, null, cv);
        // 其他操作
        db.setTransactionSuccessful();
    } catch (Exception e) {
        // TODO
    } finally {
        db.endTransaction();
    }
}
```

反例：

```java
public void insertUserPhoto(SQLiteDatabase db, String userId, String content) {
    ContentValues cv = new ContentValues();
    cv.put("userId", userId);
    cv.put("content", content);
    db.insert(TUserPhoto, null, cv);
}
```

## 大数据写入数据库时，请使用事务或其他能够提高 I/O 效率的机制，保证执行速度【推荐】

正例：

```java
public void insertBulk(SQLiteDatabase db, ArrayList<UserInfo> users) {
    db.beginTransaction();
    try {
        for (int i = 0; i < users.size; i++) {
            ContentValues cv = new ContentValues();
            cv.put("userId", users[i].userId);
            cv.put("content", users[i].content);
            db.insert(TUserPhoto, null, cv);
        }
        // 其他操作
        db.setTransactionSuccessful();
    } catch (Exception e) {
        // TODO
    } finally {
        db.endTransaction();
    }
}
```

## 不要使用 SQLiteDatabase#execSQL()【强制】

执行 SQL 语句时，应使用 SQLiteDatabase#insert()、update()、delete()，不要使用 SQLiteDatabase#execSQL()，以免 SQL 注入风险。

正例：

```java
public int updateUserPhoto(SQLiteDatabase db, String userId, String content) {
    ContentValues cv = new ContentValues();
    cv.put("content", content);
    String[] args = {String.valueOf(userId)};
    return db.update(TUserPhoto, cv, "userId=?", args);
}
```

反例：

```java
public void updateUserPhoto(SQLiteDatabase db, String userId, String content) {
    String sqlStmt = String.format("UPDATE %s SET content=%s WHERE userId=%s", TUserPhoto, userId, content);
    //请提高安全意识，不要直接执行字符串作为 SQL 语句
    db.execSQL(sqlStmt);
}
```

## 避免将不受信任的外部数据直接拼接在原始 SQL 语句中【强制】

如果 ContentProvider 管理的数据存储在 SQL 数据库中，应该避免将不受信任的外部数据直接拼接在原始 SQL 语句中，可使用一个用于将 ? 作为可替换参数的选择子句以及一个单独的选择参数数组，会避免 SQL 注入。

正例：

```java
// 使用一个可替换参数
String mSelectionClause = "var = ?";
String[] selectionArgs = {""};
selectionArgs[0] = mUserInput;
```

反例：

```java
// 拼接用户输入内容和列名
String mSelectionClause = "var = " + mUserInput;
```
