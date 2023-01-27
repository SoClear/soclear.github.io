# 编译选项

在项目根文件夹下新建 `tsconfig.json`

```javascript
//  tsconfig.json是ts编译器的配置文件，ts编译器可以根据它的信息来对代码进行编译
{
  // compilerOptions编译器选项
  "compilerOptions": {
    // module 指定使用的模块化的规范
    "module": "commonjs",
    // target 用来指定ts被编译为的ES的版本
    "target": "es5",
    // lib用来指定项目中要使用的库，一般在浏览器的情况不需要配置这个，在node里运行的话酌情配置
    "lib": ["dom"],
    // outDir指定编译后文件所在目录
    "outDir": "./dist",
    // outFile将代码合并为一个文件。要想合并为一个文件，模块化规范只能用amd或system。通常不用，而用打包工具实现
    "outFile": "./dist/app.js",
    // 是否编译js文件，默认是false
    "allowJs": true,
    // 是否检查js代码符合语法规范，默认是false
    "checkJs": false,
    // 是否移除注释，默认是false
    "removeComments": true,
    // 不生成编译后的文件，默认是false
    "noEmit": false,
    // 当有错误时不生成编译后的文件，默认是false
    "noEmitOnError": true,
    // 所有严格检查的总开关,true会开启所有严格检查
    "strict": true,
    // 严格模式，默认是false
    "alwaysStrict": true,
    // 不允许隐式的any类型
    "noImplicitAny": true,
    // 不允许类型不明确的this
    "noImplicitThis": true,
    // 严格的检查空值(?.)
    "strictNullChecks": true,
    "sourceMap": true

  },
  // 路径：**表示任意目录，*表示任意文件
  // "include”用来指定哪些ts文件需要被编译
  "include": [
    "./src/**/*"
  ],
  //  "exclude”不需要被编译的文件目录
  //  默认值:["node_modules ", "bower_components", "jspm_packages"],
  "exclude": [
    "node_modules",
    ".idea"
  ],
  //  定义被继承的配置文件；下例表示当前配置文件包含config目录下的base.json的所有配置信息
  "extends": "./config/base",
  // 指定被编译的文件的列表
  "files": [
    "01.ts",
    "./src/me.ts"
  ]
}
```
