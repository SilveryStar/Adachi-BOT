import { defineDirective } from "@/modules/command";
import { Private } from "#/genshin/module/private/main";
import { SignInService } from "#/genshin/module/private/sign";
import { privateClass } from "#/genshin/init";

export default defineDirective( "order", async ( { messageData, matchResult, sendMessage } ) => {
	const userID: number = messageData.user_id;
	const serID: number = parseInt( matchResult.match[0] );
	const single: Private | string = await privateClass.getSinglePrivate( userID, serID );
	
	if ( typeof single === "string" ) {
		await sendMessage( single );
	} else {
		await ( <SignInService>single.services[SignInService.FixedField] ).toggleEnableStatus();
	}
} );