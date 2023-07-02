import { defineDirective } from "@/modules/command";
import { Private } from "#/genshin/module/private/main";
import { MysQueryService } from "#/genshin/module/private/mys";
import { RenderResult } from "@/modules/renderer";
import { mysInfoPromise } from "#/genshin/utils/promise";
import { getPrivateAccount } from "#/genshin/utils/private";
import { characterMap, config, renderer } from "#/genshin/init";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult, auth, logger } ) => {
	const { user_id: userID } = messageData;
	const idMsg = matchResult.match[0];
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
		for ( const id in characterMap.map ) {
			const { id: mapId, name } = characterMap.map[id];
			if ( mapId === parseInt( appointId ) ) {
				appointName = name;
				break;
			}
		}
	}
	
	const res: RenderResult = await renderer.asSegment(
		"/card", {
			qq: userID,
			style: config.cardWeaponStyle,
			profile: config.cardProfile,
			appoint: appointName
		} );
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		throw new Error( res.error );
	}
} );