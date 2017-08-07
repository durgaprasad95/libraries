# auto-hash
automatically create hash info for files

## Features

- 自动计算列表中文件的 MD5 值
- 输出结果到指定文件

## Install

```
npm install auto-hash
```
or
```
yarn add auto-hash
```

## Usage

### 作为 Node.js 脚本直接调用

```js
node auto-hash/index.js -c auto-hash.config.json
// 指定配置文件的参数可以是 -c 或者 -config
```

### 作为模块引入调用

```js
const autoHash = require('auto-hash');
autoHash({
  config: './auto-hash.config.json',
});
// 指定配置文件的参数名可以是 c 或者 config
```

### 输出样例

```js
module.exports = { testIndex: '5745abcc' };
```

## 配置说明

配置文件格式为 `JSON`

```json
{
  // files 是需要进行 hash 计算的文件列表
  "files": [
    {
      "file": "src/index.js", // file 属性设置相对位置(必须)
      "name": "index" // name 属性设置输出对象中对应的属性名（默认文件名，可选）
    }
  ],
  "output": {
    "file": "src/auto-hash.js" // 输出文件（必须）
  },
  "len": 10 // hash 取值长度，默认全部（可选）
}
```

## LICENSE

MIT License

Copyright (c) 2017 Cheng Gu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

