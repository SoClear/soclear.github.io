# 安全

## 使用 `PendingIntent` 时，禁止使用空 `intent`，同时禁止使用隐式 `Intent`【强制】

说明：

- 使用 `PendingIntent` 时，使用了空 `Intent`，会导致恶意用户劫持修改 `Intent` 的内容。  
  禁止使用一个空 `Intent` 去构造 `PendingIntent`，构造 `PendingIntent` 的 `Intent` 一定要设置 `ComponentName` 或者 `action`。  

- `PendingIntent` 可以让其他 APP 中的代码像是运行自己 APP 中。  
  `PendingIntent`
  的 `intent` 接收方在使用该 `intent` 时与发送方有相同的权限。  
  在使用 `PendingIntent` 时，`PendingIntent` 中包装的 `intent` 如果是隐式的 `Intent` ，容易遭到劫持，导致信息泄露。

正例：

```java
Intent intent = new Intent(this, SomeActivity.class);
PendingIntent pendingIntent = PendingIntent.getActivity(this, 1, intent, PendingIntent.FLAG_UPDATE_CURRENT);
try {
    pendingIntent.send();
} catch (PendingIntent.CanceledException e) {
    e.printStackTrace();
}
```

反例1 ：

```java
Bundle addAccountOptions = new Bundle();
mPendingIntent = PendingTntent.getBroadcast(this, 0, new Intent, 0);
addAccountOptions.putParcelable(KEY_CALLER_IDENTITY, mPendingIntent);
addAccountOptions.putBoolean(EXTRA_HAS_MULTIPLE_USERS, Utils.hasMultipleUsers(this));
AccountManager.get(this).addAccount(accountType, null, null, addAccountOptions, null, mCallback, null);
```

反例2 ：

`mPendingIntent` 是通过 `new Intent()` 构造原始 `Intent` 的，所以为“双无” `Intent`，这个`PendingIntent` 最终被通过 `AccountManager.addAccount` 方法传递给了恶意 `APP` 接口。

```java
Intent intent = new Intent("com.test.test.pushservice.action.METHOD");
intent.addFlags(32);
intent.putExtra("app", PendingIntent.getBroadcast(this, 0, intent, 0));
```

如上代码 `PendingIntent.getBroadcast`，`PendingItent` 中包含的 `Intent` 为隐式 `intent` ，因此当 `PendingIntent` 触发执行时，发送的 `intent` 很可能被嗅探或者劫持，导致 `intent`内容泄漏。

## 禁止使用常量初始化矢量参数构建 IvParameterSpec【强制】

禁止使用常量初始化矢量参数构建 IvParameterSpec，建议 IV 通过随机方式产生。

说明：

使用固定初始化向量，结果密码文本可预测性会高得多，容易受到字典式攻击。  
iv 的作用主要是用于产生密文的第一个 block，以使最终生成的密文产生差异（明文相同的情况下），使密码攻击变得更为困难，除此之外iv 并无其它用途。  
因此 iv 通过随机方式产生是一种十分简便、有效的途径。

正例：

```java
byte[] rand = new byte[16];
SecureRandom r = new SecureRandom();
r.nextBytes(rand);
IvParameterSpec iv = new IvParameterSpec(rand);
```

反例：

```java
IvParameterSpec iv_ = new IvParameterSpec("1234567890".getBytes());
System.out.println(iv_.getIV());
```

## 将 android:allowbackup 属性设置为 false，防止 adb backup 导出数据【强制】

说明：

在 `AndroidManifest.xml` 文件中为了方便对程序数据的备份和恢复在 Android API level 8 以后增加了 `android:allowBackup` 属性值。  
默认情况下这个属性值为 true,故当 allowBackup 标志值为 true 时，即可通过 adb backup 和 adb restore 来备份和恢复应用程序数据。

正例：

```xml
<application
    android:allowBackup="false"
    android:largeHeap="true"
    android:icon="@drawable/test_launcher"
    android:label="@string/app_name"
    android:theme="@style/AppTheme" >
```

