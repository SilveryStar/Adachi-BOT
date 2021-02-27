const helpMessage =
`Adachi-BOT v1.1.2~
当前支持命令：
1. 绑定|#s 米游社通行证id
2. 改绑|#c 米游社通行证id
3. 查询|#gq [米游社通行证|@]
4. 抽奖|#r (秘境id)
5. 强化|#i
6. 秘境|#d`;


module.exports = Message => {
    bot.sendGroupMsg(Message.group_id, helpMessage).then();
}