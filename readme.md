<!--
 Copyright (c) 2021 WumaCoder

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# generate-test-case

一个为 OJ 生成测试用例的 CLI 工具

## 安装

```bash
npm install -g generate-test-case
gtc -h
```

## 指南

gtc 通过'输入模版'(`template`)和'代码源文件'(`source.js`)，来生成输入输出的测试用例。
他内部的实现原理就是通过 `template` 生成输入测试用例，然后使用输入测试用例执行`source.js`文件，最后生成输出测试用例。（如果你是 C 语言这样的编译性质的语言可以配置 `config.js` 文件实现编译运行）
template 是一个由普通字符串和`模版代码`构成的文本文件。
source.js 是标准的 OJ 程序。

接下来试的用一下

我们先创建一个文件夹比如`1000`,然后按照题的描述`describe.md`创建文件`template`与`source.js`,如果你想控制某些参数可以通过`config.js`文件 (如果只是生成 node 程序的测试用例，可以不创建)
目前我们的目录是这样的 (<https://github.com/WumaCoder/generate-test-case/tree/master/tests/.example>)：

- 1000/
  - template
  - source.js
  - config.js
  - lib/
    - stdin.js
  - describe.md

**describe.md**

```md
## 速算机器人

### 题目描述

小扣在秋日市集发现了一款速算机器人。店家对机器人说出两个数字（记作 x 和 y），请小扣说出计算指令：

"A" 运算：使 x = 2 _ x + y；
"B" 运算：使 y = 2 _ y + x。
在本次游戏中，店家说出的数字为 x = 1 和 y = 0，小扣说出的计算指令记作仅由大写字母 A、B 组成的字符串 s，字符串中字符的顺序表示计算顺序，请返回最终 x 与 y 的和为多少。

**示例:**

输入：s = "AB"

输出：4

解释：
经过一次 A 运算后，x = 2, y = 0。
再经过一次 B 运算，x = 2, y = 2。
最终 x 与 y 之和为 4。

### 样例输入

"AB"

### 样例输出

4
```

**template**

> 在花阔号内的是一段可执行的JS脚本，在这里可以执行JS的语句和方法，GTC提供了一些常用的生成方法可以调用，具体请查看Generate API

```text
{ repeatStr("AB", ($i+1)) }
```

**source.js**

```js
/**
 * @param {string} s
 * @return {number}
 */
var calculate = function (s) {
  return 1 << s.length;
};

async function main() {
  const input = await getLine();
  const output = calculate(input);
  console.log(output);
  close();
}

main();
```

**lib/stdin.js**

```js
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const buffer = [];
var getLineCount = 0;

rl.on("line", function lineEvent(v) {
  buffer.push(v);
});

rl.on("close", function closeEvent() {
  setImmediate(function closeProcess() {
    if (buffer.length === 0 || getLineCount === 0) {
      process.exit(0);
    } else {
      setImmediate(closeProcess);
    }
  });
});

function getLine() {
  getLineCount++;
  return new Promise((resolve) => {
    setImmediate(function run() {
      if (buffer.length !== 0) {
        resolve(buffer.shift());
        getLineCount--;
      } else {
        setImmediate(run);
      }
    });
  });
}

function close() {
  rl.close();
}

module.exports = { getLine, close };
```

**config.js**

```js
module.exports = {
  root: ".", // 当前目录
  exec: "node", // 执行的命令

  execFilePath: "./source.js", // 执行的文件
  injectLibs: ["./lib/stdin.js"], // 执行之前要注入的文件

  stdinTemplatePath: "./template", // 输入模版位置

  outDir: "./data", // 测试实例输出位置
  count: 10, // 生成数量
};
```

然后在当前目录下执行 `gtc`, 后查看 `./data` 下的文件
到这里你已经会基本操作，更多详细内容请查看 `Config API` 和 `Generate API`

## Config API

```ts
interface Config {
  root: string; // 根目录 default:"."
  compile: string; // 编译命令，不包含文件路径
  exec: string; // 执行命令，不包含文件路径 default:"node"

  compileFilePath: string; // 要编译的源文件，他会拼接到compile后面, default: <execFilePath>
  execFilePath: string; // 要执行的文件，他会拼接到exec后面 default: source.js
  source: string; // 源码 他和compileFilePath只能写一个
  injectLibs: string[]; // 执行之前注入的文件，比如上面的 getLine

  stdinTemplatePath: string; // 输入数据的模版文件的位置 default: template
  stdinTemplate: string; // 输入文件模版

  outDir: string; // 测试用例输出位置
  count: number; // 生成数量
}
```

## Generate API

###  independent variable

| 变量名 | 类型   | 功能                        |
| ------ | ------ | --------------------------- |
| $i     | number | 每执行完一个输入用例就会加1 |



### string

| 方法名                                 | 参数说明                                                     | 功能           |
| -------------------------------------- | ------------------------------------------------------------ | -------------- |
| *randomChar*(strList = []):string      | @param {*string[]*} *strList* *待选字符数组，如果不传入表示随机生产一个字母* | *随机生成字符* |
| randomStr*(len, strList = []):string   | @param {*number*} *len* *随机生成长度为len的字符串*<br />@param {*string[]*} *strList* *待选字符数组，如果不传入表示随机生产一个字母* | 随机生成字符串 |
| *randomWord*(n, strList = []): strin g | @param {*number*} *n* *生成由n个单词组成的字符串，没有.号。*<br />@param {*string[]*} *strList* *待选字符数组，如果不传入表示随机生产一个字母* | 随机生成多个字 |



### array

| 方法名                                                  | 参数说明                                                     | 功能                                |
| ------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| *randomNumArr*(start, end, len, separator = ","):string | @param {*number*} *start* *开始数*<br />@param {*number*} *end* *结束的数*<br />@param {*number*} *len* *数组个数*<br />@param {*string*} *separator* *分割符* | *生成 `[start,end)` 个随机数的数组* |
| *randomStrArr*(strLen, len, separator = ","):string     | @param {*number*} *strLen* *字符串长度*<br />@param {*number*} *len* *数组个数*<br />@param {*string*} *separator* *分割符* | *生成长度为strLen的字符串数组*      |



### number

| 方法名                      | 参数说明                                               | 功能                                 |
| --------------------------- | ------------------------------------------------------ | ------------------------------------ |
| *random*(start, end):number | @param {*number*} *start*<br />@param {*number*} *end* | *生成 `[start, end)` 区间内的随机数* |



### base

| 方法名                | 参数说明                                                     | 功能                              |
| --------------------- | ------------------------------------------------------------ | --------------------------------- |
| *repeat*(cb, n):array | @param {*(i:number)=>any*} *cb* *回调*<br />@param {*number*} *n* *执行次数* | *执行n此cb，并且将结果返回成数组* |



## About

如果这个工具对你有用，请不要吝啬你的 Star，如果有问题可以提交 Issue，如果你想添加更多的 Generate API 请提交 PR，并且同步 API 文档