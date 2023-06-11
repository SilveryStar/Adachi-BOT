import { OrderConfig } from "@/modules/command";
import { definePlugin } from "@/modules/plugin";

const dice: OrderConfig = {
	type: "order",
	cmdKey: "tools.dice",
	desc: [ "掷骰", "r(次数)d[面数]k(前k大)" ],
	headers: [ "dice" ],
	regexps: [ "(r\\d+)?(d\\d+)(k\\d)?" ],
	main: "dice",
	detail: "投掷一个或多个骰子\n" +
		"用法: r(次数)d[面数]k(前n大)\n" +
		"例子: d6 r5d10 r10d6k2",
};

export default definePlugin( {
	name: "tools",
	cfgList: [ dice ]
} );