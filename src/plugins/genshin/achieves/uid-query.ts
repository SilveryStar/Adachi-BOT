import Database from "@modules/database";
import { InputParameter, Order } from "@modules/command";
import { RenderResult } from "@modules/renderer";
import { characterInfoPromise, detailInfoPromise } from "../utils/promise";
import { getRegion } from "../utils/region";
import { config, renderer } from "#genshin/init";
import bot from "ROOT";

interface UIDResult {
	info: number | string;
	stranger: boolean;
}

function isAt( message: string ): string | undefined {
	const res: RegExpExecArray | null = /\[CQ:at,type=at,qq=(?<id>\d+)/i.exec( message );
	return res?.groups?.id;
}

async function getUID(
	data: string, userID: number, redis: Database, atID?: string
): Promise<UIDResult> {
	if ( data === "" ) {
		const uid: string = await redis.getString( `silvery-star.user-bind-uid-${ userID }` );
		const info = uid.length === 0 ? "您还未绑定游戏UID" : parseInt( uid );
		return { info, stranger: false };
	} else if ( atID ) {
		const uid: string = await redis.getString( `silvery-star.user-bind-uid-${ atID }` );
		const info = uid.length === 0 ? `用户 ${ atID } 未绑定游戏UID` : parseInt( uid );
		return { info, stranger: false };
	} else {
		return { info: parseInt( data ), stranger: true };
	}
}

export async function main(
	{ sendMessage, messageData, redis, logger, client, auth }: InputParameter
): Promise<void> {
	const data: string = messageData.raw_message;
	const atID: string | undefined = isAt( data );
	const userID: number = messageData.user_id;
	
	const { info, stranger } = await getUID( data, userID, redis, atID );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}
	
	const uid: number = info;
	const server: string = getRegion( uid.toString()[0] );
	const target: number = atID ? parseInt( atID ) : userID;
	
	try {
		await redis.setHash( `silvery-star.card-data-${ uid }`, { uid } );
		await redis.setString( `silvery-star.user-querying-id-${ target }`, uid );
		
		const charIDs = <number[]>await detailInfoPromise( target, server );
		await characterInfoPromise( target, server, charIDs );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}
	
	const res: RenderResult = await renderer.asSegment(
		"/user-base.html", {
			qq: target, stranger,
			style: config.cardWeaponStyle,
			profile: config.cardProfile
		}
	);
	
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		logger.error( res.error );
		const CALL = <Order>bot.command.getSingle( "adachi.call", await auth.get( userID ) );
		const appendMsg = CALL ? `私聊使用 ${ CALL.getHeaders()[0] } ` : "";
		await sendMessage( `图片渲染异常，请${ appendMsg }联系持有者进行反馈` );
	}
}