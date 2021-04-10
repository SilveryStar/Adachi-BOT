const requests = require('./requests.js');
const randomString = require('./rand.js');
const md5 = require('md5');
const yaml = require('js-yaml');
const fs = require("fs");

const __API = {
    FETCH_ROLE_ID: 'https://api-takumi.mihoyo.com/game_record/card/wapi/getGameRecordCard',
    FETCH_ROLE_INDEX: 'https://api-takumi.mihoyo.com/game_record/genshin/api/index',
    FETCH_ROLE_CHARACTERS: 'https://api-takumi.mihoyo.com/game_record/genshin/api/character',
    FETCH_GACHA_LIST: 'https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/gacha/list.json',
    FETCH_GACHA_DETAIL: 'https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/$/zh-cn.json'
};

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.4.0',
    'Referer': 'https://webstatic.mihoyo.com/',
    'x-rpc-app_version': '2.3.0',
    'x-rpc-client_type': 5,
    'DS': '',
    'Cookie': ''
}

const getDS = () => {
    let n = 'h8w582wxwgqvahcdkpvdhbh2w9casgfl',
        i = Date.now() / 1000 | 0,
        r = randomString(6),
        c = md5(`salt=${n}&t=${i}&r=${r}`);
    return `${i},${r},${c}`
}

const index = 0;
const cookies = yaml.load(fs.readFileSync("./config/cookies.yml", "utf-8"))["cookies"];

exports.getBase = (uid) => {
    return new Promise((resolve, reject) => {
        requests({
            method: "GET",
            url: __API.FETCH_ROLE_ID,
            qs: {uid},
            headers: {
                ...HEADERS,
                'DS': getDS(),
                'Cookie': cookies[index],
            }
        })
            .then(res => {
                resolve(JSON.parse(res));
            })
            .catch(err => {
               reject(err);
            });
    });
}

exports.getDetail = (role_id, server) => {
    return new Promise((resolve, reject) => {
        requests({
            method: "GET",
            url: __API.FETCH_ROLE_INDEX,
            qs: {
                server,
                role_id
            },
            headers: {
                ...HEADERS,
                'DS': getDS(),
                'Cookie': cookies[index]
            }
        })
            .then(res => {
                resolve(JSON.parse(res));
            })
            .catch(err => {
                reject(err);
            });
    });
}

exports.getCharacters = (role_id, server, character_ids) => {
    return new Promise((resolve, reject) => {
        requests({
            method: 'POST',
            url: __API.FETCH_ROLE_CHARACTERS,
            json: true,
            body: {
                character_ids,
                server,
                role_id
            },
            headers: {
                ...HEADERS,
                'DS': getDS(),
                'Cookie': cookies[index],
                "content-type": "application/json"
            }
        })
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
}

exports.getGachaList = () => {
    return new Promise((resolve, reject) => {
        requests({
            method: 'GET',
            url: __API.FETCH_GACHA_LIST,
        })
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
}

exports.getGachaDetail = (gacha_id) => {
    return new Promise((resolve, reject) => {
        requests({
            method: 'GET',
            url: (__API.FETCH_GACHA_DETAIL.replace('$', gacha_id)),
        })
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
}
