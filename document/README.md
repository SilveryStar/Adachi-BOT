## Adachi-Plugin v1.1.1 开发者文档
本文档持续更新和修正中欢迎开发者提供交流意见和建议

## 写在前面
`Adachi-BOT v2` 基于 [oicq](https://github.com/takayama-lily/oicq) 开发，实例注册为`Adachi`，在开发过程中，若需要进行更底层的操作，可以导入该实例

## 插件
### 简述
`插件(Plugin)` 是由开发者创建指令集合<br/>
注册一个插件只需要在`/src/plugins`目录中创建一个文件夹，其中应至少包含`init.ts`和`index.ts`两个文件

### 声明
`init.ts`是bot识别插件的接口，文件用于注册插件基本信息，包括名称、简介和正则表达式等，基本格式如下：
```typescript
// /src/plugins/example/init.ts
import { addPlugin } from "../../modules/plugin";

// 固定函数名
export async function init(): Promise<any> {
    return addPlugin( "example", {
    	// config
    } );
}
```
参数详细如下：

**注册插件**
```typescript
function addPlugin(
    name: string,
    ...commandList: CommandType[]
): any {}
```
* `name` 插件名称
* `...commandList` 指令配置，剩余参数列表，可以同时注册多个指令，详细见 [指令类型](#command)

### 实现
`index.ts`文件用于实现命令，当设置命令`main`属性后，应使用相应的文件名称，基本格式如下：
```typescript
// /src/plugins/example/index.ts
import { CommonMessageEventData as Message } from "oicq";

// 固定函数名
export async function main(
    sendMessage: sendType,
    message: Message,
    match: CommandMatchResult
): Promise<void> {
    // do something
}
```
参数详细如下：
* `sendMessage` 发送信息到对应群聊/私聊，异步函数
* `message` 消息事件，详见 [message事件文档](https://github.com/takayama-lily/oicq/wiki/92.%E4%BA%8B%E4%BB%B6%E6%96%87%E6%A1%A3#event-message)
  + `Message.raw_message` 消息内容，类型为 string ，当指令为命令式时，其指令头已被删去
* `match` 正则匹配信息，类型详见 [指令匹配数据](#match-type)

## 消息
### 简述
`Adachi-BOT v2` 中未支持讨论组消息，只包含两类消息：群聊消息（`Group`）和私聊消息（`Private`）

### 作用域
`作用域(Scope)`用于指定每个指令生效的位置，用`MessageScope`来指定
```typescript
enum MessageScope {
    Neither,
    Group = 1 << 0,
    Private = 1 << 1,
    Both = Group | Private
}
```

### 发送消息
当你在实现指令时，我们提供了方法`sendMessage`，他可以让你一视同仁的处理不同来源的消息的发送<br/>
此外，还有方法`sendMaster`，用于将消息发送至`/config/setting.yml`中设定的`master`账户

### 消息类型
当然，如果你希望将群聊和私聊加以区分，请使用下面的方法：
```typescript
function isPrivateMessage( data: Message ): data is PrivateMessageEventData {}
function isGroupMessage( data: Message ): data is GroupMessageEventData {}
```

## 权限
### 简述
对指令进行权限设置，分为权限等级管理和指令权限管理（该功能不在插件开发中体现，不做介绍）两种类型

### 权限等级
`Adachi-BOT v2` 中提供了四种权限等级（`AuthLevel`），分别为封禁用户、用户、管理员和主人
```typescript
enum AuthLevel {
    Banned,
    User,
    Manager,
    Master
}
```
* `Banned` 封禁用户，当一个账号被 `ban` 命令处理后，会被标记为该状态
* `User` 用户，默认状态
* `Manager` 管理员，由 `Master` 使用 `manager` 命令设置，拥有多数权限
* `Master` 主人，拥有最高权限，在 `/config/setting.yml` 中设置

## 指令 <span id="command"/>
### 简述
`指令(Command)`是插件中的基本单位，是一个由声明和实现组成的「请求-响应」体，根据请求句式的不同，我们将其分为`命令式(Order)`、`开关式(Switch)`和`询问式(Question)`两种类型，下面将分别介绍

### 声明指令
**指令配置**
```typescript
interface CommandConfig {
    commandType: "order" | "switch" | "question";
    key: string;
    docs: string[];
    authLimit?: AuthLevel;
    scope?: MessageScope;
    main?: string;
    detail?: string;
    display?: boolean;
    start?: boolean;
    end?: boolean;
    enable?: boolean;
}
```
* `commandType` 指令类型，用于指定请求类型
* `key` 指令标识，区分不同指令的唯一指标，命名形式应该遵循如下规范
  + 该标识形如`开发者名字.指令名`
  + 使用`kebab-case`命名
  + 例：`silvery-star.example-command`
* `docs` 命令介绍
  + 第一个元素应为该命令的简介（`e.g. 复读`）
  + 第二个元素为命令参数列表，必填参数使用尖括号包围，可选参数使用中括号包围，列表参数使用竖线分割（`e.g. <用户名> [on|off]`）
* `authLimit` 权限等级限制，可选属性，默认为`AuthLevel.User`
* `scope` 指令作用域，可选属性，默认为`MessageScope.Both`
* `main` 指令实现文件名，可选属性，默认为`index`
* `detail` 更多命令信息，可选属性
* `display` 是否在「帮助」中显示命令，可选属性，默认为`true`
* `start` 是否在指令正则前添加开始匹配符号 `^`，可选属性，默认为`true`
* `end` 是否在指令正则后添加结束匹配符号 `$`，可选属性，默认为`true`

### 命令式指令
```typescript
interface Order extends CommandConfig {
    commandType: "order";
    headers: string[];
    regexps: string[] | string[][];
}
```
* `headers` 指令头，可以指定多个
  + 你不需要为这个指令头添加额外的特殊字符开头，这应该由用户在 `/config/setting.yml` 中设置
  + 如果你不希望某个指令头开头被添加特殊字符，请以`__`为开头
  + 在命令式指令成功匹配后，被匹配到的`header`会作为参数传入 `main` 函数
* `regexps` 正则表达式，可以设置多个
  1. 表达式无需包含指令头，这将由系统与`headers`进行拼接
  2. 如果只需设置一个正则表达式，可使用 `string[]` 类型，数组元素为正则的组成，并被 ` *` 连接，例：
    + `[ "(add|dec)", "[0-9]+" ]` 将会最终被处理为 `^headers[i] *(add|dec) *[0-9]+$`
  3. 如果需要设置多个正则表达式，则使用 `string[][]` 类型
  4. 如果一个指令无需匹配数据，只包含指令头时，使用空数组 `[]` 即可
  
### 开关式指令
开关式指令实质上是命令式指令的一类特化
```typescript
interface Switch extends CommandConfig {
    commandType: "switch";
    mode: "single" | "divided";
    header: string;
    regexp: string | string[];
    onKeyword: string;
    offKeyword: string;
}
```
* `mode` 开关式指令模式
  + `single` 为单语句模式，开/关关键词作为参数，例如 `#header onKeyword` 或 `#header offKeyword`
  + `divided` 为拆分语句模式，开/关关键词作为指令头，例如 `#onKeyword` 或 `#offKeyword`
* `header` 指令头，只可指定一个，仅在 `single` 模式下生效，规则与命令式指令相同
* `regexp` 正则表达式，只可设置一个
  + 当传入 `string` 类型时，正则将会被原生处理，否则会同上文规则一样被连接处理
  + 在正则表达式和 `docs` 中使用 `${OPT}` 字段，它将被替换为开/关关键词，以便用户自定义
* `onKeyword`,`offKeyword` 开/关关键词

### 询问式指令
```typescript
interface Question extends CommandConfig {
    commandType: "question";
    sentences: string[];
}
```
* `sentences` 询问句式（正则），可以指定多个
  + 对于句式中你想获得的数据，应该使用子表达式包围
  + 在询问式指令成功匹配后，被匹配到的数据列表将作为参数传入`main`
  + 在 `sentences` 中的 `${HEADER}` 会被替换为用户 `setting.yml` 中设置的指令头

### 指令匹配数据 <span id="match-type"/>
在指令实现函数中，开发者可以获取正则匹配阶段获得的信息，其类型声明如下
```typescript
interface CommandMatchResult {
    type: "order" | "switch" | "question" | "unmatch";
    data: string | SwitchMatch | string[] ;
    flag: boolean;
}

interface SwitchMatch {
    switch: string;
    match: string[];
    isOn: () => boolean;
}
```
* `Order` 类型插件的 `data` 类型为 `string`，值为所匹配到的指令头
* `Switch` 类型插件的 `data` 类型为 `SwitchMatch`
  + `switch` 为匹配到的开/关关键词
  + `match` 为指令中除关键词外的其他匹配部分的列表
  + `isOn` 用于判断指令匹配到的为 `onKeyword` 或 `offKeyword`，前者返回值为 `true`，后者为 `false`
* `Question` 类型插件的 `data` 类型为 `string[]`，值为 `sentences` 正则中所匹配到的所有子表达式

## 数据库
### 简述
`Adachi-BOT v2`使用`Redis`数据库，简易的封装了一些异步方法至全局实例`Redis`

### 键名规范
同「指令标识」，有下面两点规范
1. 该标识形如`开发者名字.指令名`
2. 使用`kebab-case`命名

### 字符串
**字符串操作**
```typescript
async function setString(
    key: string,
    value: any,
    timeout?: number
): Promise<void> {}
```
* `key` 字符串数据键名
* `value` 值
* `timeout?` 过期时间，可选参数，默认不过期

**获取字符串数据**
```typescript
async function getString( key: string ): Promise<any> {}
```
* `key` 字符串数据键名
* 注意：当键值对不存在时，将会返回 `null`

### Hash
**设置 Hash 数据**
```typescript
async function setHash( key: string, value: any ): Promise<void> {}
```
* `key` Hash 数据键名
* `value` 值，可以为下面两种类型
  + `Array` 含有偶数个元素的数列，奇数位的元素为 `string` 类型，表示字段名；偶数位为对应的值，`e.g. [ "k1", 1, "k2", "2" ]`
  + `Object` 对象，它不应该嵌套对象，正确的格式应为 `e.g. { k1: 1, k2: "2" }`

**获取 Hash 数据**
```typescript
async function getHash( key: string ): Promise<any> {}
```
* `key` Hash 数据键名
* 注意：当键值对不存在时，将会返回 `null`

**删除 Hash 字段**
````typescript
async function delHash(
    key: string,
    ...fields: string[]
): Promise<void> {}
````
* `key` Hash 数据键名
* `...fields` 待删除字段名，剩余参数列表，可同时删除多个 Hash 内的键值对
* 注意：当该方法删除不存在的字段时不会报错

### 列表
**获取列表**
```typescript
async function getList( key: string ): Promise<Array<string>> {}
```
* `key` 列表数据键名
* 注意：当键值对不存在时，将会返回空数组

**获取列表长度**
```typescript
async function getListLength( key: string ): Promise<number> {}
```
* `key` 列表数据键名
* 注意：当键值对不存在时，将会返回 -1

**添加/删除列表数据**
```typescript
async function addListElement( key: string, ...value: any[] ): Promise<void> {}
async function delListElement( key: string, ...value: any[] ): Promise<void> {}
```
* `key` 列表数据键名
* `...value` 待添加/删除的数据，剩余参数列表
* 注意：当该方法删除不存在的元素时不会报错

**判断列表是否存在某数据**
```typescript
async function existListElement( key: string, value: any ): Promise<boolean> {}
```
* `key` 列表数据键名
* `value` 查询的数据

### 其他
**删除键值对**
```typescript
async function deleteKey( ...keys: string[] ): Promise<void> {}
```
* `...keys` 待删除键名，剩余参数列表，可同时删除多个键值对
* 注意：当该方法删除不存在的键名时不会报错

**设置过期时间**
```typescript
async function setTimeout( key: string, time: number ): Promise<void> {}
```
* `key` 数据键名
* `time` 过期时限，单位：秒

**根据前缀获取所有键名**
```typescript
async function getKeysByPrefix( prefix: string ): Promise<Array<string>> {}
```
* `prefix` 键名前缀

**获取 Redis 实例**

如果以上的方法都无法满足你的需求，可以使用 `Redis.client` 获取实例

## 配置
### 操作
**创建配置文件**
```typescript
function createYAML( fileName: string, config: any ): boolean {}
```
* `fileName` 配置文件名称，将创建文件 `/config/fileName.yml`
* `config` 配置文件内容
* 函数将会返回该文件是否存在
* 注意：使用该方法无需判断配置文件是否存在

**创建目录**
```typescript
function createFolder( dirName: string ): boolean {}
```
* `dirName` 目录名称，将创建文件夹 `/dirName`
* 函数将会返回该文件是否存在
* 注意：使用该方法无需判断配置目录是否存在

**加载配置文件**
```typescript
function loadYAML( fileName: string ): any {}
```
* `fileName` 配置文件名称，将从 `/config/fileName.yml` 中读取配置并解析为 `JavaScript Object`
* 注意：该方法不会判断文件是否存在，请确保在使用前已经创建了配置文件