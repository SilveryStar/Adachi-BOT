const { getDetail } = require('../../utils/api');
const { get, isInside, push, update } = require('../../utils/database');
const render = require('../../utils/render');

const generateImage = ( uid, groupID ) => {
    let data = get('info', 'user', {uid});
    render(data, 'genshin-info', groupID);
}

module.exports = Message => {
    let msg = Message.raw_message;
    let groupID = Message.group_id;
    let id = msg.match(/\d+/g);

    if (id.length > 1 || id[0].length !== 9 || (id[0][0] !== '1' && id[0][0] !== '5')) {
        bot.sendGroupMsg(groupID, "输入 UID 不合法").then();
        return;
    }

    let uid = parseInt(id[0]);
    let region = id[0][0] === '1' ? 'cn_gf01' : 'cn_qd01';

    if (!isInside('time', 'user', 'uid', uid)) {
        push('time', 'user', {uid, time: 0});
    }
    if (!isInside('info', 'user', 'uid', uid)) {
        // TODO: 增加装备查询
        let initData = {
            retcode: 19260817,
            message: "",
            level: -1,
            nickname: "",
            uid,
            avatars: [],
            stats: {},
            explorations: []
        };
        push('info', 'user', initData);
    }

    let nowTime = new Date().valueOf();
    let lastTime = get('time', 'user', {uid}).time;

    if (nowTime - lastTime >= 60 * 60 * 1000) {
        update('time', 'user', {uid}, {time: nowTime});
        getDetail(uid, region)
            .then(res => {
                if (res.retcode === 0) {
                    let detailInfo = res.data;
                    update('info', 'user', {uid}, {
                        retcode:        parseInt(res.retcode),
                        message:        res.message,
                        avatars:        detailInfo.avatars,
                        stats:          detailInfo.stats,
                        explorations:   detailInfo.world_explorations
                    });
                    bot.logger.info("用户 " + uid + " 查询成功，数据已缓存");
                    generateImage(uid, groupID);
                } else {
                    bot.sendGroupMsg(groupID, "米游社接口报错: " + res.message).then();
                    update('info', 'user', {uid}, {
                        retcode: parseInt(res.retcode),
                        message: res.message,
                    });
                }
            })
            .catch(err => {
                bot.logger.error(err);
            });
    } else {
        bot.logger.info("用户 " + uid + " 在一小时内进行过查询操作，将返回上次数据");
        let userInfo = get('info', 'user', {uid});
        if (userInfo.retcode !== 0) {
            bot.sendGroupMsg(groupID, "米游社接口报错: " + userInfo.message).then();
        } else {
            generateImage(uid, groupID);
        }
    }
}