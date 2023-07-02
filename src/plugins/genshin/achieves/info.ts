import { defineDirective } from "@/modules/command";
import { RenderResult } from "@/modules/renderer";
import { NameResult, getRealName } from "../utils/name";
import { renderer, typeData } from "#/genshin/init";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult } ) => {
	const [ name, skillOpt ] = matchResult.match;
	// 是否为技能详情页
	const isSkillPage = !!skillOpt;
	const result: NameResult = getRealName( name );
	
	if ( result.definite ) {
		const info = <string>result.info;
		const checked = ( list: any ) => list.includes( info );
		
		if ( !checked( Object.keys( typeData.character ) ) && isSkillPage ) {
			await sendMessage( "仅角色支持查看技能详情" );
		} else {
			const route: string = checked( typeData.artifact.suitNames ) ? "/info-artifact" : "/info";
			const res: RenderResult = await renderer.asSegment(
				route,
				{ name: result.info, skill: isSkillPage }
			);
			if ( res.code === "ok" ) {
				await sendMessage( res.data );
			} else {
				throw new Error( res.error );
			}
		}
	} else if ( result.info === "" ) {
		await sendMessage( `暂无关于「${ name }」的信息，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈` );
	} else {
		await sendMessage( `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }` );
	}
} );