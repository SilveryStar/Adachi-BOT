import { defineDirective } from "@/modules/command";
import Refreshable from "@/modules/management/refresh";

export default defineDirective( "order", async ( { sendMessage } ) => {
	await sendMessage( "开始重新加载配置文件，暂停处理指令..." );
	const refresh = Refreshable.getInstance();
	const resp: string[] = await refresh.do();
	await sendMessage( [ "配置文件重新加载完毕", ...resp ].join( "\n" ) );
} );