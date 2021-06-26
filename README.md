## Adachi-BOT v2.0！
功能迁移已基本完成并进行了渲染优化，进入测试阶段，欢迎各位用户和开发者提供交流意见和建议<br>
对于开发者，若有意愿开发插件，请参考 [插件开发文档](https://github.com/SilveryStar/Adachi-BOT/tree/v2.0Beta/document)

### Install
#### Docker （推荐）

**下载**

```
git clone -b v2.0Beta https://github.com/SilveryStar/Adachi-BOT.git
cd Adachi-BOT
mkdir config && cd config
touch setting.yml commands.yml cookies.yml
```

**配置**

```
> setting.yml
number: QQ 账号
password: QQ 密码
master: BOT 持有者账号
header: 命令起始符(可为空串"")
platform: 1.安卓手机(默认) 2.aPad 3.安卓手表 4.MacOS 5.iPad
dbPort: 56379 # 修改该选项需同时修改 redis.conf -> port

> cookies.yml
cookies:
  - 米游社Cookies(可多个)
```

**启动**

```
# 若 BOT 账号为首次登录，需在宿主机完成设备验证 (Node.js version>=12.16)
npm install yaml oicq
npm run login

# 设备验证完成后，启动 docker
docker-compose up -d
```

**插件**

```
docker-compose stop
# 在 ./src/plugins 中加入或删除文件夹
docker-compose start
```

#### Forever

```
git clone -b v2.0Beta https://github.com/SilveryStar/Adachi-BOT.git
cd Adachi-BOT
npm install

# 生成配置文件模板
npm run start

# 自行运行 Redis 数据库，默认端口 56379
# 暴露端口可在 /config/setting.yml 的 dbPort 中修改

# 使用 forever 模块启动
# 注意，请在 Node.js v12 环境中运行，参考 issues #14 
npm run serve
```

### Migrate
对于 `Adachi-BOT v1.x` 的用户，在启动应用前，将原版本中的 `./data/db/map.json` 移动至新版本的项目根目录下，即可完成米游社绑定数据迁移。

### Pictures

<details>
<summary>生成玩家信息卡片 mys|uid</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/23/RmBLct.png" alt="RmBq1I.png" border="0" />
</div>
</details>

<details>
<summary>祈愿十连 wish|w</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/23/RmBvB8.png" alt="RmBq1I.png" border="0" />
  <img src="https://z3.ax1x.com/2021/06/23/RmDEuV.png" alt="RmBq1I.png" border="0" />
</div>
</details>

<details>
<summary>角色/武器信息查询 info</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/23/RmBOjP.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmBTtH.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmDFcq.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmDkj0.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmDi3n.png" alt="ERROR">
</div>
</details>

<details>
<summary>圣遗物抽取/强化 art|imp</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/23/RmBb9A.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmB7hd.png" alt="ERROR">
</div>
</details>

<details>
<summary>玩家角色查询 char</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/23/RmDq54.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmDXG9.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmDOPJ.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmDbaF.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmDHVU.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/23/RmDj2R.png" alt="ERROR">
</div>
</details>
