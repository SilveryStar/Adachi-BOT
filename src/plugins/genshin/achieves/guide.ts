import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../../modules/message";
import { getRealName, NameResult } from "../utils/name";

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const name: string = message.raw_message;
	const result: NameResult = getRealName( name );
	
	if ( result.definite ) {
		await sendMessage( `[CQ:image,file=https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/guide/${ result.info }.png]` );
	} else if ( result.info === "" ) {
		await sendMessage( `暂无关于「${ name }」的信息，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈` );
	} else {
		await sendMessage( `未找到相关信息，是否要找：${ [ "", ...result.info as string[] ].join( "\n  - " ) }` );
	}
}

export { main }