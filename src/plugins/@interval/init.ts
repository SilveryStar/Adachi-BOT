import { addPlugin } from "../../modules/plugin";
import { AuthLevel } from "../../modules/auth";

async function init(): Promise<any> {
	return addPlugin( "@interval", {
		commandType: "switch",
		mode: "single",
		key: "adachi.interval",
		docs: [ "操作冷却", "${OPT} [群号|QQ号] [时间]" ],
		header: "int",
		regexp: [ "${OPT}", "[0-9]+", "[0-9]+" ],
		onKeyword: "-g",
		offKeyword: "-u",
		authLimit: AuthLevel.Manager,
		detail: "该命令用于设置群聊/私聊的指令操作触发间隔，时间的单位为毫秒\n" +
				"1秒=1000毫秒，不支持设置小数"
	} );
}

export { init }