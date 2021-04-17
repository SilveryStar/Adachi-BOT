const { isInside, push, update } = require('../../utils/database');

module.exports = async Message => {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let id = msg.match(/\d+/g), mhyID;

    if (id === null || id.length > 1) {
        bot.sendGroupMsg(groupID, "请正确输入通行证id").then();
    } else {
        mhyID = parseInt(id[0]);
        if (msg.includes('#s') || msg.includes('绑定')) {
            if (!(await isInside('map', 'user', 'userID', userID))) {
                await push('map', 'user', {userID, mhyID});
                if (!(await isInside('time', 'user', 'mhyID', mhyID))) {
                    await push('time', 'user', {mhyID, time: 0});
                }
                bot.sendGroupMsg(groupID, "通行证绑定成功，使用 #gq 来查询游戏信息").then();
            } else {
                bot.sendGroupMsg(groupID, "您已绑定通行证，请使用 #c " + mhyID).then();
            }
        } else if (msg.includes('#c') || msg.includes('改绑')) {
            if (await isInside('map', 'user', 'userID', userID)) {
                await update('map', 'user', {userID}, {mhyID});
                bot.sendGroupMsg(groupID, "通行证改绑成功").then();
            } else {
                bot.sendGroupMsg(groupID, "您还未绑定通行证，请使用 #s " + mhyID).then();
            }
        }
    }
}