const helpMessage =
`Adachi-BOT v1.1.2~
当前支持命令：
1. 绑定|#s 米游社通行证id
2. 改绑|#c 米游社通行证id
3. 查询|#mq [米游社通行证|@]
4. 查询|#gq UID
5. 随机圣遗物|#r (秘境id)
6. 强化圣遗物|#i
7. 秘境id查询|#d`;


module.exports = Message => {
    bot.sendGroupMsg(Message.group_id, helpMessage).then();
}