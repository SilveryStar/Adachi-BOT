## Adachi-BOT v2.2.0 Beta

## Preface
这是 `Adachi-BOT` v2.2.0 `Web Console` 更新的分支页面，你可以使用 `-b` 添加参数 `clone` 最新版本<br>
目前处于测试阶段，暂时只支持 `Forever` 部署，默认情况下，`Web Console` 开放在 80 端口，你可以直接访问服务器 IP 或本地运行时访问 `localhost` 来进入页面，也可以修改 `consolePort` 来定制

后续会使用 `VuePress` 重写项目文档，此 README 仅临时使用<br>
欢迎懂 UI 设计的大佬帮忙设计页面布局，有意请邮件交流 `silverystar.top@gmail.com`

## Updated
### Feature
- `Web Console`
- 数据收集与统计
- 高频使用监测

### Refactor
- 重构 BOT 启动逻辑

### BreakChange
- `intervalTime` 被彻底废弃
- v2.1.0 之前的配置不再兼容

## TODO
### BugFix
- `silvery-star.almanac` 在部署环境中发生无限递归爆栈
- `silvery-star.slip` 概率返回 `undefined`
- 角色数据查询逻辑错误

### Pref
- 优化 `silvery-star.abyss` 和 `silvery-star.uid-query` 在渲染页面的名称显示
- 优化 `NoteService` 的数据更新逻辑