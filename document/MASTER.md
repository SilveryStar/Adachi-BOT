### 自定义 <span id="customize"/>
在每次启动后，所有命令式指令的命令头会以指令键名为索引写入 `/config/commands.yml` 中，你可以修改并重启来自定义命令头：
* 在使用 `help` 时添加 `-k` 参数可以查看指令对应的指令头
* 在命令头前使用双下划线可以屏蔽 `/config/setting.yml` 中的 `header` 配置，如 `__mys`

应用启动后，使用 `header+help` 查询权限对应的所有指令，如 `header` 设定为 `#` 时，即为 `#help`， 使用 `#help -k` 查询指令的 `key`

### 日志模块
```
# Adachi-BOT 使用 docker json-file 作为日志输出
# Docker 启动，查看日志目录
docker inspect --format='{{.LogPath}}' adachi-bot

# Forever 启动，查看日志目录
forever list
```

### 数据迁移
对于 `Adachi-BOT v1.x` 的用户，在启动应用前，将原版本中的 `./data/db/map.json` 移动至新版本的项目根目录下，即可完成米游社绑定数据迁移

### 权限管理
**管理员**

使用 `manager` 和 `unmanaged` 指令为你的 bot 添加/删除管理员，管理员可以使用除此两指令外的其他所有权限管理指令

**屏蔽**

`ban` 和 `unban` 指令可以完全屏蔽某个用户或群聊的操作，注意在使用时，指定 QQ 号时需添加 `-u` 参数，指定群号时需添加 `-g`

**指令权限**

`limit` 指令用于对某个用户或群聊进行针对性的操作屏蔽，通过指令的 `key` 来启用和禁用部分功能（见[自定义](#customize)）

**指令启用/禁用**

在 `/config/genshin.yml` 中，你可以用 `true/false` 来设置是否启用指令<br>
在 `/config/commands.yml` 中，将一个 `key` 的值设为空数组，如 `silvery-star.art: []`，即可禁用该指令