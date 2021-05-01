const helpMessage =
`Adachi-BOT v1.4.5~
当前支持命令：
1. 绑定|#s (米游社通行证)
2. 改绑|#c (米游社通行证)
3. 查询|#gq [米游社通行证|@]
4. 查询|#uid (游戏内UID)
5. 角色查询|#a (角色名)
6. 角色信息|#info (角色名)
7. 祈愿十连|#w
8. 切换卡池|#t (常驻|角色|武器)
9. 随机圣遗物|#r [秘境id]
10. 强化圣遗物|#i
11.秘境id查询|#d
12.骰子使用|.[r次数]d面数
13.消息反馈|#fb (信息)
14.仓库地址|#repo
15.主人权限帮助|#rhelp
PS.()表示必填，[]表示可选
私聊功能已开放！欢迎体验与反馈`;

module.exports = async ( id, type ) => {
    await bot.sendMessage(id, helpMessage, type);
}