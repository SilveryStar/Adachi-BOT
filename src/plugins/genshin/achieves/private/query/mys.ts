import { InputParameter } from "@modules/command";
import { Private } from "#genshin/module/private/main";
import { baseInfoPromise, characterInfoPromise, detailInfoPromise } from "#genshin/utils/promise";
import { render } from "#genshin/utils/render";
import { getPrivateAccount } from "#genshin/utils/private";
import { config } from "#genshin/init";

export async function main( { sendMessage, messageData, auth }: InputParameter ): Promise<void> {
	const { user_id: userID, raw_message: idMsg } = messageData;
	const info: Private | string = await getPrivateAccount( userID, idMsg, auth );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	const { cookie, mysID } = info.setting;
	try {
		const server: string = await baseInfoPromise( userID, mysID );
		const charIDs = <number[]>await detailInfoPromise( userID, server, cookie );
		await characterInfoPromise( userID, server, charIDs, cookie );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	
	const image: string = await render( "card", {
		qq: userID,
		style: config.cardWeaponStyle,
		profile: config.cardProfile,
		appoint: info.options.mysQuery.appoint
	} );
	await sendMessage( image );
}