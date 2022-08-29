export function randomString( length: number ): string {
	const characterSet: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const characterLen: number = characterSet.length;
	let result: string = "";
	
	for ( let i = 0; i < length; i++ ) {
		const randNum: number = Math.floor( Math.random() * characterLen );
		result += characterSet.charAt( randNum );
	}
	
	return result;
}

export function randomInt( min: number, max: number ): number {
	const range: number = max - min + 1;
	return min + Math.floor( Math.random() * range );
}

export async function randomSleep( min: number, max: number, second: boolean = false ): Promise<void> {
	if ( second ) {
		min = min * 1000;
		max = max * 1000;
	}
	const randomTime = randomInt( min, max );
	await sleep( randomTime );
}

function sleep( time: number ) {
	return new Promise( resolve => {
		setTimeout( resolve, time )
	} )
}