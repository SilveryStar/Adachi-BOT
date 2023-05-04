import { InputParameter } from "@/modules/command";
import { getRandomNumber } from "@/utils/common";

const MAX_TIMES = 100;
const MAX_SIDES = 32767;

export async function main( { sendMessage, messageData }: InputParameter ): Promise<void> {
	const reg = new RegExp( /(r\d+)?(d\d+)(k\d+)?/ );
	const [ times, sides, topK ] = <number[]>reg.exec( messageData.raw_message )
		?.splice( 1 )
		.map( ( el: string | undefined ) => {
			return !el ? -1 : parseInt( el.slice( 1 ) );
		} );
	const rollTimes: number = times === -1 ? 1 : times;
	
	
	switch ( true ) {
		case rollTimes === 0 || rollTimes > MAX_TIMES:
			await sendMessage( `次数应在 1 到 ${ MAX_TIMES } 之间` );
			return;
		case topK > rollTimes:
			await sendMessage( "k对应的值不能大于r" );
			return;
		case sides <= 1 || sides > MAX_SIDES:
			await sendMessage( `面数应在 2 到 ${ MAX_SIDES } 之间` );
			return;
	}
	
	const randomRes: number[] = []
	for ( let i = 0; i < rollTimes; i++ ) {
		randomRes.push( getRandomNumber( 1, sides ) );
	}
	if ( topK !== -1 ) {
		const msg: string = randomRes
			.sort( ( x, y ) => y - x )
			.slice( 0, topK )
			.join( " " );
		await sendMessage( `掷骰结果前${ topK }大为:\n${ msg }` );
		return;
	}
	await sendMessage( `掷骰结果为:\n${ randomRes.join( " " ) }` );
}