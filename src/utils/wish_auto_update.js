const { getGachaList, getGachaDetail } = require('./api')
const { push } = require('./database');

exports.wishUpdate = async () => {
    const list = JSON.parse(await getGachaList()).data.list;
    const detail = JSON.parse(await getGachaDetail(list[1].gacha_id));
    push('wish', 'wishes', detail);
}
