const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

exports.loadPlugins = () => {
    let plugins = {};
    const pluginsPath = fs.readdirSync(path.resolve(__dirname, '..', 'plugins'));

    for (let plugin of pluginsPath) {
        plugins[plugin] = require("../plugins/" + plugin + "/index.js");
        bot.logger.info("插件 " + plugin + " 加载完成");
    }

    return plugins;
}

exports.processed = ( qqData, plugins ) => {
    if (qqData.message[0].type === 'text') {
        const command = getCommand(qqData.raw_message);
        if (command){
            plugins[command](qqData);
        }
    }
}

const getCommand = msgData => {
    const commandConfig = yaml.load(fs.readFileSync("./config/command.yml", "utf-8"));

    for (let command in commandConfig) {
        if (commandConfig.hasOwnProperty(command)){
            for (let setting of commandConfig[command]) {
                let reg = new RegExp(setting);
                if (reg.test(msgData)) {
                    return command;
                }
            }
        }
    }

    return null;
}