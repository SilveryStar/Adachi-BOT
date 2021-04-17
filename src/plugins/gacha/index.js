const render = require('../../utils/render');
const getGachaResult = require('./gacha');

module.exports = async Message => {
    let userID = Message.user_id;
    let groupID = Message.group_id;

    let data = await getGachaResult(userID);

    await render(data, 'genshin-gacha', groupID);
}