## 校验主机名【强制】

在实现的 `HostnameVerifier` 子类中，需要使用 `verify` 函数效验服务器主机名的合法性，否则会导致恶意程序利用中间人攻击绕过主机名效验。

说明：

在握手期间，如果 URL 的主机名和服务器的标识主机名不匹配，则验证机制可以回调此接口的实现程序来确定是否应该允许此连接。  
如果回调内实现不恰当，默认接受所有域名，则有安全风险。

反例：

```java
HostnameVerifier hnv = new HostnameVerifier() {
    @Override
    public boolean verify(String hostname, SSLSession session) {
        // 总是返回 true，接受任意域名服务器
        return true;
    }
};
HttpsURLConnection.setDefaultHostnameVerifier(hnv);
```

正例：

```java
HostnameVerifier hnv = new HostnameVerifier() {
    @Override
    public boolean verify(String hostname, SSLSession session) {
        //示例
        if("yourhostname".equals(hostname)){
            return true;
        } else {
            HostnameVerifier hv = HttpsURLConnection.getDefaultHostnameVerifier();
            return hv.verify(hostname, session);
        }
    }
};
```

## 校验服务器端证书的合法性【强制】

利用 `X509TrustManager` 子类中的 `checkServerTrusted` 函数效验服务器端证书的合法性。

说明：

在实现的 `X509TrustManager` 子类中未对服务端的证书做检验，这样会导致不被信任的证书绕过证书效验机制。

反例：

```java
TrustManager tm = new X509TrustManager() {
    public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
        //do nothing，接受任意客户端证书
    }

    public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
        //do nothing，接受任意服务端证书
    }

    public X509Certificate[] getAcceptedIssuers() {
        return null;
    }
};
sslContext.init(null, new TrustManager[]{tm}, null);
```

## META-INF 目录中不能包含如.apk,.odex,.so 等敏感文件【强制】

META-INF 目录中不能包含如.apk,.odex,.so 等敏感文件，该文件夹没有经过签名，容易被恶意替换。

## Receiver/Provider 不能在毫无权限控制的情况下，将 android:export 设置为 true【强制】

## 数据存储在 Sqlite 或者轻量级存储需要对数据进行加密，取出来的时候进行解密【参考】

## 阻止 webview 通过 file:schema 方式访问本地敏感数据【强制】

## 不要广播敏感信息【强制】

不要广播敏感信息，只能在本应用使用 `LocalBroadcast`，避免被别的应用收到，或者 `setPackage` 做限制。

## 不要把敏感信息打印到 log 中【强制】

说明：

在 `APP` 的开发过程中，为了方便调试，通常会使用 `log` 函数输出一些关键流程的信息，这些信息中通常会包含敏感内容，如执行流程、明文的用户名密码等，这会让攻击者更加容易的了解 `APP` 内部结构方便破解和攻击，甚至直接获取到有价值的敏感信息。

反例：

```java
String username = "log_leak";
String password = "log_leak_pwd";
Log.d("MY_APP", "usesname" + username);
Log.d("MY_APP", "password" + password, new Throwable());
Log.v("MY_APP", "send message to server ");
```

以上代码使用 `Log.d Log.v` 打印程序的执行过程的 `username` 等调试信息，日志没有关闭，攻击者可以直接从 Logcat 中读取这些敏感信息。  
所以在产品的线上版本中关闭调试接口，不要输出敏感信息。

## 对于内部使用的组件，显示设置组件的 `"android:exported"` 属性为 `false`【强制】

说明：

`Android` 应用使用 `Intent` 机制在组件之间传递数据，如果应用在使用 `getIntent()`，
`getAction()`，`Intent.getXXXExtra()`获取到空数据、异常或者畸形数据时没有进行异
常捕获，应用就会发生 Crash，应用不可使用（本地拒绝服务）。  
恶意应用可通过向受害者应用发送此类空数据、异常或者畸形数据从而使应用产生本地拒绝服务。

