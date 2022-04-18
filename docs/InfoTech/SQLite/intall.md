# 安装 SQLite

## apt安装

ubuntu:  

```bash
sudo apt update
sudo apt install sqlite3
```

## 源码编译安装

请访问 [SQLite 下载页面](http://www.sqlite.org/download.html)，从源代码区下载 **sqlite-autoconf-\*.tar.gz**。

```bash
tar xvzf sqlite-autoconf-3071502.tar.gz
cd sqlite-autoconf-3071502
./configure --prefix=/usr/local
make
make install
```

## 验证

```bash
$ sqlite3
SQLite version 3.31.1 2020-01-27 19:55:54
Enter ".help" for usage hints.
Connected to a transient in-memory database.
Use ".open FILENAME" to reopen on a persistent database.
sqlite>
```
