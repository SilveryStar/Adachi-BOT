const { getBase, getDetail, getCharacters } = require('./api');
const { get, isInside, push, update } = require('./database');
const lodash = require('lodash');
const yaml = require('js-yaml');
const fs = require("fs");

let index = 0;
const cookies = yaml.load(fs.readFileSync("./config/cookies.yml", "utf-8"))["cookies"];

const userInitialize = async ( userID, uid, nickname, level ) => {
    if (!(await isInside('character', 'user', 'userID', userID))) {
        await push('character', 'user', {userID, uid: 0});
    }
    if (!(await isInside('time', 'user', 'uid', uid))) {
        await push('time', 'user', {uid, time: 0});
    }
    if (!(await isInside('info', 'user', 'uid', uid))) {
        let initData = {
            retcode: 19260817,
            message: "init message",
            uid, nickname, level,
            avatars: [],
            explorations: [],
            stats: {}
        };
        await push('info', 'user', initData);
    }
}

const increaseIndex = () => {
    let cookiesNum = cookies.length;
    index = index === cookiesNum - 1 ? 0 : index + 1;
}

exports.basePromise = async ( mhyID, userID ) => {
    const { retcode, message, data } = await getBase(mhyID, cookies[index]);

    return new Promise(async (resolve, reject) => {
        if (retcode !== 0) {
            reject("米游社接口报错: " + message);
            return;
        } else if (!data.list || data.list.length === 0) {
            reject("未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开");
            return;
        }

        let baseInfo = data.list.find(el => el['game_id'] === 2);
        let { game_role_id, nickname, region, level } = baseInfo;
        let uid = parseInt(game_role_id);

        await userInitialize(userID, uid, nickname, level);
        await update('info', 'user', {uid}, {level, nickname});

        resolve([uid, region]);
    });
}

exports.detailPromise = async ( uid, server, userID ) => {
    await userInitialize(userID, uid, '', -1);
    await update('character', 'user', {userID}, {uid});

    let nowTime   = new Date().valueOf();
    let { time }  = await get('time', 'user', {uid});

    if (nowTime - time < 60 * 60 * 1000) {
        bot.logger.info("用户 " + uid + " 在一小时内进行过查询操作，将返回上次数据");

        const { retcode, message } = await get('info', 'user', {uid});
        if (retcode !== 0) {
            return Promise.reject("米游社接口报错: " + message);
        }
        return Promise.reject('');
    }

    const { retcode, message, data } = await getDetail(uid, server, cookies[index]);
    increaseIndex();
console.log(index);
    return new Promise(async (resolve, reject) => {
        if (retcode !== 0) {
            await update('info', 'user', {uid}, {
                message,
                retcode: parseInt(retcode)
            });
            reject("米游社接口报错: " + message);
            return;
        }

        await update('time', 'user', {uid}, {
            time: nowTime
        });
        await update('info', 'user', {uid}, {
            message,
            retcode:        parseInt(retcode),
            explorations:   data.world_explorations,
            stats:          data.stats
        });
        bot.logger.info("用户 " + uid + " 查询成功，数据已缓存");

        let characterID = data.avatars.map(el => el['id']);
        resolve(characterID);
    });
}

exports.characterPromise = async ( uid, server, character_ids ) => {
    const { retcode, message, data } = await getCharacters(uid, server, character_ids, cookies[index]);
    increaseIndex();

    return new Promise(async (resolve, reject) => {
        if (retcode !== 0) {
            reject("米游社接口报错: " + message);
            return;
        }

        let avatars = [];
        let characterList = data.avatars;
        for (let i in characterList) {
            if (characterList.hasOwnProperty(i)) {
                let el = characterList[i];

                let base   = lodash.omit(el, ['image', 'weapon', 'reliquaries', 'constellations']);
                let weapon = lodash.omit(el.weapon, ['id', 'type', 'promote_level', 'type_name']);
                let artifact = [], constellationNum = 0;

                let constellations = el['constellations'].reverse();
                for (let level in constellations) {
                    if (constellations.hasOwnProperty(level)) {
                        if (constellations[level]['is_actived']) {
                            constellationNum = constellations[level]['pos'];
                            break;
                        }
                    }
                }
                for (let posID in el.reliquaries) {
                    if (el.reliquaries.hasOwnProperty(posID)) {
                        let posInfo = lodash.omit(el.reliquaries[posID], ['id', 'set', 'pos_name']);
                        artifact.push(posInfo);
                    }
                }

                avatars.push({...base, weapon, artifact, constellationNum});
            }
        }

        await update('info', 'user', {uid}, {avatars});
        resolve();
    });
}