## 应用发布前确保 `android:debuggable` 属性设置为 `false` 【强制】

## 使用 Intent Scheme URL 需要做过滤【强制】

说明：

如果浏览器支持 Intent Scheme Uri 语法，如果过滤不当，那么恶意用户可能通过浏览器 js 代码进行一些恶意行为，比如盗取 cookie 等。  
如果使用了 `Intent.parseUri` 函数，获取的 `intent` 必 须 严格过滤， `intent` 至少包含 `addCategory(“android.intent.category.BROWSABLE”)` ， `setComponent(null)` ，
`setSelector(null)` 3 个策略。

正例：

```java
// 将 intent scheme URL 转换为 intent 对象
Intent intent = Intent.parseUri(uri); 
// 禁止没有 BROWSABLE category 的情况下启动 activity
intent.addCategory("android.intent.category.BROWSABLE"); 
intent.setComponent(null); 
intent.setSelector(null); 
// 使用 intent 启动 activity
context.startActivityIfNeeded(intent, -1);
```

反例：

```java
Intent intent = Intent.parseUri(uri.toString().trim().substring(15), 0);
intent.addCategory("android.intent.category.BROWSABLE");
context.startActivity(intent);
```

## 密钥加密存储或者经过变形处理后用于加解密运算，切勿硬编码到代码中

说明：

应用程序在加解密时，使用硬编码在程序中的密钥，攻击者通过反编译拿到密钥可以轻易解密 APP 通信数据。

## 将所需要动态加载的文件放置在 apk 内部，或应用私有目录中【强制】

将所需要动态加载的文件放置在 apk 内部，或应用私有目录中，如果应用必须要把所加载的文件放置在可被其他应用读写的目录中(比如 sdcard)，建议对不可信的加载源进行完整性校验和白名单处理，以保证不被恶意代码注入。

## 除非 min API level >=17，请注意 ·addJavascriptInterface· 的使用【强制】

说明：
API level>=17，允许 js 被调用的函数必须以 `@JavascriptInterface` 进行注解，因此不受影响； 对于 API level < 17，尽量不要使用 `addJavascriptInterface`，如果一定要用，那么：

- 使用 https 协议加载 URL，使用证书校验，防止访问的页面被篡改挂马；
- 对加载 URL 做白名单过滤、完整性校验等防止访问的页面被篡改；
- 如果加载本地 html,应该会 HTML 内置在 APK 中，以及对 HTML 页面进行完整性校验。

## 使用 Android 的 AES/DES/DESede 加密算法时，不要使用默认的加密模式ECB，应显示指定使用 CBC 或 CFB 加密模式【强制】

说明：

加密模式 ECB、CBC、CFB、OFB 等，其中 ECB 的安全性较弱，会使相同的铭文在不同的时候产生相同的密文，容易遇到字典攻击，建议使用 CBC 或 CFB 模式。

- ECB：Electronic codebook，电子密码本模式
- CBC：Cipher-block chaining，密码分组链接模式
- CFB：Cipher feedback，密文反馈模式
- OFB：Output feedback，输出反馈模式

## 不要使用 `loopback` 来通信敏感信息【推荐】

## 对于不需要使用 File 协议的应用，禁用 File 协议【强制】

对于不需要使用 `File` 协议的应用，禁用 `File` 协议，显式设置 `webView.getSettings().setAllowFileAccess(false)`。  
对于需要使用 `File` 协议的应用，禁止 `File` 协议调用 `JavaScript`，显式设置 `webView.getSettings().setJavaScriptEnabled(false)` 。

## Android APP 在 HTTPS 通信中，验证策略需要改成严格模式【强制】

说明：

Android APP 在 HTTPS 通信中，使用 `ALLOW_ALL_HOSTNAME_VERIFIER` ，表示允许和所有的 HOST 建立 SSL 通信，这会存在中间人攻击的风险，最终导致敏感信息可能会被劫持，以及其他形式的攻击。

反例：

