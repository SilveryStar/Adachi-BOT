const helpMessage =
`Adachi-BOT v1.0.3
当前支持命令：
1. 绑定|#s 米游社通行证id
2. 改绑|#c 米游社通行证id
3. 原神查询|#gq [米游社通行证id|@]
使用 #help detail 了解更多信息`;

const commandHelp =
`使用命令+通行证id可获取信息，如：.gq 159633945
当你为当前QQ账号绑定通行证id后，可直接使用 .gq 获取绑定账号的信息
若想查询其他已绑定通行证id的群友信息，可使用 .gq @{GroupMember}
`;

module.exports = Message => {
    let msg = Message.raw_message;
    if (msg.includes('detail')) {
        bot.sendGroupMsg(Message.group_id, commandHelp).then();
    } else {
        bot.sendGroupMsg(Message.group_id, helpMessage).then();
    }
}