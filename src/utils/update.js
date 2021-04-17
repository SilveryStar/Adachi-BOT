const { getGachaList, getGachaDetail } = require('./api')
const { update, push, isInside } = require('./database');
const lodash = require('lodash');

const parseData = data => {
    let detail = {
        gacha_type:     parseInt(data.gacha_type),
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
    const gachaInfo  = (await getGachaList()).data.list[1];
    const detail     = parseData(await getGachaDetail(gachaInfo['gacha_id']));
    const gacha_type = gachaInfo['gacha_type'];

    if (await isInside('gacha', 'data', 'gacha_type', gacha_type)) {
        await update('gacha', 'data', { gacha_type }, detail);
    } else {
        await push('gacha', 'data', detail);
    }
}