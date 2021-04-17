const { getGachaList, getGachaDetail } = require('./api')
const { update, get, push } = require('./database');

exports.wishUpdate = async () => {
    const list = JSON.parse(await getGachaList()).data.list;
    const detail = JSON.parse(await getGachaDetail(list[1].gacha_id));
    if (await get('wish', 'wishes', { gacha_type: list[1].gacha_type.toString() })) {
        update('wish', 'wishes', { gacha_type: list[1].gacha_type.toString() }, detail);
    } else {
        push('wish', 'wishes', detail);
    }
}

this.wishUpdate();