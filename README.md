## Adachi-BOT v2.0！
本项目目前还处于开发起步阶段，欢迎用户和开发者提供交流意见和建议 ( [插件开发文档](https://github.com/SilveryStar/Adachi-BOT/tree/v2.0Beta/document/README.md) )

### Usage
#### Docker （暂无）

#### Forever
**Install**
```
git clone -b v2.0Beta https://github.com/SilveryStar/Adachi-BOT.git
cd Adachi-BOT
npm install
```

**Config**
```
# 生成配置文件模板
npm run start
```

**Database**

自行运行`Redis`数据库，默认端口`56379`

**Run**
```
# 使用 forever 模块
npm run serve
```

### Migrate
对于 `Adachi-BOT v1.x` 的用户，在启动应用前，将原版本中的 `./data/db/map.json` 移动至新版本的项目根目录下，即可完成米游社绑定数据迁移。

### TODO
+ [x] 增加数据库模块
+ [x] 增加群聊限制系统
+ [x] 增加图片渲染模块
+ [x] 完善模块配置系统
+ [x] 完善权限管理模块
+ [x] 迁移 `Adachi-BOT1.x` 中的基本功能模块
+ [x] 使用 `Vue3.0` 重写 `Adachi-BOT1.x` 中的查询模块
+ [ ] 提供 `Adachi-BOT2.0` 官方插件库
