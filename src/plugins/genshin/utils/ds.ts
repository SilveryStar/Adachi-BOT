import { Md5 } from "md5-typescript";

function randomString( length: number ): string {
	const characterSet: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const characterLen: number = characterSet.length;
	let result: string = "";
	
	for ( let i = 0; i < length; i++ ) {
		const randNum: number = Math.floor( Math.random() * characterLen );
		result += characterSet.charAt( randNum );
	}
	
	return result;
}

function calculate() {
	const n: string = "14bmu1mz0yuljprsfgpvjh3ju2ni468r";
	const i: number = Date.now() / 1000 | 0;
	const r: string = randomString( 6 );
	const c: string = Md5.init( `salt=${ n }&t=${ i }&r=${ r }` );
	
	return `${ i },${ r },${ c }`;
}

export default calculate;