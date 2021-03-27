const { getArtifact, domainInfo } = require('./data.js');
const { get } = require('../../utils/database');
const render = require('../../utils/render');

module.exports = async Message => {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let cmd = msg.match(/\d+/g), data;

    if (cmd === null) {
        if (msg.includes('#i')) {
            const { initial, fortified } = await get('artifact', 'user', {userID});
            if (JSON.stringify(initial) !== '{}') {
                data = fortified;
            } else {
                bot.sendGroupMsg(groupID, "请先使用 #r 抽取一个圣遗物后再使用该命令").then();
            }
        } else if (msg.includes('#r')) {
            await getArtifact(userID,-1);
            data = (await get('artifact', 'user', {userID})).initial;
        } else if (msg.includes('#d')) {
            bot.sendGroupMsg(groupID, domainInfo()).then();
            return;
        }
    } else if (cmd.length === 1) {
        await getArtifact(userID, parseInt(cmd[0]));
        data = (await get('artifact', 'user', {userID})).initial;
    } else {
        bot.sendGroupMsg(groupID, "请正确输入秘境id").then();
    }

    await render(data, 'genshin-artifact', groupID);
}