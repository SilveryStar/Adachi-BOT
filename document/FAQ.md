### Q1：登录报错「群消息发送失败，请检查消息内容」？
QQ 账号在服务器上异地登录易被风控，需要挂机几小时到几天不等，同时注意账号等级过低也会导致该错误

### Q2：登录报错「当前上网环境异常」？
下载[链接](https://github.com/mzdluo123/TxCaptchaHelper/releases)中的 apk 文件，在安卓真机上完成滑动验证获取 ticket

### Q3：部署后发消息机器人没有回复？
- A1：`npm run login` 命令仅用于生成 Docker 启动所需的设备文件，不具备回复功能，请使用 `npm start` 或 `npm run serve`
- A2：`header` 为空或 # 或 & 时，需要添加双引号，即 `""  "#"  "&"`

### Q4：启动时报错「YAMLReferenceError: Aliased anchor not found」？
`header` 为星号时，需要添加双引号 `"*"`

### Q5：使用 mys/uid/char 命令时报错「Please login」？
在 config/cookies.yml 中填写 Cookies 后，该命令才会生效，此外，应注意该文件的格式
```
# 正确
cookies:
  - foo
  
# 错误
cookies: foo
```

### Q6：如何获得米游社 Cookies ？
访问[米游社原神社区](https://bbs.mihoyo.com/ys/)，登录后账户点击 F12 ，选中 Console 或控制台，输入 `document.cookie` ，回车即可获取

### Q7：命令报错「You can access the genshin game records of up to 30 other people」？
每个 Cookies 每天只能查询 30 次，对于人员较多的群聊，需要使用更多的 Cookies

### Q8：启动时报错「Error: connect ECONNREFUSED 127.0.0.1:xxxx」？
`Redis` 数据库未启动，建议使用 Docker 运行数据库容器
1. 安装 Docker，见[菜鸟教程](https://www.runoob.com/docker/centos-docker-install.html)
2. 创建一个存放数据的目录，如 `/usr/data/redis`
3. 运行命令 `docker run -d -p 56379:6379 --name bot-redis -v /usr/data/redis:/data redis --appendonly yes`
