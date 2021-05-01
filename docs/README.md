## Develop
### Directory Structure
```
Adachi-BOT
├─ config
│  ├─ artifact.yml          圣遗物配置(#r,#i)
│  ├─ cookies.yml           cookie设置(#gq)
│  ├─ command.yml           命令正则
│  └─ setting.yml           基本配置
├─ data                     资源目录
│  ├─ record                数据缓存
│  ├─ db                    数据库文件(Lowdb)
│  ├─ font                  字体资源
│  └─ js                    外部资源
├─ src                      源码目录
│  ├─ plugins               插件代码
│  ├─ utils                 工具代码
│  └─ views                 前端代码
└─ app.js                   程序入口
```

### Plugin
1. 在 `src/plugins` 目录下创建文件夹如 `echo`， 这个名称将作为插件名
2. 创建文件 `/echo/index.js` 作为插件入口，文件模板如下
```js
// 此处代码将在程序成功启动后执行，可用于加载初始化
module.exports = Message => {
    // 此处代码将在每次正则匹配成功后执行
}
```
3. 在 `config/command.yml` 中添加正则匹配公式
```yaml
echo:  # 此处的 key 值应与插件名保持一致，且为数组类型
  - ^echo *[0-9a-zA-Z]+
```
4. 添加插件后，重启程序，即可成功加载插件
5. 机器人已被注册为全局实例 `bot` ，可以直接使用，详细参考 [oicq](https://github.com/takayama-lily/oicq/wiki/91.API%E6%96%87%E6%A1%A3)

### Database
本项目数据库使用轻量化 JSON 数据库 [lowDB](https://github.com/typicode/lowdb) ，并简易的封装了以下方法

**创建数据库**
```js
// 创建一个名称为 name 的数据库，默认值设置为 { user: [] }
// 在 src/utils/database.js 中使用，以便启动时初始化
newDB(name: string, default?: object)
```

**插入数据**
```js
// 在数据库 name 中的 key 对应的对象数组中，插入一条数据 data
push(name: string, key: string, data: object)
```

**获取数据**
```js
// 在数据库 name 中的 key 对应的对象数组中，获取包含索引 index 的对象
get(name: string, key: string, index: object)
```

**更新数据**
```js
// 在数据库 name 中的 key 对应的对象数组中，将包含索引 index 的对象更新为 data
// 注意，该方法只会更新 data 中包含的 key-value 对，不会修改其他数据
update(name: string, key: string, index: object, data: object)
```

**判断是否含有数据**
```js
// 在数据库 name 中的 key 对应的对象数组中，检测所有的索引 index 在是否包含值 value
isInside(name: string, key: string, index: string, value: any)
```

**设置数据**
```js
// 在数据库 name 中的 key 对应的数据设置为 data
set(name: string, key: string, data: any)
```

此外，该数据库基于 [loadsh](https://github.com/lodash/lodash) 实现，你可以根据需要在 `src/utils/database.js` 中定义自己的方法
