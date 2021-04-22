const { basePromise, detailPromise, characterPromise } = require('../../utils/detail');
const { get, isInside } = require('../../utils/database');
const render = require('../../utils/render');

const generateImage = async ( uid, id, type ) => {
    const data = await get('info', 'user', { uid });
    await render(data, 'genshin-card', id, type);
}

const getID = async ( msg, userID ) => {
    let id = msg.match(/\d+/g);
    let errInfo = '';

    if (msg.includes('CQ:at')) {
        let atID = parseInt(id[0]);
        if (await isInside('map', 'user', 'userID', atID)) {
            return (await get('map', 'user', { userID: atID })).mhyID;
        } else {
            errInfo = "用户 " + atID + " 暂未绑定米游社通行证";
        }
    } else if (id !== null) {
        if (id.length > 1) {
            errInfo = "输入通行证不合法";
        } else {
            return parseInt(id[0]);
        }
    } else if (await isInside('map', 'user', 'userID', userID)) {
        return (await get('map', 'user', { userID })).mhyID;
    } else {
        errInfo = "您还未绑定米游社通行证，请使用 #s + id";
    }

    return errInfo;
};

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let sendID  = type === 'group' ? groupID : userID;
    let dbInfo  = await getID(msg, userID), uid;

    if (typeof dbInfo === 'string') {
        await bot.sendMessage(sendID, dbInfo.toString(), type);
        return;
    }

    try {
        const baseInfo = await basePromise(dbInfo, userID);
        uid = baseInfo[0];
        const detailInfo = await detailPromise(...baseInfo, userID);
        await characterPromise(...baseInfo, detailInfo);
    } catch (errInfo) {
        if (errInfo !== '') {
            await bot.sendMessage(sendID, errInfo, type);
            return;
        }
    }

    await generateImage(uid, sendID, type);
}