import { defineDirective } from "@/modules/command";

export default defineDirective( "order", async ( { sendMessage, refresh } ) => {
	await sendMessage( "开始重新加载配置文件，暂停处理指令..." );
	const resp: string[] = await refresh.do();
	await sendMessage( [ "配置文件重新加载完毕", ...resp ].join( "\n" ) );
} );