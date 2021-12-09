import { InputParameter } from "@modules/command";
import bot from "ROOT";

export async function main( { sendMessage }: InputParameter ): Promise<void> {
	await sendMessage( "开始重新加载配置文件，暂停处理指令..." );
	const resp: string[] = await bot.refresh.do();
	await sendMessage( [ "配置文件重新加载完毕", ...resp ].join( "\n" ) );
}