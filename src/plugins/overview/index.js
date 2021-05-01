const { getCharacterOverview } = require('../../utils/api');
const render = require('../../utils/render');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let sendID  = type === 'group' ? groupID : userID;
    let character = msg.match(/[\u4e00-\u9fa5]{1,10}/g), data;

    if (!character || character.length > 1) {
        await bot.sendMessage(sendID, "请正确输入角色名称", type);
        return;
    }

    try {
        data = await getCharacterOverview(character[0]);
    } catch (errInfo) {
        await bot.sendMessage(sendID, "查询失败，请检查角色名称是否正确", type);
        return;
    }

    await render(data, 'genshin-overview', sendID, type);
}