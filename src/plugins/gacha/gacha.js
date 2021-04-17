const { get, push, update, isInside } = require('../../utils/database');

const userInitialize = async userID => {
    if (!(await isInside('gacha', 'user', 'userID', userID))) {
        await push('gacha', 'user', {
            userID,
            counterFive : 1,
            counterFour : 1,
            counterUp   : 0
        });
    }
};

const getRandomInt = (max = 10000) => {
    return Math.floor(Math.random() * max) + 1;
};

const getFiveProb = counterFive => {
    if (counterFive <= 73){
        return 60;
    } else {
        return 60 + 600 * (counterFive - 73);
    }
};

const getFourProb = counterFour => {
    if (counterFour <= 8) {
        return 510;
    } else {
        return 510 + 5100 * (counterFour - 8);
    }
};

const updateCounter = async ( userID, star, isUp ) => {
    const { counterFive, counterFour, counterUp } = await get('gacha', 'user', { userID });

    const updateGachaData = async data => {
        await update('gacha', 'user', { userID }, data);
    };

    if (star === 5) {
        const gachaUpData = isUp ? { counterUp: counterUp > 0 ? counterUp + 1 : 1 }
                                 : { counterUp: counterUp > 0 ? -1 : counterUp - 1 };

        await updateGachaData(gachaUpData);
        await updateGachaData({ counterFive: 1 });
        await updateGachaData({ counterFour: counterFour + 1 });
    } else if (star === 4) {
        await updateGachaData({ counterFour: 1 });
        await updateGachaData({ counterFive: counterFive + 1 });
    } else {
        await updateGachaData({ counterFour: counterFour + 1 });
        await updateGachaData({ counterFive: counterFive + 1 });
    }

};

const getIsUp = async ( userID, star ) => {
    const { counterUp } = await get('gacha', 'user', { userID });

    return getRandomInt() <= 5000 || (star === 5 && counterUp < 0);
};

const getStar = async userID => {
    const { counterFive, counterFour } = await get('gacha', 'user', { userID });

    const luckyPoint = getRandomInt();
    const fiveProb  = getFiveProb(counterFive);
    const fourProb  = getFourProb(counterFour);

    if (luckyPoint <= fiveProb) {
        return 5;
    } else if (luckyPoint <= fiveProb + fourProb) {
        return 4;
    } else {
        return 3;
    }
};

const gachaOnce = async userID => {
    await userInitialize(userID);

    const star = await getStar(userID);
    const isUp = await getIsUp(userID, star);
    await updateCounter(userID, star, isUp);

    const gachaInfo = await get('gacha', 'data', { gacha_type: 301 });
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
    for (let i = 1; i <= 10; ++i) {
        result.push(await gachaOnce(userID));
    }
    return result;
};

module.exports = async userID => {
    return await gachaTenTimes(userID);
}