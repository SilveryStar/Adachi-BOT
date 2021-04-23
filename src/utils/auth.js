const { isInside, update, push, get } = require('./database');

exports.isMaster = userID => {
    return userID === master;
}

exports.sendPrompt = async ( id, name, auth, type ) => {
    await bot.sendMessage(id, `用户 ${name} 不拥有 ${auth} 权限`, type);
}

exports.initAuth = async userID => {
    if (!(await isInside('authority', 'user', 'userID', userID))) {
        await push('authority', 'user', {
            userID,
            gacha: true,
            artifact: true,
            feedback: true
        });
    }
}

exports.setAuth = async ( auth, target, isOn, data = {} ) => {
    data[auth] = isOn;
    await update('authority', 'user', { userID: target }, data)
}

exports.hasAuth = async ( userID, auth ) => {
    return (await get('authority', 'user', { userID }))[auth];
}