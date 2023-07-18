import bot from "ROOT";
import { isJsonString } from "@/utils/verify";
import { WebAccount } from "@/web-console/types/account";

export const accountDbKey = "adachi.webconsole-user";

/** 是否存在 root 用户 */
export async function hasRootAccount() {
	const accountList = await bot.redis.getList( accountDbKey );
	const accountStr = await accountList.find( account => {
		if ( isJsonString( account ) ) {
			return JSON.parse( account ).auth === "root";
		}
		return false;
	} );
	return !!accountStr;
}

/** 获取用户 */
export async function getAccount( nickname: string ): Promise<WebAccount | null> {
	const accountList = await bot.redis.getList( accountDbKey );
	const accountStr = await accountList.find( account => {
		if ( isJsonString( account ) ) {
			return JSON.parse( account ).nickname === nickname;
		}
		return false;
	} );
	if ( accountStr ) {
		return JSON.parse( accountStr );
	}
	return null;
}