import { CommonMessageEventData as Message } from "oicq";
import { MatchResult, fuzzyMatch } from "../utils/fuzzy-match";
import { getInfo } from "../utils/api";
import { render } from "../utils/render";
import { typeData } from "../init";

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
	const name: string = message.raw_message;
	const result: Array<MatchResult> = fuzzyMatch( typeData.getNameList(), name );
	
	if ( result.length === 0 ) {
		await sendMessage( `暂无关于「${ name }」的信息，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈` );
	} else if ( result.length === 1 && result[0].ratio >= 0.99 ) {
		await getInfo( name );
		const image: string = await render( "info", { name } );
		await sendMessage( image );
	} else {
		await sendMessage( `未找到相关信息，是否要找：${ [ "", result.map( el => el.content ) ].join( "\n  - " ) }` );
	}
}

export { main }