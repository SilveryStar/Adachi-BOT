import { InputParameter } from "@modules/command";
import { UserInfo } from "#genshin/module/private";
import { privateClass } from "#genshin/init";

async function cancelPrivate( userID: number, id: number ): Promise<string> {
	const settings: UserInfo[] = privateClass.getUserInfoList( userID );
	if ( settings.length === 0 ) {
		return "你还未启用任何私人服务";
	}
	
	return privateClass.delPrivate( userID, id );
}

export async function main(
	{ sendMessage, messageData }: InputParameter
): Promise<void> {
	const id: number = parseInt( messageData.raw_message );
	const userID: number = messageData.user_id;
	const msg: string = await cancelPrivate( userID, id );
	await sendMessage( msg );
}