const { push, isInside, update } = require('../../utils/database');
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
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let cmd = msg.match(/[\u4e00-\u9fa5]{2}/g);

    await userInitialize(userID);

    if (msg.includes('#t')) {
        if (!cmd || cmd.length > 1) {
            await bot.sendGroupMsg(groupID, '请正确输入祈愿名称');
        } else {
            let choice;
            switch (cmd[0]) {
                case '常驻': choice = 200; break;
                case '角色': choice = 301; break;
                case '武器': choice = 302; break;
                default: await bot.sendGroupMsg(groupID, '未知祈愿名称'); return;
            }
            await update('gacha', 'user', { userID }, { choice });
            await bot.sendGroupMsg(groupID, '卡池已切换至: ' + cmd[0]);
        }
    } else if (msg.includes('#w')) {
        let data = await getGachaResult(userID);
        await render(data, 'genshin-gacha', groupID);
    }
}