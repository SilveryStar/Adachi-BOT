const { isMaster, setAuth, sendPrompt } = require('../../utils/auth');

const parse = msg => {
    let id = parseInt(msg.match(/[0-9]+/g)[0]);
    let isOn = msg.includes('on');

    return [ id, isOn ];
}

const response = async (id, target, auth, type, isOn ) => {
    await bot.sendMessage(id, `用户 ${target} 的 ${auth} 权限已${isOn}`, type);
};

const setFeedbackAuth = async ( msg, id, type ) => {
    let [ target, isOn ] = parse(msg);
    await setAuth('feedback', target, isOn);
    await response(id, target, '反馈', type, isOn ? '开启' : '关闭');
};

const setGachaAuth = async ( msg, id, type ) => {
    let [ target, isOn ] = parse(msg);
    await setAuth('gacha', target, isOn);
    await response(id, target, '祈愿十连', type, isOn ? '开启' : '关闭');
};

const setArtifactAuth = async ( msg, id, type ) => {
    let [ target, isOn ] = parse(msg);
    await setAuth('artifact', target, isOn);
    await response(id, target, '抽取圣遗物', type, isOn ? '开启' : '关闭');
}

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;

    if (!isMaster(userID)) {
        await sendPrompt(sendID, name, '使用master命令', type);
        return;
    }

    switch (true) {
        case msg.includes('#fba'):
            await setFeedbackAuth(msg, sendID, type);
            break;
        case msg.includes('#wa'):
            await setGachaAuth(msg, sendID, type);
            break;
        case msg.includes('#ra'):
            await setArtifactAuth(msg, sendID, type);
            break;
    }
}