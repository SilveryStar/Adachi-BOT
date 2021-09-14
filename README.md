## Adachi-BOT v2.0！
更好的管理模块与图片样式<br>
对于开发者，若有意愿开发插件，请参考 [插件开发文档](https://github.com/SilveryStar/Adachi-BOT/tree/v2.0Beta/document)

[常见问题汇总](https://github.com/SilveryStar/Adachi-BOT/blob/master/document/FAQ.md) | [管理者手册](https://github.com/SilveryStar/Adachi-BOT/blob/master/document/MASTER.md)

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
qrcode: false       # 是否启用扫码登录
                    # 每次登录都需验证,Docker启动禁用,默认不启用
number: 12345678    # QQ 账号
password: ""        # QQ 密码
master: 87654321    # BOT 持有者账号
header: ""          # 命令起始符(可为空串"")
platform: 1         # 登录平台
                    # 1.安卓手机(默认) 2.aPad 3.安卓手表 4.MacOS 5.iPad
atUser: true        # 是否启用回复时 at 用户,默认关闭
dbPort: 56379       # 数据库端口
                    # 修改该选项需同时修改 redis.conf -> port
intervalTime: 1500  # 指令操作冷却时间,单位毫秒,默认 1500ms

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

## Pictures

<details>
<summary>生成玩家信息卡片 mys|uid</summary>
<div align="center">
  <img src="https://z3.ax1x.com/2021/07/22/WBzWmd.png" alt="ERROR"/>
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

## Thanks
| Nickname                                                     | Contribution                        |
| :----------------------------------------------------------: | ----------------------------------- |
|[GenshinImpactWiki](https://genshin-impact.fandom.com/wiki/Genshin_Impact_Wiki) | 本项目的绝大多数图片资源 |
|[lulu666lulu](https://github.com/lulu666lulu)| 提供了最新的DS算法 |

## Resources
由于本项目的绝大多数图片资源都来自维基百科，我们依照 [CC-BY-SA-3.0](https://creativecommons.org/licenses/by-sa/3.0/legalcode) 协议将内容公开，发送申请到邮箱 `silverystar.top@gmail.com` 来获取图包，注意说明来意

## Licenses
[MIT](https://github.com/SilveryStar/Adachi-BOT/blob/master/LICENSE)
