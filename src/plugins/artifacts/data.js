const { isInside, push, update } = require('../../utils/database');
const yaml = require('js-yaml');
const fs = require("fs");

const randomFloat = require('random-float');
const randomInt = ( Min, Max ) => {
    let range = Max - Min + 1;
    return Min + Math.floor(Math.random() * range);
};

const artifactCfg = yaml.load(fs.readFileSync("./config/artifacts.yml"), "utf-8");
const { artifacts, fiveRarity, domains, weights, values } = artifactCfg;
const propertyName = ['生命值', '生命值', '防御力', '防御力', '元素充能效率', '元素精通', '攻击力', '攻击力', '暴击伤害', '暴击率', '物理伤害加成', '风元素伤害加成', '冰元素伤害加成', '雷元素伤害加成', '岩元素伤害加成', '水元素伤害加成', '火元素伤害加成', '治疗加成'];
const dailyFortune = 0;

const getArtifactID = ( domainID ) => {
    if (domainID === -1) {
        let num = fiveRarity.length;
        return fiveRarity[randomInt(0, num-1)];
    } else {
        let num = domains.length;
        if (domainID >= num) {
            return null;
        } else {
            return domains[domainID].product[randomInt(0,1)];
        }
    }
};

const getRandomProperty = ( arr, type ) => {
    let suffix = [];
    let sum = 0, len = arr.length;
    for (let i = 0; i < len; i++) {
        sum += arr[i];
        suffix.push(sum);
    }
    let rand = type === 0 ? randomInt(0, sum) : randomFloat(0, sum);
    for (let i = 0; i < len; i++) {
        if (rand <= suffix[i]) {
            return i;
        }
    }
};

const getSlot = () => {
    return getRandomProperty(weights[0], 0);
};

const getMainStat = ( slot ) => {
    if (slot === 0) {
        return 0;
    } else if (slot === 1) {
        return 6;
    } else {
        let float = [];
        let len = weights[slot].length;
        for (let i = 0; i < len; i++) {
            float.push(weights[slot][i] * (1 + dailyFortune));
        }
        return getRandomProperty(float, -1);
    }
};

const getSubStats = ( mainStat ) => {
    let arr = [], sub = [];

    for (let i = 0; i < 10; i++) {
        let w = weights[1][i] * randomInt(0, 1e3);
        if (i > 4) {
            w *= (1 + dailyFortune);
        }
        arr.push([i, w]);
    }
    arr.sort((x, y) => {
       return y[1] - x[1];
    });

    for (let i = 0, num = 0; i < 10 && num < 4; i++) {
        if (arr[i][0] !== mainStat) {
            sub.push({
               stat: arr[i][0],
               grade: getRandomProperty(weights[6], 0)
            });
            num++;
        }
    }

    return sub;
};

const getInit = () => {
    return getRandomProperty(weights[5], 0) ? 4 : 3;
};

const getImproves = () => {
    let improves = [];

    for (let i = 0; i < 5; i++) {
        improves.push({
            place: randomInt(0, 3),
            grade: getRandomProperty(weights[6], 0)
        });
    }

    return improves;
};

const toArray = ( property ) => {
    let res = [], num = 0;

    for (let i in property) {
        if (property.hasOwnProperty(i)) {
            let temp = {name: propertyName[i]};
            if (property[i] < 1) {
                temp.data = (property[i] * 100).toFixed(1) + '%';
            } else {
                temp.data = Math.round(property[i]).toString();
            }
            res[num++] = temp;
        }
    }

    return res;
}

const getInitial = ( num, subStats ) => {
    let property = {};

    for (let i = 0; i < num; i++) {
        let id = subStats[i].stat;
        let lv = subStats[i].grade;
        property[id] = values[lv][id];
    }

    return toArray(property);
};

const getFortified = ( num, subStats, improves ) => {
    let property = {};

    for (let i = 0; i < 4; i++) {
        let id = subStats[i].stat;
        let lv = subStats[i].grade;
        property[id] = values[lv][id];
    }
    for (let i = 0; i < num + 1; i++) {
        let p = improves[i].place;
        let id = subStats[p].stat;
        let lv = improves[i].grade;
        property[id] += values[lv][id];
    }

    return toArray(property);
};

exports.getArtifact = async ( userID, type ) => {
    let artifactID = getArtifactID(type);
    let slot = getSlot();
    let mainStat = getMainStat(slot);
    let subStats = getSubStats(mainStat);
    let initPropertyNum = getInit();
    let improves = getImproves();
    let initialProperty = getInitial(initPropertyNum, subStats);
    let fortifiedProperty = getFortified(initPropertyNum, subStats, improves);

    if (!(await isInside('artifact', 'user', 'userID', userID))) {
        await push('artifact', 'user', {
            userID,
            initial: {},
            fortified: {}
        });
    }

    let name = artifacts[artifactID]['subName'][slot];
    await update('artifact', 'user', {userID}, {
        initial: {
            mainStat,
            base: {name, artifactID, slot, level: 0},
            data: initialProperty
        },
        fortified: {
            mainStat,
            base: {name, artifactID, slot, level: 20},
            data: fortifiedProperty
        }
    });
};

exports.domainInfo = () => {
    let domainsMsg = "";
    for (let i in domains) {
        if (domains.hasOwnProperty(i)) {
            domainsMsg += domains[i].name + ': ' + i + '\n';
        }
    }

    return domainsMsg;
};