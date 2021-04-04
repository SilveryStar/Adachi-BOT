const { get } = require('../../utils/database');
const render = require('../../utils/render');
const { wish } = require('./wish');

module.exports = async Message => {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let nickname = Message.sender.card;
    let cmd = msg.match(/\d+/g), data;
    let wishdata = [];

    if (cmd === null) {
        if (msg.includes('#w')) {
            wishdata = await wish(userID);
        } else return ;
    } else return ;

    await render({nickname: nickname, data: wishdata}, 'genshin-wish', groupID);
}