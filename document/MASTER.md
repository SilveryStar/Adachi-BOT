## 自定义 <span id="customize"/>
在每次启动后，所有命令式指令的命令头会以指令键名为索引写入 `/config/commands.yml` 中，你可以修改并重启来自定义命令头：
* 在使用 `help` 时添加 `-k` 参数可以查看指令对应的指令头
* 在命令头前使用双下划线可以屏蔽 `/config/setting.yml` 中的 `header` 配置，如 `__mys`

应用启动后，使用 `header+help` 查询权限对应的所有指令，如 `header` 设定为 `#` 时，即为 `#help`， 使用 `#help -k` 查询指令的 `key`

当你更新至 `v2.1.0` 版本并启动过一次应用后，`/config/commands.yml` 将被扩展为可配置内容更多的形式，指令的 `key` 下方第一个属性为 `type` ，这表示这条指令的类型，分为 `order`, `switch` 和 `question` 三种，你不必知道他们的具体区别，但需要了解配置他们时的差异

### 通用
* `enable` 是否启用指令，默认为 `true`（启用），设置为 `false` 即可禁用
* `auth` 指令使用权限（`0.封禁用户 1.普通用户 2.BOT管理员 3.BOT持有者`），权限等级不低于该设定等级的用户才可以使用该指令，见权限管理
* `scope` 指令生效范围，`1.仅群聊 2.仅私聊 3.群聊和私聊`

### order
* `headers` 指令头，可配置多个

### switch
这是一种开关式的指令，`on` 表示运行某正向功能，`off` 则表示运行逆向功能让
* `header` 指令头，可配置一个
* `mode` 指令模式，有 `single` 和 `divided`将在下面的例子中详解
* `on`, `off` 关键词

例子：
```
setting.yml -> header: "#"                  setting.yml -> header: ""

silvery-star.alias-customize:               silvery-star.alias-customize:
  type: switch                                type: switch
  mode: single                                mode: divided
  on: add                                     on: 增加别名
  off: remove                                 off: 删除别名
  enable: true                                enable: true
  header: alias                               header: alias
                                            => 增加别名 <本名> <别名>
=> #alias <add|remove> <本名> <别名>          
                                            => 删除别名 <本名> <别名>
```
由此定义你喜欢的指令样式

### question
无配置项

## 日志模块
```
# Adachi-BOT 使用 docker json-file 作为日志输出
# Docker 启动，查看日志目录
docker inspect --format='{{.LogPath}}' adachi-bot

# Forever 启动，查看日志目录
forever list
```

## 数据迁移
对于 `Adachi-BOT v1.x` 的用户，在启动应用前，将原版本中的 `./data/db/map.json` 移动至新版本的项目根目录下，即可完成米游社绑定数据迁移

## 权限管理
**管理员**

使用 `manager` 和 `unmanaged` 指令为你的 bot 添加/删除管理员，管理员可以使用除此两指令外的其他所有权限管理指令

**屏蔽**

`ban` 和 `unban` 指令可以完全屏蔽某个用户或群聊的操作，注意在使用时，指定 QQ 号时需添加 `-u` 参数，指定群号时需添加 `-g`

**指令权限**

`limit` 指令用于对某个用户或群聊进行针对性的操作屏蔽，通过指令的 `key` 来启用和禁用部分功能（见[自定义](#customize)）