const { createClient } = require("oicq");
const { loadPlugins, processed } = require("./src/utils/load");
const { newServer } = require('./src/utils/server');
const { initDB } = require('./src/utils/database');
const yaml = require('js-yaml');

const fs = require("fs");

const Setting = yaml.load(fs.readFileSync("./config/setting.yml", "utf-8"));

global.index = 0;
global.bot = createClient(Setting["account"].qq, {
    log_level: "debug"
});

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

    bot.login(Setting["account"].password);
}

run().then(() => {
    initDB();
    newServer(9934);
    global.cookies = yaml.load(fs.readFileSync("./config/cookies.yml", "utf-8"))["cookies"];
    global.artifactCfg = yaml.load(fs.readFileSync("./config/artifacts.yml"), "utf-8");

    const plugins = loadPlugins();

    bot.on("message.group", msgData => {
        processed(msgData, plugins);
    });
});