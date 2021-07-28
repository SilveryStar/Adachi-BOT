import { Md5 } from "md5-typescript";
import { randomString } from "./random";

function calculate() {
	const n: string = "14bmu1mz0yuljprsfgpvjh3ju2ni468r";
	const i: number = Date.now() / 1000 | 0;
	const r: string = randomString( 6 );
	const c: string = Md5.init( `salt=${ n }&t=${ i }&r=${ r }` );
	
	return `${ i },${ r },${ c }`;
}

export default calculate;