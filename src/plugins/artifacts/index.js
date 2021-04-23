const { getArtifact, domainInfo } = require('./data.js');
const { get, isInside, push } = require('../../utils/database');
const render = require('../../utils/render');

const userInitialize = async userID => {
    if (!(await isInside('artifact', 'user', 'userID', userID))) {
        await push('artifact', 'user', {
            userID,
            initial: {},
            fortified: {}
        });
    }
};

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let sendID  = type === 'group' ? groupID : userID;
    let cmd     = msg.match(/\d+/g), data;

    await userInitialize(userID);

    if (cmd === null) {
        if (msg.includes('#i')) {
            const { initial, fortified } = await get('artifact', 'user', { userID });
            if (JSON.stringify(initial) !== '{}') {
                data = fortified;
            } else {
                await bot.sendMessage(sendID, "请先使用 #r 抽取一个圣遗物后再使用该命令", type);
                return;
            }
        } else if (msg.includes('#r')) {
            await getArtifact(userID,-1);
            data = (await get('artifact', 'user', { userID })).initial;
        } else if (msg.includes('#d')) {
            await bot.sendMessage(sendID, domainInfo(), type);
            return;
        }
    } else if (cmd.length === 1) {
        await getArtifact(userID, parseInt(cmd[0]));
        data = (await get('artifact', 'user', { userID })).initial;
    } else {
        await bot.sendMessage(sendID, "请正确输入秘境id", type);
    }

    await render(data, 'genshin-artifact', sendID, type);
}