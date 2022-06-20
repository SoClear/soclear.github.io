# 用webpack打包ts代码

## 1. 项目初始化（生产package.json）

使用npm初始化：`npm init -y`  
使用yarn初始化 `yarn init`

## 2. 安装依赖

使用npm安装依赖：`npm i -D webpack webpack-cli typescript ts-loader html-webpack-plugin webpack-dev-server clean-webpack-plugin`

使用yarn安装依赖：`yarn add --dev webpack webpack-cli typescript ts-loader html-webpack-plugin webpack-dev-server clean-webpack-plugin`

## 3. 新建 webpack.config.js

在项目的根文件夹下新建 `webpack.config.js`

```javascript
// 引入一个包
const path = require('path')
// 引入html插件，自动生成HTML
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 引入clean插件，自动清空dist内文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')


// webpack中的所有配置信息都应该写在moudule.exports中
module.exports = {
    // 开发模式
    mode: "development",
    // 指定入口文件
    entry: "./src/index.ts",
    // 指定打包文件所在目录
    output: {
        // 指定打包文件所在目录
        path: path.resolve(__dirname, 'dist'),
        //  打包后的文件
        filename: "bundle.js",
    },
    // 指定webpack打包要使用的模块
    module: {
        // 指定要加载的规则
        rules: [
            {
                // 指定规则生效的文件
                test: /\.ts$/,
                // 要使用的loader
                use: 'ts-loader',
                // 要排除的文件
                exclude: /node-modules/
            }
        ]
    },
    // 配置Webpack插件
    plugins: [
        // 引入clean插件，自动清空dist内文件
        new CleanWebpackPlugin(),
        // 引入html插件，自动生成HTML
        new HtmlWebpackPlugin({
            // 标题
            title: "这是一个自定义的title",
            // 网页模板
            template: "./src/index.html"
        })
    ],

    //用来设置引用模块
    resolve: {
        extensions: ['.ts', '.js']
    }
}
```

## 4. 在 package.json 里添加 webpack

在 `"script"` 里添加`"build": "webpack", "start": "webpack serve --open msedge.exe"`

```json
{
  "name": "bb",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "build": "webpack",
    "start": "webpack serve --open"
  },
  "license": "MIT",
  "devDependencies": {
    "clean-webpack-plugin": "^4.0.0",
    "html-webpack-plugin": "^5.5.0",
    "ts-loader": "^9.3.0",
    "typescript": "^4.7.4",
    "webpack": "^5.73.0",
    "webpack-cli": "^4.10.0",
    "webpack-dev-server": "^4.9.2"
  }
}
```

## 5. 创建 `tsconfig.json`

```json
{
    "compilerOptions": {
        "module": "ES2015",
        "target": "ES2015",
        "strict": true
    }
}
```

## 6. 构建

通过npm构建：`npm run build`  
通过yarn构建：`yarn build`

在`dist`目录下查看输出。

## 7. 修改文件后自动编译

通过npm自动编译：`npm run start`  
通过yarn自动编译：`yarn start`
