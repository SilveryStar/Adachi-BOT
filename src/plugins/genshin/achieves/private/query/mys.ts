import { InputParameter } from "@modules/command";
import { Private } from "#genshin/module/private/main";
import { MysQueryService } from "#genshin/module/private/mys";
import { RenderResult } from "@modules/renderer";
import { mysInfoPromise } from "#genshin/utils/promise";
import { getPrivateAccount } from "#genshin/utils/private";
import { config, renderer } from "#genshin/init";

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
	
	const res: RenderResult = await renderer.asCqCode(
		"/card.html", {
			qq: userID,
			style: config.cardWeaponStyle,
			profile: config.cardProfile,
			appoint: info.options[ MysQueryService.FixedField ].appoint
		} );
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		await sendMessage( "图片渲染异常，请联系持有者进行反馈" );
	}
}