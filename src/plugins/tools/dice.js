const getRandomInt = max => {
    return Math.floor(Math.random() * max) + 1;
};

module.exports = ( msg, id ) => {
    let cmd = msg.match(/[0-9]+/g);

    if (cmd.length === 1) {
        let max = parseInt(cmd[0]);
        let res = max === 0 || (max > 1 << 15) ? '骰子面数应为不超过 32767 的正整数'
                                               : '骰子的结果为: ' + getRandomInt(max);
        bot.sendGroupMsg(id, res).then();
    } else if (cmd.length === 2) {
        let times = parseInt(cmd[0]);
        let max = parseInt(cmd[1]), res;

        if (times === 0 || times > 100) {
            res = '掷骰子的次数应为不超过 100 的正整数';
        } else if (max === 0 || (max > 1 << 15)) {
            res = '骰子面数应为不超过 32767 的正整数';
        } else {
            res = times + ' 次掷骰子的结果分别为: ';
            for (let i = 1; i <= times; i++) {
                res += getRandomInt(max) + ' ';
            }
        }

        bot.sendGroupMsg(id, res).then();
    }
}