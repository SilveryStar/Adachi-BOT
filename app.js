const { createClient } = require("oicq");
const { loadPlugins, processed } = require("./src/utils/load");
const { newServer } = require('./src/utils/server');
const { gachaUpdate } = require('./src/utils/update')
const schedule = require('node-schedule');
const yaml = require('js-yaml');
const fs = require("fs");

const Setting = yaml.load(fs.readFileSync("./config/setting.yml", "utf-8"));

let BOT = createClient(Setting['account'].qq, {
    log_level: "debug"
});

BOT.sendMessage = async ( id, msg, type ) => {
    if (type === 'group') {
        await BOT.sendGroupMsg(id, msg);
    } else if (type === 'private') {
        await BOT.sendPrivateMsg(id, msg);
    }
};

BOT.sendMaster = async ( id, msg, type ) => {
    if (typeof Setting['master'] === 'number') {
        await BOT.sendPrivateMsg(Setting['master'], msg);
    } else {
        await BOT.sendMessage(id, '该 bot 未设置主人', type);
    }
}

global.bot = BOT;
global.master = Setting['master'];

const run = async () => {
    // 处理登录滑动验证码
    bot.on("system.login.slider", () => {
        process.stdin.once("data", (input) => {
            bot.sliderLogin(input.toString());
        });
    });

    // 处理登录图片验证码
    bot.on("system.login.captcha", () => {
        process.stdin.once("data", (input) => {
            bot.captchaLogin(input.toString());
        });
    });

    // 处理设备锁事件
    bot.on("system.login.device", () => {
        bot.logger.info("手机扫码完成后按下 Enter 继续...");
        process.stdin.once("data", () => {
            bot.login();
        });
    });

    bot.login(Setting['account'].password);
}

run().then(() => {
    gachaUpdate();
    newServer(9934);
    const plugins = loadPlugins();

    schedule.scheduleJob('0 0 4 * * *', () => {
        gachaUpdate();
    });

    bot.on("message.group", msgData => {
        processed(msgData, plugins, 'group');
    });

    bot.on("message.private", msgData => {
        processed(msgData, plugins, 'private');
    });
});