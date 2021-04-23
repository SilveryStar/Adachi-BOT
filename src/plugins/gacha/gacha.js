const { get, update } = require('../../utils/database');

const getRandomInt = (max = 10000) => {
    return Math.floor(Math.random() * max) + 1;
};

const getChoiceData = async ( userID, choice ) => {
    const { indefinite, character, weapon } = await get('gacha', 'user', { userID });
    switch (choice) {
        case 200: return { name: 'indefinite', ...indefinite };
        case 301: return { name: 'character' , ...character };
        case 302: return { name: 'weapon'    , ...weapon };
    }
};

let name, five, four, isUp;

// 数据参考: https://www.bilibili.com/read/cv10468091
// 更新时间: 2021年4月21日23:17:26, 不保证概率更新的及时性
const getFiveProb = ( counter, choice ) => {
    if (choice === 200 || counter === 301) {
        return 60 + 600 * (counter > 73 ? counter - 73 : 0);
    } else {
        if (counter <= 73) {
            return 70 + 700 * (counter > 62 ? counter - 62 : 0);
        } else {
            return 7770 + 350 * (counter - 73);
        }
    }
};

const getFourProb = ( counter, choice ) => {
    if (choice === 200 || counter === 301) {
        return 510 + 5100 * (counter > 8 ? counter - 8 : 0);
    } else {
        if (counter <= 8) {
            return 600 + 6000 * (counter === 8);
        } else {
            return 6600 + 3000 * (counter - 8);
        }
    }
};

const updateCounter = async ( userID, star, up ) => {
    if (star !== 5) {
        five = five + 1;
        four = star === 4 ? 1 : four + 1;
    } else if (isUp !== undefined && isUp !== null) {
        five = 1;
        four = four + 1;
        isUp = up ? ( isUp > 0 ? isUp + 1 : 1 )
                  : ( isUp > 0 ? -1 : isUp - 1 );
    } else {
        five = 1;
        four = four + 1;
    }
};

const getIsUp = async ( userID, star ) => {
    switch (isUp) {
        case null:      return getRandomInt() <= 7500;
        case undefined: return false;
        default:        return getRandomInt() <= 5000 || (star === 5 && isUp < 0);
    }
};

const getStar = async ( userID, choice ) => {
    const value = getRandomInt();
    const fiveProb  = getFiveProb(five, choice);
    const fourProb  = getFourProb(four, choice) + fiveProb;

    switch (true) {
        case value <= fiveProb: return 5;
        case value <= fourProb: return 4;
        default:                return 3;
    }
};

const gachaOnce = async ( userID, choice, table ) => {
    const star  = await getStar(userID, choice);
    const up    = await getIsUp(userID, star, choice);
    const times = five;
    await updateCounter(userID, star, up, choice);

    let result;

    if (star === 5) {
        if (up) {
            const index = getRandomInt(table['upFiveStar'].length) - 1;
            result = table['upFiveStar'][index];
        } else {
            const index = getRandomInt(table['nonUpFiveStar'].length) - 1;
            result = table['nonUpFiveStar'][index];
        }
        return { ...result, star: 5, times };
    } else if (star === 4) {
        if (up) {
            const index = getRandomInt(table['upFourStar'].length) - 1;
            result = table['upFourStar'][index];
        } else {
            const index = getRandomInt(table['nonUpFourStar'].length) - 1;
            result = table['nonUpFourStar'][index];
        }
        return  { ...result, star: 4 };
    } else {
        const index = getRandomInt(table['threeStar'].length) - 1;
        result = table['threeStar'][index];
        return { ...result, star: 3 };
    }

};

const gachaTenTimes = async ( userID, nickname ) => {
    const { choice } = await get('gacha', 'user', { userID });
    const gachaTable = await get('gacha', 'data', { gacha_type: choice });
    ( { name, five, four, isUp } = await getChoiceData(userID, choice) );

    let result = { data: [], type: name, user: nickname }, data = {};

    for (let i = 1; i <= 10; ++i) {
        let res = await gachaOnce(userID, choice, gachaTable);
        result.data.push(res);
    }

    data[name] = { five, four, isUp };
    await update('gacha', 'user', { userID }, data);

    return result;
};

module.exports = async ( userID, nickname ) => {
    return await gachaTenTimes(userID, nickname);
}