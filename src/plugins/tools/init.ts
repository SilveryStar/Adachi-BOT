// /src/plugins/tools/init.ts
// 2021 He Yang @kernel.bin <1160386205@qq.com>

import { addPlugin } from "../../modules/plugin";
import { AuthLevel } from "../../modules/auth";

async function init(): Promise<any> {
    return addPlugin( "tools", {
        commandType: "order",
        key: "tools.help",
        docs: [ "掷骰", "[-t times] [-m maxnum]" ],
        headers: [ "dice" ],
        regexps: [ ".*" ],
        authLimit: AuthLevel.Banned,
        main: "dice",
        detail: "掷骰子：投掷一个或多个骰子。\n用法：dice [-t 次数] [-m 骰子面数]\nExamples:\n    dice -t 5 -m 20"
    } );
}

export { init }
