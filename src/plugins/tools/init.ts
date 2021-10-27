// /src/plugins/tools/init.ts
// 2021 He Yang @kernel.bin <1160386205@qq.com>

import { addPlugin } from "../../modules/plugin";
import { AuthLevel } from "../../modules/auth";

async function init(): Promise<any> {
	return addPlugin( "tools", {
		commandType: "question",
		key: "tools.dice",
		docs: [ "掷骰", "r(次数)d[面数]k(前n大)" ],
		sentences: [ "^${HEADER}(r[0-9]+)?(d[0-9]+)(k[0-9]+)?$" ],
		authLimit: AuthLevel.Banned,
		main: "dice",
		detail: "投掷一个或多个骰子\n" +
				"用法: r(次数)d[面数]k(前n大)\n" +
				"例子: d6 r5d10 r10d6k2"
	} );
}

export { init }
