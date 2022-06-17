# yarn

## 是什么

Yarn是一个依赖管理工具，它能够管理你的代码，并与全世界的开发者分享代码。Yarn是高效、安全和可靠的，你完全可以安心使用。

Yarn能够让你使用其他开发者开发的代码，让你更容易的开发软件。如果你在使用中发现任何问题，欢迎发issues或者贡献代码，问题将会很快被修复。

代码是通过 依赖包 (有时也被称为 组件). 在每一个依赖中会定义一个package.json文件，用来描述这个依赖包中所有要被分享的代码。

比npm速度快且安全。

## yarn.lock

Npm 有一个名为 shrinkwrap 的特性，其目的是在生产环境中使用时锁定包依赖。shrinkwrap 的挑战是每个开发者都必须手动运行 npm shrinkwrap 生成 npm-shrinkwrap.json 文件。

使用 Yarn，则截然不同。在安装过程中，会自动生成一个 yarn.lock 文件，yarn.lock 会记录你安装的所有大大小小的。有点类似 PHP 开发者们所熟悉的 composer.lock。yarn.lock 锁定了安装包的精确版本以及所有依赖项，只要你不删除 yarn.lock 文件，再次运行 yarn install 时，会根据其中记录的版本号获取所有依赖包。有了这个文件，你可以确定项目团队的每个成员都安装了精确的软件包版本，部署可以轻松地重现，且没有意外的 bug。你可以把 yarn.lock 提交到本库里，这样其他签出代码并运行 yarn install 时，可以保证大家安装的依赖都是完全一致的。

## 安装

通过npm安装：

`npm install --global yarn`

设置环境变量：

`export PATH="$HOME/.yarn/bin:$PATH"`

测试Yarn是否安装好了：

`yarn --version`

## 使用

### 新建项目

进入项目目录下并执行 `yarn init`，会在根目录下生成一个 `package.json` （与npm类似）

### 添加依赖

```sh
yarn add [package]
yarn add [package]@[version]
yarn add [package]@[tag]
yarn add [pkg-name1] [pkg-name2]
```

另：安装全局包：

```sh
yarn global add [package]
```

### 更新依赖

```sh
yarn upgrade [package]
yarn upgrade [package]@[version]
yarn upgrade [package]@[tag]
```

### 删除依赖

```sh
yarn remove [package]
yarn remove [pkg-name1] [pkg-name2]
```

### 根据package.json文件为项目安装所有依赖

```sh
yarn
```

or

```sh
yarn install
```

### 列出所有包和它们的依赖

```sh
yarn list [--depth] [--pattern]
```

### 运行脚本

```sh
yarn run [script] [<args>]
```

### 源

查看当前源：

```sh
yarn config get registry
```

更换源：

```sh
yarn config set registry https://registry.npm.taobao.org
```

### 各种目录

- bin是yarn存储命令的二进制文件  
  查看bin目录命令：`yarn global bin`  
  修改位置命令：`yarn config set prefix "自定义bin目录路径"`

- dir存储全局node_modules  
  查看本机目前的目录：`yarn global dir`  
  修改位置命令：`yarn config set global-folder "自定义node_modules目录路径"`

- cache存储用下下载缓存  
  查看cache目录命令：`yarn cache dir`
  修改位置命令：`yarn config set cache-folder "自定义cache目录路径"`
