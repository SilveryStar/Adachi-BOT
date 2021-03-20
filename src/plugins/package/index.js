const { detailPromise, characterPromise } = require('../../utils/detail');
const { get } = require('../../utils/database');
const render = require('../../utils/render');

const generateImage = async ( uid, groupID ) => {
    let data = await get('info', 'user', {uid});
    await render(data, 'genshin-info', groupID);
}

const getID = msg => {
    let id = msg.match(/\d+/g)
    let errInfo = '';

    if (id.length > 1 || id[0].length !== 9 || (id[0][0] !== '1' && id[0][0] !== '5')) {
        errInfo = "输入 UID 不合法";
        return errInfo;
    }

    let uid = parseInt(id[0]);
    let region = id[0][0] === '1' ? 'cn_gf01' : 'cn_qd01';

    return [uid, region];
}

module.exports = async Message => {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let dbInfo = getID(msg);

    if (typeof dbInfo === 'string') {
        bot.sendGroupMsg(groupID, dbInfo.toString()).then();
        return;
    }

    try {
        const detailInfo = await detailPromise(...dbInfo, userID);
        await characterPromise(...dbInfo, detailInfo)
    } catch (errInfo) {
        if (errInfo !== '') {
            bot.sendGroupMsg(groupID, errInfo).then();
            return;
        }
    }

    await generateImage(dbInfo[0], groupID);
}