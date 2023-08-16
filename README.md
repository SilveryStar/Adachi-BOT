<div align="center">
    <img src="https://docs.adachi.top/images/adachi.png" width="200"/>
    <h3>- AdachiBOT -</h3>
    <div>
        <a href="https://docs.adachi.top" target="_blank">官方文档</a> &nbsp;|&nbsp;
        <a href="https://github.com/SilveryStar/Adachi-Plugin" target="_blank">插件库</a> &nbsp;|&nbsp;
        <a href="https://github.com/SilveryStar/Adachi-BOT/issues/146">关于频道</a>
    </div>
    <small>&gt; 原神Q群助手 &lt;</small>
    <div>
        <br/>
        <a href="https://github.com/SilveryStar/Adachi-BOT/issues/137">~ QQ频道上线 ~</a>
    </div>
</div>

# 更新内容

- 指令 `#refresh` 现允许对所有配置项进行刷新
- 帮助列表中限制最多展示两个指令头，`#detail` 指令可用于查看全部指令头
- 新增插件热重载指令 `#reload`
- #help 现在将展示权限内的全部指令，使用符号来标记指令的使用场景
- `config.header` 指令头现允许配置多个，且允许配置正则相关符号
- `command.yml` 中新增优先级配置项 `priority`。对相同触发条件指令根据优先级大小决定应触发的目标
- 通讯底层协议由 `icqq` 改为 `go-cqhttp`
- 由于改为 `go-cqhttp` 后不再需要 bot qq与密码配置，控制台改为在初次进入时进入创建 root 账号页面