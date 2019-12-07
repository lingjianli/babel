## babel是什么？

  babel是一个javaScript编译器，主要通过**插件**转换的形式，将ECMAScript2015+版本的代码转换为向后兼容的javaScript语法，能够兼容当前环境和旧环境。

  注意： 一旦没有经过插件的转化，原代码将一成不变的输出。
  > 查看各个浏览器的兼容性 http://kangax.github.io/compat-table/es6/

## 转换方式
  1. babel-standalone 引入
  2. cli 命令行
  3. 构建系统

  ------

  1. babel-standalone引入
  ```
  <div id="babel"></div>
  <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
  <script type="text/babel">
    const getMessage = () => "Hello, IE";
    document.getElementById('babel').innerHTML = getMessage();
  </script>
  ```
  2. cli命令行
  ```
  // 全局安装
  npm install -g babel-cli
  // 再局部安装
  npm install -D @babel/cli @babel/core
  ```
  > 为什么需要局部安装？
  > * 局部安装可以使得不同的项目在同一台电脑上可以安装不同版本的babel
  > * 这也意味着，你不需要依赖全局的工作环境，更易于项目的迁移

  在package.json中，添加 script
  ```
  {
    "name": "01ES-env",
    "version": "1.0.0",
    "description": "* 为什么需要搭建环境？",
    "main": "index.js",
    "devDependencies": {
      "@babel/cli": "^7.7.4",
      "@babel/core": "^7.7.4"
    },
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      //"build": "babel src/index.js -o dist/index.js" // 指定文件输出
      "build": "babel src --out-dir dist" // 指定文件夹输出
      // "build": "./node_modules/.bin/babel src --out-dir dist" 
      // "build": "npx babel src --out-dir dist" 
    },
    "keywords": [],
    "author": "",
    "license": "ISC"
  }
  ```

  3. 构建系统(比如webpack中，通过babel-loader来转换)

  尽管以上方式的打开方式不一样，但是最主要的还是调用 @babel/core。以下主要是以第二种方式进行。

## 插件和预设的使用

代码转换功能是以插件的形式出现的，插件是小型的 JavaScript程序，用于指导 Babel 如何对代码进行转换。

在 src/index.js 

```
let sayHello = () => 'hello, babel'
```

运行 npm run build, 在 lib/index.js 输出
```
let sayHello = () => 'hello, babel'
``` 
由于我们没有使用别的插件，所以代码原样输出。

安装转换箭头函数插件 plugin-transform-arrow-functions 
```
npm install --save-dev @babel/plugin-transform-arrow-functions

./node_modules/.bin/babel src --out-dir lib --plugins=@babel/plugin-transform-arrow-functions

```
此时 lib/index.js 输出
```
"use strict";

var sayHello = function sayHello() {
  return 'hello, babel';
};
```
我们不仅可以转换箭头函数，还可以通过更多的插件来解锁更多的 ECMA2015+ 的新特性。然而一个个的添加所需的插件，不太符合我们日常的需求。babel 贴心的为我们提供了"preset"，preset 字面翻译为预设，官方解释为**一组预先设定的插件**。


使用官方提供的```env```的preset
```
npm install -D @babel/preset-env

./node_modules/.bin/babel src --out-dir lib --presets=@babel/env
```
通过终端控制台同时传递 cli 和 preset 的参数，输出结果和使用```plugin-transform-arrow-functions```一样。因为上述 preset 默认支持最新的 JavaScript 特性。

preset 也是通过配置文件来支持参数。

> 深入了解babel配置文件 https://www.babeljs.cn/docs/configuration


创建```babel.config.js```文件

```
const presets = [
  ["@babel/env"]
];

module.exports = { presets };
```
运行 ``` npm run build ```
```
let sayHello = () => 'hello, babel'

=>

"use strict";

var sayHello = function sayHello() {
  return 'hello, babel';
};
```

配置完 preset 之后，我们是不是可以安心使用 ES6 了呢？

答案当然不是啦，试一下
```
Promise.resolve().finally(() => {
  console.log('hello, babel')
})

=> 运行 npm run build

"use strict";

Promise.resolve()["finally"](function () {
  console.log('hello, babel');
});

```

从上面可以看出，preset 并不会转换```Promise```对象。这时候我们就需要了解 ```Polyfill```。

## Polyfill

@babel/polyfill 用于模拟完整的 ES2015+ 环境。@babel/polyfill包括 core-js 和一个自定义的 regenerator runtime 模块。

这意味着你可以使用诸如 Promise 和 WeakMap 之类的新的内置组件、 Array.from 或 Object.assign 之类的静态方法、 Array.prototype.includes 之类的实例方法以及生成器函数（generator functions）（前提是你使用了 regenerator 插件）。

```
npm install -save @babel/polyfill core-js@3

// babel.config.js

const presets = [
  [
    "@babel/env",
    {
      "useBuiltIns": "usage",
      "corejs": 3
    }
  ]
];

module.exports = { presets };

```

```
Promise.resolve().finally(() => {
  console.log('hello, babel')
})

=> npm run build

"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.promise.finally.js");

Promise.resolve()["finally"](function () {
  console.log('hello, babel');
});
```
为了添加这些功能，polyfill 将添加到全局范围（global scope）和类似 String 这样的内置原型（native prototypes）中。这个方法，从一定方面上对全局范围造成污染。

为了避免这种情况，可以使用 transform runtime 插件。

```
npm install --save-dev @babel/plugin-transform-runtime

npm install --save @babel/runtime

// babel.config.js

const presets = [
  [
    "@babel/env"
  ],
  {
    "plugins": [
      [
        "@babel/plugin-transform-runtime",
        {
          "corejs": 3
        }
      ]
    ]
  }
];

module.exports = { presets };

```

```
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault.js");

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise.js"));

_promise["default"].resolve()["finally"](function () {
  console.log('hello, babel');
});
```

## 总结

一切都以官网为主哈。。

参考 https://www.babeljs.cn/repl