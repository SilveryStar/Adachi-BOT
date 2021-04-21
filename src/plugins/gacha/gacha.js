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

const updateCounter = async ( userID, star, up, choice ) => {
    const counter = await getChoiceData(userID, choice);
    const { name, five, four, isUp } = counter;


    const updateGachaData = async ( data, newData = {}) => {
        newData[name] = data;
        await update('gacha', 'user', { userID }, newData);
    };

    if (star !== 5) {
        const data = star === 4 ? { five: five + 1, four: 1 }
                                : { five: five + 1, four: four + 1 };
        await updateGachaData({ ...data, isUp });
    } else if (isUp !== undefined && isUp !== null) {
        const data = up ? ( isUp > 0 ? isUp + 1 : 1 )
                        : ( isUp > 0 ? -1 : isUp - 1 );
        await updateGachaData({ five: 1, four: four + 1, isUp: data });
    } else {
        await updateGachaData({ five: 1, four: four + 1, isUp });
    }
};

const getIsUp = async ( userID, star, choice ) => {
    const { isUp } = await getChoiceData(userID, choice);

    if (isUp === undefined) {
        return false;
    } else {
        return getRandomInt() <= 5000 || (star === 5 && isUp < 0);
    }
};

const getStar = async ( userID, choice ) => {
    const { five, four } = await getChoiceData(userID, choice);

    const value = getRandomInt();
    const fiveProb  = getFiveProb(five, choice);
    const fourProb  = getFourProb(four, choice) + fiveProb;

    switch (true) {
        case value <= fiveProb: return 5;
        case value <= fourProb: return 4;
        default:                return 3;
    }
};

const gachaOnce = async ( userID, choice ) => {
    const star = await getStar(userID, choice);
    const isUp = await getIsUp(userID, star, choice);
    await updateCounter(userID, star, isUp, choice);

    const gachaInfo = await get('gacha', 'data', { gacha_type: choice });
    let result;

    if (star === 5) {
        if (isUp) {
            const index = getRandomInt(gachaInfo['upFiveStar'].length) - 1;
            result = gachaInfo['upFiveStar'][index];
        } else {
            const index = getRandomInt(gachaInfo['nonUpFiveStar'].length) - 1;
            result = gachaInfo['nonUpFiveStar'][index];
        }
        return { ...result, star: 5 };
    } else if (star === 4) {
        if (isUp) {
            const index = getRandomInt(gachaInfo['upFourStar'].length) - 1;
            result = gachaInfo['upFourStar'][index];
        } else {
            const index = getRandomInt(gachaInfo['nonUpFourStar'].length) - 1;
            result = gachaInfo['nonUpFourStar'][index];
        }
        return  { ...result, star: 4 };
    } else {
        const index = getRandomInt(gachaInfo['threeStar'].length) - 1;
        result = gachaInfo['threeStar'][index];
        return { ...result, star: 3 };
    }

};

const gachaTenTimes = async userID => {
    let result = [];
    const { choice } = await get('gacha', 'user', { userID });

    for (let i = 1; i <= 10; ++i) {
        result.push(await gachaOnce(userID, choice));
    }
    return result;
};

module.exports = async userID => {
    return await gachaTenTimes(userID);
}