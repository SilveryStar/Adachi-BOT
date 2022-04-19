import bot from "ROOT";
import { MessageType } from "@modules/message";
import { InputParameter } from "@modules/command";
import { UserInfo } from "#genshin/module/private/main";
import { privateClass } from "#genshin/init";

async function removePrivate( userID: number ): Promise<string> {
	const settings: UserInfo[] = privateClass.getUserInfoList( userID );
	if ( settings.length === 0 ) {
		return "该用户还未启用任何私人服务";
	}
	
	return privateClass.delBatchPrivate( userID );
}

async function sendMessageToUser( userID: number ) {
	const sendMessage = bot.message.getSendMessageFunc( userID, MessageType.Private );
	await sendMessage( "你的私人服务已被管理员取消" );
}

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const userID: number = parseInt( messageData.raw_message );
	
	const msg: string = await removePrivate( userID );
	await sendMessageToUser( userID );
	await sendMessage( msg );
}