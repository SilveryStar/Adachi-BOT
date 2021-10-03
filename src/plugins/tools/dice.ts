// /src/plugins/tools/dice.ts
// 2021 He Yang @kernel.bin <1160386205@qq.com>

import { CommonMessageEventData as Message } from "oicq";
import { sendType } from "../../modules/message";

const MAX_TIMES = 100;
const MAX_FACES = 32767;

function replyTimesIncorrect() {
	return `掷骰子的次数应在 1 到 ${ MAX_TIMES } 之间`;
}

function replyFacesIncorrect() {
	return `骰子面数次数应在 1 到 ${ MAX_FACES } 之间`;
}

function replyTopNIncorrect() {
	return `最大的前 n 项显示数应在 1 到投骰子次数之间`;
}

function getRandomInt( maxNumber: number ): number {
	return Math.floor( Math.random() * maxNumber ) + 1;
}

async function main( sendMessage: sendType, message: Message, match: string[] ): Promise<void> {
	let times = 1, faces = 6, top_n = 0;
	
	/* command format should looks like `r3d6k2` */
	if ( match[0] ) {
		times = Number( match[0].substr( 1 ) );
		if ( times < 1 || times > MAX_TIMES ) {
			await sendMessage( replyTimesIncorrect() );
			return;
		}
	}
	if ( match[1] ) {
		faces = Number( match[1].substr( 1 ) );
		if ( faces < 1 || faces > MAX_FACES ) {
			await sendMessage( replyFacesIncorrect() );
			return;
		}
	}
	if ( match[2] ) {
		top_n = Number( match[2].substr( 1 ) );
		if ( top_n < 1 || top_n > times ) {
			await sendMessage( replyTopNIncorrect() );
			return;
		}
	}
	
	/* array to store the results */
	let arr: number[] = [];
	for ( let i = 0; i < times; i++ ) {
		arr.push( getRandomInt( faces ) );
	}
	if ( top_n != 0 ) {
		/* only sort the results when k is specified */
		arr.sort( ( a, b ) => b - a );
	}
	
	/* concat the result */
	let result = "投骰子";
	if ( times != 1 ) {
		result += ` ${ times } 次`;
	}
	if ( top_n != 0 ) {
		result += `前 ${ top_n } 大`;
	}
	result += "结果为：\n";
	
	let showItem = top_n == 0 ? times : top_n;
	for ( let i = 0; i < showItem; i++ ) {
		if ( i != 0 ) {
			result += " ";
		}
		result += arr[i];
	}
	
	/* send the result */
	await sendMessage( result );
	return;
}

export { main }