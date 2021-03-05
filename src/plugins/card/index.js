const { getBase, getDetail } = require('../../utils/api');
const { get, isInside, push, update } = require('../../utils/database');
const render = require('../../utils/render');

const generateImage = ( uid, groupID ) => {
    let data = get('info', 'user', {uid});
    render(data, 'genshin-card', groupID);
}

module.exports = Message => {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let id = msg.match(/\d+/g), mhyID;

    // 处理匹配账号信息
    if (msg.includes('CQ:at')) {
        let atID = parseInt(id[0]);
        if (isInside('map', 'user', 'userID', atID)) {
            mhyID = get('map', 'user', {userID: atID}).mhyID;
        } else {
            bot.sendGroupMsg(groupID, "用户 " + atID + " 暂未绑定米游社通行证").then();
            return;
        }
    } else if (id !== null) {
        if (id.length > 1) {
            bot.sendGroupMsg(groupID, "输入通行证不合法").then();
        } else {
            mhyID = parseInt(id[0]);
        }
    } else if (isInside('map', 'user', 'userID', userID)) {
        mhyID = get('map', 'user', {userID}).mhyID;
    } else {
        bot.sendGroupMsg(groupID, "您还未绑定米游社通行证，请使用 #s + id").then();
        return;
    }

    getBase(mhyID)
        .then(res => {
            if (res.retcode !== 0) {
                bot.sendGroupMsg(groupID, "米游社接口报错: " + res.message).then();
                return;
            } else if (!res.data.list || res.data.list.length === 0) {
                bot.sendGroupMsg(groupID, "未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开，若无误，请第二天再尝试").then();
                return;
            }

            let baseInfo = res.data.list.find(el => el["game_id"] === 2);
            let { game_role_id, nickname, region, level } = baseInfo;
            let uid = parseInt(game_role_id);

            // 初始化数据
            if (!isInside('time', 'user', 'uid', uid)) {
                push('time', 'user', {uid, time: 0});
            }
            if (!isInside('info', 'user', 'uid', uid)) {
                // TODO: 增加装备查询
                let initData = {
                    retcode: 19260817,
                    message: "",
                    level,
                    nickname,
                    uid,
                    avatars: [],
                    stats: {},
                    explorations: []
                };
                push('info', 'user', initData);
            } else {
                update('info', 'user', {uid}, {
                    level,
                    nickname
                });
            }

            let nowTime = new Date().valueOf();
            let lastTime = get('time', 'user', {uid}).time;
            // 检测查询时间间隔
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
                            // TODO: cookies 管理
                            bot.sendGroupMsg(groupID, "米游社接口报错: " + res.message).then();
                            update('info', 'user', {uid}, {
                                retcode: parseInt(res.retcode),
                                message: res.message
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
        })
        .catch(err => {
            bot.logger.error(err);
        });
}