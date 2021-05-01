const helpMessage =
`Adachi-BOT v1.4.5~
当前支持的权限级命令：
1. 反馈权限|#fba (QQ) (on|off)
2. 祈愿权限|#wa (QQ) (on|off)
3. 圣遗物权限|#ra (QQ) (on|off)
4. 游戏内信息查询权限|#ga (QQ) (on|off)
5. 角色信息查询权限|#ifa (QQ) (on|off)
6. 手动刷新卡池|#rw`;

module.exports = async ( id, type ) => {
    await bot.sendMessage(id, helpMessage, type);
}