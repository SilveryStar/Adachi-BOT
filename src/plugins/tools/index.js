const dice = require('./dice');

module.exports = Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let sendID  = type === 'group' ? groupID : userID;

    switch (true) {
        case msg.includes('d'):
            dice(sendID, msg, type);
            break;
    }
}