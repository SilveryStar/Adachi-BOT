import { defineDirective } from "@/modules/command";
import PluginManager from "@/modules/plugin";
import RenderServer from "@/modules/server";
import { isEqualObject } from "@/utils/object";

export default defineDirective( "order", async ( { matchResult, sendMessage } ) => {
	const pluginInstance = PluginManager.getInstance();
	const serverInstance = RenderServer.getInstance();
	
	const inputPluginName = matchResult.match[0];
	
	if ( inputPluginName ) {
		// 重载单个插件
		// todo: 临时仅处理单个匹配项
		const pluginInfo = pluginInstance.getPluginInfoByAlias( inputPluginName )[0];
		if ( !pluginInfo ) {
			await sendMessage( `未找到名称或别名为 ${ inputPluginName } 的插件，请检查输入名称是否正确。` );
			return;
		}
		const { key: pluginKey, name: pluginName } = pluginInfo;
		
		try {
			await pluginInstance.reloadSingle( pluginKey );
			await sendMessage( `插件 ${ pluginName } 重载完成` );
		} catch( error ) {
			await sendMessage( `插件 ${ pluginKey } 重载异常: ${ ( <Error>error ).message }` );
		}
	} else {
		await pluginInstance.reload();
		await serverInstance.reloadPluginRouters( pluginInstance.pluginList );
		await sendMessage( `所有插件重载完成` );
	}
} );