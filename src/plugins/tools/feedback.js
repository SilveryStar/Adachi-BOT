const { hasAuth, sendPrompt } = require('../../utils/auth');

module.exports = async ( id, name, msg, type, user ) => {
    let info = msg.slice(4);

    if (!(await hasAuth(user, 'feedback'))) {
        await sendPrompt(id, name, '反馈', type);
    } else {
        await bot.sendMaster(id, `来自用户 ${name}(${user}) 的反馈: ${info}`, type);
        await bot.sendMessage(id, '消息反馈成功', type);
    }
}