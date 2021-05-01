const { push, isInside, update } = require('../../utils/database');
const { hasAuth, sendPrompt } = require('../../utils/auth');
const render = require('../../utils/render');
const getGachaResult = require('./gacha');

const userInitialize = async userID => {
    if (!(await isInside('gacha', 'user', 'userID', userID))) {
        await push('gacha', 'user', {
            userID,
            choice: 301,
            indefinite: { five: 1, four: 1, isUp: undefined },
            character:  { five: 1, four: 1, isUp: 0 },
            weapon:     { five: 1, four: 1, isUp: null }
        });
    }
};

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let sendID  = type === 'group' ? groupID : userID;
    let name    = Message.sender.nickname;
    let cmd     = msg.match(/[\u4e00-\u9fa5]{2}/g);

    await userInitialize(userID);

    if (!(await hasAuth(userID, 'gacha'))) {
        await sendPrompt(sendID, name, '祈愿十连', type);
        return;
    }

    if (msg.includes('#t')) {
        if (!cmd || cmd.length > 1) {
            await bot.sendMessage(sendID, '请正确输入祈愿名称', type);
        } else {
            let choice;
            switch (cmd[0]) {
                case '常驻': choice = 200; break;
                case '角色': choice = 301; break;
                case '武器': choice = 302; break;
                default: await bot.sendMessage(sendID, '未知祈愿名称', type); return;
            }
            await update('gacha', 'user', { userID }, { choice });
            await bot.sendMessage(sendID, '卡池已切换至: ' + cmd[0], type);
        }
    } else if (msg.includes('#w')) {
        let data = await getGachaResult(userID, name);
        await render(data, 'genshin-gacha', sendID, type);
    }
}