import { AuthLevel } from "@modules/management/auth";
import { InputParameter, SwitchMatchResult } from "@modules/command";

export async function main( { sendMessage, redis, matchResult }: InputParameter ): Promise<void> {
	const match = <SwitchMatchResult>matchResult;
	const isOn: boolean = match.isOn();
	const qqID: number = parseInt( match.match[0] );
	
	if ( isOn ) {
		await redis.setString( `adachi.auth-level-${ qqID }`, AuthLevel.Manager );
		await sendMessage( `用户 ${ qqID } 已被设置为管理员` );
	} else {
		await redis.setString( `adachi.auth-level-${ qqID }`, AuthLevel.User );
		await sendMessage( `用户 ${ qqID } 的管理员权限已取消` );
	}
}