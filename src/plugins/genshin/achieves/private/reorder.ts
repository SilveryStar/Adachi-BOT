import { Private } from "#genshin/module/private/main";
import { InputParameter } from "@modules/command";
import { privateClass } from "#genshin/init";
import { trim } from "lodash";

function checkList( list: number[] ): boolean {
	const data: string = JSON.stringify( list );
	return JSON.parse( data )
		.sort( ( x, y ) => x - y )
		.reduce( ( pre, cur, i, arr ) => {
			return pre && ( i === 0 || cur - arr[i - 1] === 1 ) && arr[0] === 1;
		} , <boolean>true );
}

export async function main(
	{ sendMessage, messageData }: InputParameter
): Promise<void> {
	const userID: number = messageData.user_id;
	const list: number[] = messageData.raw_message
		.split( " " )
		.map( el => parseInt( trim( el ) ) );
	const accounts: Private[] = privateClass.getUserPrivateList( userID );

	if ( !checkList( list ) || accounts.length !== list.length ) {
		await sendMessage( "序号排序列表格式不合法" );
		return;
	}
	for ( let i = 0; i < list.length; i++ ) {
		const pos: number = list[i];
		accounts[pos - 1].updateID( i + 1 );
	}
	await sendMessage( "序号重排完成" );
}