const { getArtifact } = require('./data.js');
const { get } = require('../../utils/database');
const render = require('../../utils/render');

const { domains } = artifactCfg;

module.exports = Message => {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let cmd = msg.match(/\d+/g), data;

    if (cmd === null) {
        if (msg.includes('#i')) {
            let userInfo = get('artifact', 'user', {userID});
            if (JSON.stringify(userInfo.initial) !== '{}') {
                data = userInfo.fortified;
            } else {
                bot.sendGroupMsg(groupID, "请先使用 #r 抽取一个圣遗物后再使用该命令").then();
            }
        } else if (msg.includes('#r')) {
            getArtifact(userID,-1);
            data = get('artifact', 'user', {userID}).initial;
        } else if (msg.includes('#d')) {
            let domainsMsg = "";
            for (let i in domains) {
                if (domains.hasOwnProperty(i)) {
                    domainsMsg += domains[i].name + ': ' + i + '\n';
                }
            }
            bot.sendGroupMsg(groupID, domainsMsg).then();
            return;
        }
    } else if (cmd.length === 1) {
        getArtifact(userID, parseInt(cmd[0]));
        data = get('artifact', 'user', {userID}).initial;
    } else {
        bot.sendGroupMsg(groupID, "请正确输入秘境id").then();
    }

    render(data, 'genshin-artifact', groupID);
}