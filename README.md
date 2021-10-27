## Adachi-BOT v2.0！
更好的管理模块与图片样式<br>
对于开发者，若有意愿开发插件，请参考 [插件开发文档](https://github.com/SilveryStar/Adachi-BOT/tree/v2.0Beta/document)

[常见问题汇总](https://github.com/SilveryStar/Adachi-BOT/blob/master/document/FAQ.md) | [管理者手册](https://github.com/SilveryStar/Adachi-BOT/blob/master/document/MASTER.md) | [插件库](https://github.com/SilveryStar/Adachi-Plugin) | [功能及改进征集](https://github.com/SilveryStar/Adachi-BOT/issues/70)

## Deploy
> 注意：以下内容仅供 Linux 环境下部署使用，Windows 环境下的部署不予解答
### Docker （推荐）

**下载**

```
git clone https://github.com/SilveryStar/Adachi-BOT.git
cd Adachi-BOT
mkdir config && cd config
touch setting.yml commands.yml cookies.yml
```

**配置**

```
> setting.yml
qrcode: false               # 是否启用扫码登录
                            # 每次登录都需验证,Docker启动禁用,默认不启用
number: 12345678            # QQ 账号
password: ""                # QQ 密码
master: 87654321            # BOT 持有者账号
header: ""                  # 命令起始符(可为空串"")
platform: 1                 # 登录平台
                            # 1.安卓手机(默认) 2.aPad 3.安卓手表 4.MacOS 5.iPad
atUser: true                # 是否启用回复时@用户, 默认关闭
dbPort: 56379               # 数据库端口
                            # 修改该选项需同时修改 redis.conf -> port
inviteAuth: master          # 邀请自动入群权限
                            # master表示BOT持有者, manager表示BOT管理员, 默认master
groupIntervalTime: 1500     # 群聊指令操作冷却时间, 单位毫秒, 默认 1500ms
privateIntervalTime: 2000   # 私聊指令操作冷却时间, 单位毫秒, 默认 2000ms
helpMessageStyle: message   # 帮助信息样式, 分为 message, forward, xml 三种
                            # 默认为 message. xml 疑似有封号风险, 谨慎使用, 大群勿用

# intervalTime: 1500  [已弃用]指令操作冷却时间, 单位毫秒, 默认1500ms
                      [向后兼容]当仅配置该项, 上两项未配置时, 群聊/私聊冷却时间均设为该项

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

### Forever

```
git clone https://github.com/SilveryStar/Adachi-BOT.git
cd Adachi-BOT
npm install

# 生成配置文件模板
npm run start

# 自行运行 Redis 数据库，默认端口 56379
# 暴露端口可在 /config/setting.yml 的 dbPort 中修改

# 使用 forever 模块启动
# 注意，请在 Node.js 版本高于 v12.16 且低于 v14 的环境中运行，参考 issues #14 
npm run serve
```

## About Issues
符合以下条件之一的 issue，将会被**直接关闭**
1. 可以在 `README.md` 或常见问题汇总中找到解决方案的 issue
2. 未依照模板提交或未提供完整信息的运行时错误 issue
3. 提出不合理需求的 issue

## Disclaimer
本项目自 `v2.1.6` 版本后，提供了私人服务功能，该功能旨在提供如实时便笺等私密功能，需个人提供**自己游戏账号对应的米游社cookie**后才可正常使用。这不可避免的会产生一定的账号安全隐患。为避免个人隐私信息泄露产生的纠纷，特做如下声明：
1. 本项目不使用任何云端服务器收集用户的隐私信息
2. 隐私数据仅存储在部署应用的服务器上，一切安全问题均为应用部署者的个人行为，与本项目无关
3. 本项目仅供学习交流技术使用，严禁用于任何商业用途和非法行为

## Pictures

<details>
<summary>生成玩家信息卡片(含配置) mys|uid</summary>

`v2.1.5` 版本后，信息卡可显示角色使用的武器信息，该信息的样式需在 `genshin.yml` 中的 `cardWeaponStyle` 配置，默认为 `normal`，区别如下:

<table align="center">
    <tr>
        <td><img src="https://z3.ax1x.com/2021/10/16/58XYND.png" alt="ERROR"/></td>
        <td><img src="https://z3.ax1x.com/2021/10/16/58X8HK.png" alt="ERROR"/></td>
        <td><img src="https://z3.ax1x.com/2021/10/16/58XJAO.png" alt="ERROR"/></td>
    </tr>
    <tr>
        <td align="center">normal 模式</td>
        <td align="center">weaponA 模式</td>
        <td align="center">weaponB 模式</td>
    </tr>
</table>

<div align="center">
  <img src="https://z3.ax1x.com/2021/10/16/58Xt4e.png" alt="ERROR"/>
</div>
</details>

<details>
<summary>祈愿十连 wish|w</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/27/RJn3N9.png" alt="ERROR"/>
  <img src="https://z3.ax1x.com/2021/06/27/RJne10.png" alt="ERROR"/>
</div>
</details>

<details>
<summary>角色/武器信息查询 info</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/27/RJnEhn.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnpX8.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnQ74.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJn1AJ.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnMBF.png" alt="ERROR">
</div>
</details>

<details>
<summary>圣遗物抽取/强化 art|imp</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/27/RJnP0g.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnCnS.png" alt="ERROR">
</div>
</details>

<details>
<summary>玩家角色查询 char</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/06/27/RJni7Q.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnKnU.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnnXT.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnmcV.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnZpq.png" alt="ERROR">
  <img src="https://z3.ax1x.com/2021/06/27/RJnAts.png" alt="ERROR">
</div>
</details>

<details>
<summary>深渊数据查询 aby</summary>
<div align="center">
    <img src="https://z3.ax1x.com/2021/09/24/4DTORs.png" alt="ERROR">
</div>
<div align="center">
    <img src="https://z3.ax1x.com/2021/09/24/4DTXzn.png" alt="ERROR">
</div>
</details>

<details>
<summary>每日素材订阅 sub</summary>
<div align="center">
    <img src="https://z3.ax1x.com/2021/10/06/4zJ4JI.png" alt="ERROR">
</div>
</details>

<details>
<summary>实时便笺 note</summary>
<div align="center">
    <img src="https://z3.ax1x.com/2021/10/23/5gm1bt.png" alt="ERROR">
</div>
</details>

## Thanks
| Nickname                                                     | Contribution                        |
| :----------------------------------------------------------: | ----------------------------------- |
|[GenshinImpactWiki](https://genshin-impact.fandom.com/wiki/Genshin_Impact_Wiki) | 本项目的绝大多数图片资源 |
|[lulu666lulu](https://github.com/lulu666lulu) | 提供了最新的DS算法 |
|[可莉特调](https://genshin.pub/daily) | 本项目每日素材订阅页面样式参考及黄历 |
|[西风驿站](https://bbs.mihoyo.com/ys/collection/307224)| 本项目攻略图图源 |
|[JetBrains](https://www.jetbrains.com?from=Adachi-BOT) | 为开源项目提供免费的 WebStorm 等 IDE 的授权 |


> [WebStorm](https://www.jetbrains.com/webstorm?from=Adachi-BOT) 是一个在各个方面都最大程度地提高开发人员的生产力的 IDE

[![Webstorm](https://github.com/SilveryStar/Adachi-BOT/blob/master/document/icon-webstorm.svg)](https://www.jetbrains.com/webstorm?from=Adachi-BOT)

## Resources
由于本项目的绝大多数图片资源都来自维基百科，我们依照 [CC-BY-SA-3.0](https://creativecommons.org/licenses/by-sa/3.0/legalcode) 协议将内容公开，发送申请到邮箱 `silverystar.top@gmail.com` 来获取图包，注意说明来意

## Licenses
[MIT](https://github.com/SilveryStar/Adachi-BOT/blob/master/LICENSE)
