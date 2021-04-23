const helpMessage =
`Adachi-BOT v1.4.4~
当前支持的权限级命令：
1. 反馈权限|#fba (QQ) (on|off)
2. 祈愿权限|#wa (QQ) (on|off)
3. 圣遗物权限|#ra (QQ) (on|off)
`;

module.exports = async ( id, type ) => {
    await bot.sendMessage(id, helpMessage, type);
}