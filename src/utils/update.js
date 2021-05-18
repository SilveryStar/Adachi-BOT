const { getGachaList, getGachaDetail } = require('./api')
const { set } = require('./database');
const lodash = require('lodash');

const parseData = async gachaID => {
    const data = await getGachaDetail(gachaID);

    let detail = {
        gacha_type:     parseInt(data['gacha_type']),
        upFourStar:     [],
        upFiveStar:     [],
        nonUpFourStar:  [],
        nonUpFiveStar:  [],
        threeStar:      []
    };

    data['r4_prob_list'].forEach(el => {
        let parsed = lodash.pick(el, ['item_type', 'item_name']);
        if (el['is_up'] === 0) {
            detail.nonUpFourStar.push(parsed);
        } else {
            detail.upFourStar.push(parsed);
        }
    });
    data['r5_prob_list'].forEach(el => {
        let parsed = lodash.pick(el, ['item_type', 'item_name']);
        if (el['is_up'] === 0) {
            detail.nonUpFiveStar.push(parsed);
        } else {
            detail.upFiveStar.push(parsed);
        }
    });
    data['r3_prob_list'].forEach(el => {
        let parsed = lodash.pick(el, ['item_type', 'item_name']);
        detail.threeStar.push(parsed);
    });

    return detail;
}

exports.gachaUpdate = async () => {
    const gachaInfo  = (await getGachaList()).data.list;

    if (gachaInfo[1] === undefined) {
        return;
    }
    
    const getGachaCode = gachaID => {
        const gacha = gachaInfo.filter(el => el['gacha_type'] === gachaID);
        let maxTime = 0, tmpGacha;
        for (let g of gacha) {
            let date = new Date(g['begin_time']);
            if (date.getTime() > maxTime) {
                maxTime = date.getTime();
                tmpGacha = g;
            }
        }
        return tmpGacha['gacha_id'];
    };

    const indefinite = await parseData(gachaInfo[0]['gacha_id']);
    const character  = await parseData(getGachaCode(301));
    const weapon     = await parseData(getGachaCode(302));

    await set('gacha', 'data', [ indefinite, character, weapon ]);
}