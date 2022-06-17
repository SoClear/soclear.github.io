# 安装

## 通过npm安装

```sh
npm install -g typescript
```

## 通过yarn安装

```sh
yarn global add typescript
```

## 编译

新建app.ts文件：

```text
var message:string = "Hello World" 
console.log(message)
```

执行命令行：

```sh
tsc app.js
```

这时候在当前目录下（与 app.ts 同一目录）就会生成一个 app.js 文件

## 执行

```sh
node app.js
```
