## Usage
### Install
```
git clone https://github.com/SilveryStar/Adachi-BOT.git
cd Adachi-BOT
npm install
```
### Config
```
> setting.yml
account:
  qq: your qq number
  password: your password or password md5
  
> cookies.yml
cookies:
  - your mihoyoBBS cookies
```

### Run
```
npm start
```

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
│  ├─ cache                 渲染缓存
│  ├─ db                    数据库文件(Lowdb)
│  ├─ font                  字体资源
│  └─ js                    外部资源
├─ src                      源码目录
│  ├─ plugins               插件代码
│  ├─ utils                 工具代码
│  └─ views                 前端代码
└─ app.js                   程序入口
```

### Example
1. 在 `src/plugins` 目录下创建文件夹如 `echo`， 这个名称将作为插件名
2. 创建文件 `/echo/index.js` 作为插件入口，文件模板如下
```js
module.exports = Message => {
    // 此处代码将在每次正则匹配成功后执行
}
```
3. 在 `config/command.yml` 中添加正则匹配公式
```yaml
echo:  # 此处的 key 值应与插件名保持一致，且为数组类型
  - ^echo *[0-9a-zA-Z]+
```
4. 添加插件后，重启 bot ，即可成功加载插件

## Demo
<details>
<summary>Image</summary>

### 生成玩家信息卡片
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/CardExample.png" alt="ERROR">
</div>

### 生成玩家角色背包
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/PackageExample.png" alt="ERROR">
</div>

### 生成角色信息卡片
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/AnemoExample.png" alt="ERROR">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/PyroExample.png" alt="ERROR">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/CryoExample.png" alt="ERROR">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/HydroExample.png" alt="ERROR">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/ElectroExample.png" alt="ERROR">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/GeoExample.png" alt="ERROR">
</div>

### 随机圣遗物功能
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/InitialActifact.png" alt="ERROR">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/FortifiedArtifact.png" alt="ERROR">
</div>

### 祈愿十连功能（暂时仅限角色祈愿）
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/GachaExample.png" alt="ERROR">
</div>
</details>

## Licenses
[MIT](https://github.com/SilveryStar/Adachi-BOT/blob/master/LICENSE)
