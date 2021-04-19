const helpMessage =
`Adachi-BOT v1.4.1~"
当前支持命令：
1. 绑定|#s <米游社通行证>
2. 改绑|#c <米游社通行证>
3. 查询|#gq [米游社通行证|@]
4. 查询|#uid <游戏内UID>
5. 角色信息|#a <角色名>
6. 祈愿十连|#w
7. 随机圣遗物|#r [秘境id]
8. 强化圣遗物|#i
9 .秘境id查询|#d
10.仓库地址|#repo
11.骰子使用|.[r次数]d面数`;


module.exports = Message => {
    let msg = Message.raw_message;
    let groupID = Message.group_id;

    if (msg.includes('#repo')) {
        bot.sendGroupMsg(groupID, 'github.com/SilveryStar/Adachi-BOT，欢迎 Star').then();
    } else {
        bot.sendGroupMsg(groupID, helpMessage).then();
    }
}