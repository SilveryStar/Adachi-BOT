import { InputParameter } from "@modules/command";
import { getRealName, NameResult } from "../utils/name";
import { checkGuideExist } from "../utils/api";
import { Sendable } from "icqq";

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const name: string = messageData.raw_message;
	const result: NameResult = getRealName( name );
	
	let message: Sendable;
	
	if ( result.definite ) {
		/* 检查是否存在该攻略图 */
		const check: boolean | string = await checkGuideExist( <string>result.info );
		if ( typeof check === "boolean" ) {
			message = check
				? {
					type: "image",
					file: `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/guide/${ result.info }.png`,
					origin: true
				}
				: `未查询到关于「${ result.info }」的攻略图，请等待西风驿站上传后再次查询，或前往 github.com/SilveryStar/Adachi-BOT 进行反馈`;
		} else {
			message = "获取西风攻略图出错：" + check;
		}
	} else if ( result.info === "" ) {
		message = `暂无关于「${ name }」的信息，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈`;
	} else {
		message = `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }`;
	}
	
	await sendMessage( message );
}