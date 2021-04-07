const { get, push, update } = require('../../utils/database');
const yaml = require('js-yaml');
const fs = require("fs");

const wishCfg = yaml.load(fs.readFileSync("./config/wish.yml"), "utf-8");
const characterCfg = yaml.load(fs.readFileSync("./config/character.yml"), "utf-8");

const chkInfo = async (userID) => {
    const userInfo = await get('wish', 'user', { userID });
    if (userInfo === undefined) await push('wish', 'user', { userID, counterFive: 1, counterFour: 1, counterUp: 0, inventory: [] })
}

const getRandomInt = (max = 10000) => {
    return Math.floor(Math.random() * max) + 1;
}

const getProbaFive = (counterFive) => {
    if (counterFive <= 73) return 60;
    else return 60 + 600 * (counterFive - 73);
}

const getProbaFour = (counterFour) => {
    if (counterFour <= 8) return 510;
    else return 510 + 5100 * (counterFour - 8);
}

const updateCounter = async (userID, star, isUp) => {
    const userInfo = await get('wish', 'user', { userID });
    const { counterFive, counterFour, counterUp } = userInfo;

    if (star === 5) {
        if (isUp) await update('wish', 'user', { userID }, { counterUp: (counterUp > 0 ? counterUp + 1 : 1) });
        else await update('wish', 'user', { userID }, { counterUp: (counterUp > 0 ? -1 : counterUp - 1) });
        await update('wish', 'user', { userID }, { counterFive: 1 });
        await update('wish', 'user', { userID }, { counterFour: counterFour + 1 });
    } else if (star === 4) {
        await update('wish', 'user', { userID }, { counterFive: counterFive + 1 });
        await update('wish', 'user', { userID }, { counterFour: 1 });
    } else {
        await update('wish', 'user', { userID }, { counterFive: counterFive + 1 });
        await update('wish', 'user', { userID }, { counterFour: counterFour + 1 });
    }

}

const getIsUp = async (userID, star) => {
    const userInfo = await get('wish', 'user', { userID });
    const { counterUp } = userInfo;

    return (getRandomInt() <= 5000 || (star === 5 && counterUp < 0)) ? 1 : 0;
}

const getStar = async (userID) => {
    const userInfo = await get('wish', 'user', { userID });
    const { counterFive, counterFour } = userInfo;

    const luckyPoint = getRandomInt();
    const probaFive = getProbaFive(counterFive);
    const probaFour = getProbaFour(counterFour);

    if (luckyPoint <= probaFive) return 5;
    else if (luckyPoint <= probaFive + probaFour) return 4;
    else return 3;
}

const wishOnce = async (userID) => {
    await chkInfo(userID);

    const star = await getStar(userID);
    const isUp = await getIsUp(userID, star);
    const userInfo = await get('wish', 'user', { userID });
    const { counterFive } = userInfo;

    await updateCounter(userID, star, isUp);

    if (star === 5) {
        if (isUp) {
            const index = getRandomInt(wishCfg.starFive.up.length) - 1;
            let characterName = wishCfg.starFive.up[index];
            let result = {...characterCfg[characterName]};
            result.star = 5;
            result.counter = counterFive;
            return result;
        } else {
            const index = getRandomInt(wishCfg.starFive.nonUp.length) - 1;
            let characterName = wishCfg.starFive.nonUp[index];
            let result = {...characterCfg[characterName]};
            result.star = 5;
            result.counter = counterFive;
            return result;
        }
    } else if (star == 4) {
        if (isUp) {
            const index = getRandomInt(wishCfg.starFour.up.length) - 1;
            let characterName = wishCfg.starFour.up[index];
            let result = {...characterCfg[characterName]};
            result.star = 4;
            result.counter = counterFive;
            return result;
        } else {
            const index = getRandomInt(wishCfg.starFour.nonUp.length) - 1;
            let characterName = wishCfg.starFour.nonUp[index];
            let result = {...characterCfg[characterName]};
            result.star = 4;
            result.counter = counterFive;
            return result;
        }

    } else {
        let result = {name: '三星武器', imageHead: 'https://patchwiki.biligame.com/images/ys/e/e0/r009hx3olkmrtk1ykdlr5lvhc76j4iu.png'};
        result.star = 3;
        return result;
    }

}

const wishTenTimes = async (userID) => {
    let wishes = [];
    for (let i = 1; i <= 10; ++i) wishes.push(await wishOnce(userID));
    return wishes;
}

exports.wish = async (userID) => {
    let data = await wishTenTimes(userID);

    const userInfo = await get('wish', 'user', { userID });
    const { counterFive, counterUp } = userInfo;
    
    return { data, counterFive, counterUp }
}