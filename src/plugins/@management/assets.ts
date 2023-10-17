import { defineDirective } from "@/modules/command";
import PluginManager, { PluginInfo } from "@/modules/plugin";
import AssetsUpdate from "@/modules/management/assets";

export default defineDirective( "order", async ( { matchResult, sendMessage } ) => {
	const pluginInstance = PluginManager.getInstance();
	const assetsInstance = AssetsUpdate.getInstance();
	
	const updatePluginAssets = async ( pluginInfo: PluginInfo, single: boolean ) => {
		const { key: pluginKey, name: pluginName, assets } = pluginInfo;
		if ( !assets ) {
			if ( single ) {
				await sendMessage( `插件 ${ pluginName } 未配置更新静态资源服务` );
			}
			return false;
		}
		
		let status = true;
		
		await assetsInstance.registerCheckUpdateJob( pluginKey, undefined, pluginName, assets, {
			async noUpdated() {
				if ( single ) {
					await sendMessage( `未检测到 ${ pluginName } 可更新静态资源` );
				}
				status = false;
			},
			async updateError( errorMsg ) {
				await sendMessage( errorMsg.message );
				status = false;
			},
			async startUpdate() {
				await sendMessage( `检测到 ${ pluginName } 存在可更新静态资源，请稍后...` );
			}
		} );
		
		if ( status ) {
			await sendMessage( `插件 ${ pluginName } 静态资源更新完成` );
		}
		
		return status;
	}
	
	const inputPluginName = matchResult.match[0];
	
	if ( inputPluginName ) {
		// 重载单个插件
		// todo: 临时仅处理单个匹配项
		const pluginInfo = pluginInstance.getPluginInfoByAlias( inputPluginName )[0];
		if ( !pluginInfo ) {
			await sendMessage( `未找到名称或别名为 ${ inputPluginName } 的插件，请检查输入名称是否正确。` );
			return;
		}
		await updatePluginAssets( pluginInfo, true );
	} else {
		const pluginList = Object.values( pluginInstance.pluginList ).sort( ( prev, next ) => {
			return prev.sortIndex - next.sortIndex;
		} );
		let updateStatus = false;
		for ( const pluginInfo of pluginList ) {
			const status = await updatePluginAssets( pluginInfo, false );
			if ( status ) {
				updateStatus = status;
			}
		}
		await sendMessage( updateStatus ? "插件静态资源更新完成" : "未检测到可更新静态资源" );
	}
} );