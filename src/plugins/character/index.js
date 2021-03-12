const { get, isInside } = require('../../utils/database');
const render = require('../../utils/render');

module.exports = Message => {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let character = msg.match(/[\u4e00-\u9fa5]{1,10}/g);

    if (!isInside('character', 'user', 'userID', userID)) {
        bot.sendGroupMsg(groupID, "请先使用 #gq 或 #uid 指定需要查询的账号").then();
        return;
    }
    if (!character || character.length > 1) {
        bot.sendGroupMsg(groupID, "请正确输入角色名称").then();
        return;
    }

    let uid = get('character', 'user', {userID}).uid;
    let info = get('info', 'user', {uid}).avatars;
    let data = info.find(el => el.name === character[0]);

    if (!data) {
        bot.sendGroupMsg(groupID, "查询失败，请检查角色名称是否正确或该用户是否拥有该角色").then();
        return;
    }

    render({uid, data}, 'genshin-character', groupID);
}