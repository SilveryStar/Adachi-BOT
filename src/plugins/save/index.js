const { isInside, push, update } = require('../../utils/database');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let sendID  = type === 'group' ? groupID : userID;
    let id      = msg.match(/\d+/g), mhyID;

    if (id === null || id.length > 1) {
        await bot.sendMessage(sendID, "请正确输入通行证id", type);
    } else {
        mhyID = parseInt(id[0]);
        if (msg.includes('#s') || msg.includes('绑定')) {
            if (!(await isInside('map', 'user', 'userID', userID))) {
                await push('map', 'user', {userID, mhyID});
                if (!(await isInside('time', 'user', 'mhyID', mhyID))) {
                    await push('time', 'user', {mhyID, time: 0});
                }
                await bot.sendMessage(sendID, "通行证绑定成功，使用 #gq 来查询游戏信息", type);
            } else {
                await bot.sendMessage(sendID, "您已绑定通行证，请使用 #c " + mhyID, type);
            }
        } else if (msg.includes('#c') || msg.includes('改绑')) {
            if (await isInside('map', 'user', 'userID', userID)) {
                await update('map', 'user', {userID}, {mhyID});
                await bot.sendMessage(sendID, "通行证改绑成功", type);
            } else {
                await bot.sendMessage(sendID, "您还未绑定通行证，请使用 #s " + mhyID, type);
            }
        }
    }
}