```java
SSLSocketFactory sf = new MySSLSocketFactory(trustStore);
sf.setHostnameVerifier(SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);
```

- `ALLOW_ALL_HOSTNAME_VERIFIER` 关闭 host 验证，允许和所有的 host 建立SSL 通信。
- `BROWSER_COMPATIBLE_HOSTNAME_VERIFIER` 和浏览器兼容的验证策略，即通配符能够匹配所有子域名。
- `STRICT_HOSTNAME_VERIFIER` 严格匹配模式，hostname 必须匹配第一个 CN 或者任何一个 subject-alts

以上例子使用了 `ALLOW_ALL_HOSTNAME_VERIFIER`，需要改成 `STRICT_HOSTNAME_VERIFIER`。

## Android5.0 以后安全性要求 较高的应用应该使用 `window.setFlag(LayoutParam.FLAG_SECURE)` 禁止录屏【推荐】

## zip 中不建议允许../../file 这样的路径【推荐】

zip 中不建议允许`../../file` 这样的路径，可能被篡改目录结构，造成攻击。

说明：

当 zip 压缩包中允许存在 `"../"` 的字符串，攻击者可以利用多个 `"../"` 在解压时改变zip 文件存放的位置，当文件已经存在是就会进行覆盖，如果覆盖掉的文件是 so、dex 或者 odex 文件，就有可能造成严重的安全问题。

正例：

对路径进行判断，存在 `".."` 时抛出异常。

```java
//对重要的 Zip 压缩包文件进行数字签名校验，校验通过才进行解压
String entryName = entry.getName();
if (entryName.contains("..")){
    throw new Exception("unsecurity zipfile!");
}
```

反例：

```java
BufferedOutputStream dest = null;
try {
    ZipInputStream zis = new ZipInputStream(new BufferedInputStream(new FileInputStream("/Users/yunmogong/Documents/test/test.zip")));
    ZipEntry entry;
    while ((entry = zis.getNextEntry()) != null) {
        int count;
        byte data[] = new byte[BUFFER];
        String entryName = entry.getName();
        FileOutputStream fos = new FileOutputStream(entryName);
        //System.out.println("Extracting:" + entry); 
        dest = new BufferedOutputStream(fos, BUFFER);
        while ((count = zis.read(data, 0, BUFFER)) != -1) {
            dest.write(data, 0, count);
        }
        dest.flush();
    }
} catch (IOException e) {
    e.printStackTrace();
} finally {
    try {
        dest.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

如上代码，没有对文件的路径名进行判断直接进行解压，如果路径中包含 `../` 字符串，就会造成目录的遍历问题，一旦遭到中间人攻击替换下载的文件，将会导致某些恶意文件被执行。

## 开放的 activity/service/receiver 等需要对传入的 intent 做合法性校验【强制】

## 使用 SHA-256 等安全性更高的 Hash 算法【推荐】

加密算法：使用不安全的 Hash 算法(MD5/SHA-1)加密信息，存在被破解的风险，建议使用 SHA-256 等安全性更高的 Hash 算法。

## Android WebView 组件加载网页发生证书认证错误时,采用默认的处理方法 `handler.cancel()` ，停止加载问题页面

说明：

Android WebView 组件加载网页发生证书认证错误时，会调用 `WebViewClient` 类的`onReceivedSslError` 方法，如果该方法实现调用了 `handler.proceed()` 来忽略该证书错误，则会受到中间人攻击的威胁，可能导致隐私泄露。

反例：

```java
mWebView.getSettings().setJavaScriptEnabled(true);
mWebView.addJavascriptInterface(new JsBridge(mContext), JS_OBJECT);
mWebView.loadUrl("http://www.example.org/tests/addjsif/");
mWebView.setWebViewClient(new WebViewClient() {
    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        handler.proceed(); // 忽略 SSL 证书错误
    }
});
```

## 直接传递命令字或者间接处理有敏感信息或操作时，避免使用 socket 实现，使用能够控制权限校验身份的方式通讯【推荐】
