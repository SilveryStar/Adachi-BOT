import { BOT } from "@/main";
import PluginManager from "@/modules/plugin";

/* 获取内存格式化 */
export function formatMemories( memories: number, type: "G" | "M" | "KB" | "B" ) {
	const sizeMap: Record<typeof type, number> = {
		G: 1 << 30,
		M: 1 << 20,
		KB: 1 << 10,
		B: 1
	}
	return ( memories / sizeMap[type] ).toFixed( 2 ) + type;
}

/* 生成订阅用户id列表 */
export async function formatSubUsers( bot: BOT, type: "private" | "group" ): Promise<Record<string, string[]>> {
	const userSubs: Record<string, string[]> = {};
	
	const pluginList = PluginManager.getInstance().pluginList;
	for ( const pluginKey in pluginList ) {
		const { subscribe, name: pluginName } = pluginList[pluginKey];
		if ( !subscribe ) continue;
		try {
			for ( const subItem of subscribe ) {
				const userList = await subItem.getUser( bot );
				const idList = type === "private" ? userList.person : userList.group;
				if ( !idList ) continue;
				for ( const id of idList ) {
					if ( userSubs[id] ) {
						userSubs[id].push( `${ pluginName }-${ subItem.name }` );
					} else {
						userSubs[id] = [ `${ pluginName }-${ subItem.name }` ];
					}
				}
			}
		} catch ( error ) {
			bot.logger.error( `获取插件订阅信息异常: ${ <string>error }` );
		}
	}
	
	return userSubs;
}