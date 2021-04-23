const helpMessage =
`Adachi-BOT v1.4.4~
当前支持命令：
1. 绑定|#s (米游社通行证)
2. 改绑|#c (米游社通行证)
3. 查询|#gq [米游社通行证|@]
4. 查询|#uid (游戏内UID)
5. 角色信息|#a (角色名)
6. 祈愿十连|#w
7. 切换卡池|#t (常驻|角色|武器)
8. 随机圣遗物|#r [秘境id]
9. 强化圣遗物|#i
10.秘境id查询|#d
11.骰子使用|.[r次数]d面数
12.消息反馈|#fb (信息)
13.仓库地址|#repo
14.主人权限帮助|#rhelp
PS.()表示必填，[]表示可选
私聊功能已开放！欢迎体验与反馈`;

module.exports = async ( id, type ) => {
    await bot.sendMessage(id, helpMessage, type);
}