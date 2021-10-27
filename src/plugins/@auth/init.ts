import { addPlugin } from "../../modules/plugin";
import { AuthLevel } from "../../modules/auth";

async function init(): Promise<any> {
	return addPlugin( "@auth", {
		commandType: "order",
		key: "adachi.manager",
		docs: [ "设置管理", "[qq号]" ],
		headers: [ "manager" ],
		regexps: [ "[0-9]+" ],
		authLimit: AuthLevel.Master,
		main: "manager"
	}, {
		commandType: "order",
		key: "adachi.unmanaged",
		docs: [ "取消管理", "[qq号]" ],
		headers: [ "unmanaged" ],
		regexps: [ "[0-9]+" ],
		authLimit: AuthLevel.Master,
		main: "unmanaged"
	}, {
		commandType: "order",
		key: "adachi.ban",
		docs: [ "封禁", "[qq|群号] [-u|-g]" ],
		headers: [ "ban" ],
		regexps: [ "[0-9]+", "(-u|-g)" ],
		authLimit: AuthLevel.Manager,
		main: "ban"
	}, {
		commandType: "order",
		key: "adachi.unban",
		docs: [ "解禁", "[qq|群号] [-u|-g]" ],
		headers: [ "unban" ],
		regexps: [ "[0-9]+", "(-u|-g)" ],
		authLimit: AuthLevel.Manager,
		main: "unban"
	}, {
		commandType: "switch",
		mode: "single",
		key: "adachi.limit",
		docs: [ "命令权限", "[qq|群号] [-u|-g] [key] ${OPT}" ],
		header: "limit",
		onKeyword: "on",
		offKeyword: "off",
		regexp: [ "[0-9]+", "(-u|-g)", "[0-9a-zA-z.-]+", "${OPT}" ],
		authLimit: AuthLevel.Manager,
		main: "limit"
	} );
}

export { init }