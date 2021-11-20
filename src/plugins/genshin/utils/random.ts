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