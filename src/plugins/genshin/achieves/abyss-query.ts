import { GroupMessageEventData, PrivateMessageEventData, FakeMessage } from "oicq";
import { sendType } from "../../../modules/message";
import { abyssInfoPromise, baseInfoPromise } from "../utils/promise";
import { getRegion } from "../utils/region";
import { render } from "../utils/render";
import { Redis, Adachi, botConfig } from "../../../bot";
import { Abyss } from "../types";

async function getBindData( id: string | null, qqID: number ): Promise<[ number, string ] | string> {
	if ( id !== null ) {
		try {
			return await baseInfoPromise( qqID, parseInt( id ) ) as [ number, string ];
		} catch ( error ) {
			return error as string;
		}
	}
	return `用户 ${ qqID } 未绑定米游社通行证`;
}

async function getUserInfo( data: string, qqID: number ): Promise<[ number, string ] | string> {
	if ( data === "" || data === "last" ) {
		const mysID: string | null = await Redis.getString( `silvery-star.user-bind-id-${ qqID }` );
		return await getBindData( mysID, qqID );
	} else if ( data.includes( "CQ:at" ) ) {
		const match = data.match( /\d+/g ) as string[];
		const atID: string = match[0];
		const mysID: string | null = await Redis.getString( `silvery-star.user-bind-id-${ atID }` );
		return await getBindData( mysID, parseInt( atID ) );
	} else {
		return [ parseInt( data ), getRegion( data[0] ) ];
	}
}

type Message = GroupMessageEventData | PrivateMessageEventData;

async function main( sendMessage: sendType, message: Message ): Promise<void> {
	const [ data, last ] = message.raw_message.split( " " );
	const qqID: number = message.user_id;
	const info: [ number, string ] | string = await getUserInfo( data, qqID );
	const period: number = last !== undefined || data === "last" ? 2 : 1;

	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}

	try {
		await abyssInfoPromise( qqID, ...info, period );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( error as string );
			return;
		}
	}

	const [ uid ]: [ number, string ] = info;
	const abyss: Abyss = JSON.parse( await Redis.getString( `silvery-star.abyss-data-${ qqID }` ) as string );
	const userInfo: string = `${ message.sender.nickname }|${ uid }`
	let imageList: string[] = [];
	
	imageList[0] = await render( "abyss", {
		floor: -1,
		info: userInfo,
		data: Buffer.from( JSON.stringify( {
			revealRank: abyss.revealRank.splice( 0, 8 ),
			defeatRank: abyss.defeatRank.splice( 0, 3 ),
			takeDamageRank: abyss.takeDamageRank.splice( 0, 3 ),
			normalSkillRank: abyss.normalSkillRank.splice( 0, 3 ),
			energySkillRank: abyss.energySkillRank.splice( 0, 3 ),
			damageRank: abyss.damageRank,
			maxFloor: abyss.maxFloor,
			totalBattleTimes: abyss.totalBattleTimes,
			totalStar: abyss.totalStar
		} ) ).toString( "base64" )
	}, "#app", false );
	
	for ( let floorData of abyss.floors ) {
		const base64: string = Buffer.from( JSON.stringify( floorData ) ).toString( "base64" );
		const floor: number = floorData.index;
		
		imageList[floor] = await render( "abyss", {
			floor,
			info: userInfo,
			data: base64
		}, "#app", false );
	}
	
	imageList = imageList.filter( el => el !== undefined );
	const content: FakeMessage[] = [];
	for ( let image of imageList ) {
		content.push( {
			user_id: botConfig.number,
			message: {
				type: "image",
				data: { file: image }
			}
		} );
	}
	
	const replyMessage = await Adachi.makeForwardMsg( content );
	if ( replyMessage.status === "ok" ) {
		await sendMessage( replyMessage.data, false );
	}
}

export { main }

