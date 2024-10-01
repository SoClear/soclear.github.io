# 应用安装目录

当一个APK文件被安装到Android设备上时，其文件和相关数据会被分配到多个不同的目录中。以下是安装过程中涉及到的一些关键目录：

1. **/data/app/** ：
   - 这是用户安装的应用程序的主要存储目录。APK文件会被复制到这里，然后解压并准备好运行。这是用户有权访问的目录，并且用户可以删除在此目录下的应用。

2. **/data/data/** ：
   - 这个目录用于存放应用程序的数据，例如数据库文件、缓存文件以及其他私有数据。每个应用程序都有自己的子目录，通常以该应用的包名为前缀。

3. **/data/dalvik-cache/** ：
   - 在使用Dalvik虚拟机的Android版本中，APK文件中的DEX字节码会被提取到这个目录中。然而，在使用Android Runtime (ART)的现代Android版本中，DEX文件被预编译并存储在/data/app/目录下的OAT（提前编译）文件中，而不是传统的dalvik-cache目录。

4. **/system/app/** ：
   - 这个目录通常用于存放系统自带的应用程序，这些应用程序是设备出厂时就存在的，并且通常是不可删除的。

5. **/storage/emulated/0/** 或 **/storage/sdcard0/** ：
   - 这些目录通常用于外部存储，如果应用程序被设置为安装到SD卡上的话，可能会将某些文件存储在这里。然而，大多数应用程序数据仍然存储在内部存储的/data/app/和/data/data/目录下。

6. **/cache/** 或 **/data/data/<package_name>/cache/** ：
   - 这些目录用于存储应用程序的缓存数据，如临时文件或下载的内容。

7. **/data/system/packages.xml** ：
   - 这个文件记录了所有已安装应用程序的信息，包括包名、版本信息等。

在安装过程中，APK文件首先被复制到/data/app/目录下，然后解压并进行必要的处理，如将DEX文件保存到dalvik-cache目录（在旧版Android中），并在/data/data/目录下为应用程序创建相应的数据存储目录。此外，如果应用程序需要外部存储空间来存放额外的数据文件，也可能在外部存储上创建对应的目录。

需要注意的是，随着Android版本的变化，存储机制也在不断改进和发展，例如从Dalvik虚拟机到ART的转变导致了一些存储目录的变化。因此，对于特定版本的Android系统，具体的存储位置可能会有所差异。

## 三星系统软件安装位置

`/system/app/` 、 `/system/priv-app/`  
`/system_ext/app/` 、 `/system_ext/priv-app/`  
`/product/app/` 、 `/product/priv-app/`  
`/vendor/app/` 、 `/vendor/priv-app/`  
