const dice = require('./dice');

module.exports = Message => {
    let msg = Message.raw_message;
    let groupID = Message.group_id;

    switch (true) {
        case msg.includes('d'):
            dice(msg, groupID);
            break;
    }
}