const dice = require('./dice');
const help = require('./help');
const repo = require('./repo');
const feedback = require('./feedback');
const master = require('./master');

module.exports = Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;

    switch (true) {
        case msg.includes('d'):
            dice(sendID, msg, type);
            break;
        case msg.includes('#help'):
            help(sendID, type);
            break;
        case msg.includes('#repo'):
            repo(sendID, type);
            break;
        case msg.includes('#fb'):
            feedback(sendID, name, msg, type, userID);
            break;
        case msg.includes('#rhelp'):
            master(sendID, type);
            break;
    }
}