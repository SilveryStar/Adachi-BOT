import { InputParameter, Order } from "@modules/command";
import { Private } from "#genshin/module/private/main";
import { MysQueryService } from "#genshin/module/private/mys";
import { RenderResult } from "@modules/renderer";
import { mysInfoPromise } from "#genshin/utils/promise";
import { getPrivateAccount } from "#genshin/utils/private";
import { characterID, config, renderer } from "#genshin/init";
import bot from "ROOT";

export async function main(
	{ sendMessage, messageData, auth, logger }: InputParameter
): Promise<void> {
	const { user_id: userID, raw_message: idMsg } = messageData;
	const info: Private | string = await getPrivateAccount( userID, idMsg, auth );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	const { cookie, mysID } = info.setting;
	try {
		await mysInfoPromise( userID, mysID, cookie );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	
	const appointId = info.options[MysQueryService.FixedField].appoint;
	let appointName: string = "empty";
	
	if ( appointId !== "empty" ) {
		for ( const name in characterID.map ) {
			const mapId = characterID.map[name];
			if ( mapId === parseInt( appointId ) ) {
				appointName = name;
				break;
			}
		}
	}
	
	const res: RenderResult = await renderer.asSegment(
		"/card.html", {
			qq: userID,
			style: config.cardWeaponStyle,
			profile: config.cardProfile,
			appoint: appointName
		} );
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		const CALL = <Order>bot.command.getSingle( "adachi.call", await auth.get( userID ) );
		const appendMsg = CALL ? `私聊使用 ${ CALL.getHeaders()[0] } ` : "";
		await sendMessage( `图片渲染异常，请${ appendMsg }联系持有者进行反馈` );
	}
}