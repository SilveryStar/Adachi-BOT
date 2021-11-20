import * as cmd from "./command";
import { BasicConfig } from "./command";
import { BOT } from "@modules/bot";

declare function require( moduleName: string ): any;

export interface PluginSetting {
	pluginName: string;
	cfgList: cmd.ConfigType[];
}

export default class Plugin {
	public static async load( bot: BOT ): Promise<BasicConfig[]> {
		const registerCmd: BasicConfig[] = [];
		const plugins: string[] = bot.file.getDirFiles( "", "plugin" );
		
		/* 从 plugins 文件夹从导入 init.ts 进行插件初始化 */
		for ( let plugin of plugins ) {
			const path: string = bot.file.getFilePath( `${ plugin }/init`, "plugin" );
			const { init } = require( path );
			try {
				const { pluginName, cfgList }: PluginSetting = await init( bot );
				const commands = Plugin.parse( bot, cfgList, pluginName );
				registerCmd.push( ...commands );
				bot.logger.info( `插件 ${ pluginName } 加载完成` );
			} catch ( error ) {
				bot.logger.error( `插件加载异常: ${ error }` );
			}
		}
		
		return registerCmd;
	}
	
	private static parse(
		bot: BOT,
		cfgList: cmd.ConfigType[],
		pluginName: string
	): cmd.BasicConfig[] {
		const commands: cmd.BasicConfig[] = [];
		const data: Record<string, any> = bot.file.loadYAML( "commands" );
		
		/* 此处删除所有向后兼容代码 */
		cfgList.forEach( config => {
			/* 允许 main 传入函数 */
			if ( config.main instanceof Function ) {
				config.run = config.main;
			} else {
				const main: string = config.main || "index";
				const path: string = bot.file.getFilePath(
					pluginName + "/" + main,
					"plugin"
				);
				config.run = require( path ).main;
			}
			
			const key: string = config.cmdKey;
			const loaded = data[key];
			if ( loaded && !loaded.enable ) {
				return;
			}
			
			/* 读取 commands.yml 配置，创建指令实例  */
			try {
				let command: cmd.BasicConfig;
				switch ( config.type ) {
					case "order":
						if ( loaded ) cmd.Order.read( config, loaded );
						command = new cmd.Order( config, bot.config ); break;
					case "switch":
						if ( loaded ) cmd.Switch.read( config, loaded );
						command = new cmd.Switch( config, bot.config ); break;
					case "enquire":
						if ( loaded ) cmd.Enquire.read( config, loaded );
						command = new cmd.Enquire( config, bot.config ); break;
				}
				data[key] = command.write();
				commands.push( command );
			} catch ( error ) {
				bot.logger.error( <string>error );
			}
		} );
		
		bot.file.writeYAML( "commands", data );
		return commands;
	}
}