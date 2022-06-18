# 用webpack打包ts代码

## 1. 项目初始化（生产package.json）

使用npm初始化：`npm init -y`  
使用yarn初始化 `yarn init`

## 2. 安装依赖

使用npm安装依赖：`npm i -D webpack webpack-cli typescript ts-loader`

使用yarn安装依赖：`yarn add --dev webpack webpack-cli typescript ts-loader`

## 3. 新建 webpack.config.js

在项目的根文件夹下新建 `webpack.config.js`

```javascript
// 引入一个包
const path = require('path')


// webpack中的所有配置信息都应该写在moudule.exports中
module.exports = {
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
    }
}
```

## 4. 在 package.json 里添加 webpack

在 `"script"` 里添加`"build": "webpack"`：

```json
{
  "name": "bb",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    //  webpack
    "build": "webpack"
  },
  "license": "MIT",
  "devDependencies": {
    "ts-loader": "^9.3.0",
    "typescript": "^4.7.4",
    "webpack": "^5.73.0",
    "webpack-cli": "^4.10.0"
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
