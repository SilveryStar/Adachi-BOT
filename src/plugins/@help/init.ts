import { addPlugin } from "../../modules/plugin";
import { AuthLevel } from "../../modules/auth";

async function init(): Promise<any> {
	return addPlugin( "@help", {
		commandType: "order",
		key: "adachi.help",
		docs: [ "帮助", "(-k)" ],
		headers: [ "help" ],
		regexps: [ "(-k)?" ],
		authLimit: AuthLevel.Banned,
		main: "help"
	}, {
		commandType: "order",
		key: "adachi.detail",
		docs: [ "详细", "[编号]" ],
		headers: [ "detail" ],
		regexps: [ "[0-9]+" ],
		authLimit: AuthLevel.Banned,
		main: "detail",
		display: false
	} );
}

export { init }