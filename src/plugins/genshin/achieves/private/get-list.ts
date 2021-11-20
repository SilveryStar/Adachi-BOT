import { InputParameter } from "@modules/command";
import { UserInfo } from "#genshin/module/private";
import { privateClass } from "#genshin/init";

async function getPrivateList( userID: number ): Promise<string> {
	const settings: UserInfo[] = privateClass.getUserInfoList( userID );
	if ( settings.length === 0 ) {
		return "你还未启用任何私人服务";
	}
	
	const str: string[] = [];
	const num: number = settings.length;
	for ( let i = 0; i < num; i++) {
		const uid: string = settings[i].uid;
		str.push( `${ i + 1 }. UID${ uid }` );
	}
	
	return "当前启用私人服务的账号：" + [ "", ...str ].join( "\n  " );
}

export async function main(
	{ sendMessage, messageData }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const msg: string = await getPrivateList( userID );
	await sendMessage( msg );
}