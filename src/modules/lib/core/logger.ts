import { addLayout, Configuration, configure, DateFileAppender, LoggingEvent } from "log4js";
import { parseZone } from "moment";
import * as util from "util";
import { LogMessage } from "@/web-console/types/logger";
import { createChannel } from "@/utils/channel";

export const logChannel = createChannel<LogMessage>();

function getTimeString( date: Date ): string {
	return parseZone( date ).local().format( "HH:mm:ss.SSS" );
}

export default class CoreLogger {
	private readonly deviceName: string;
	
	constructor(
		private uin: number = 0,
		private logLevel: string,
		tcpEnable: boolean
	) {
		this.deviceName = this.uin ? `[${ this.uin }]` : "[adachi]";
		this.setNetworkLayout();
		const cfg = this.getConfiguration( tcpEnable );
		configure( cfg );
	}
	
	private setNetworkLayout(): void {
		addLayout( "JSON", _config => event => JSON.stringify( {
			category: event.categoryName,
			level: event.level.levelStr,
			color: event.level.colour,
			message: util.format( ...event.data ),
			time: getTimeString( event.startTime )
		} ) );
	}
	
	private getConfiguration( tcpEnable: boolean ): Configuration {
		const appConsole = { type: "stdout" };
		
		// 直接把日志事件发到进程内总线，不要以前的 tcp 了
		const appNetwork = {
			type: {
				configure: ( _config: any, layouts: any ) => {
					// 通过上面的 JSON layout，拿到 JSON 字符串内容
					const layoutFn = layouts.layout( "JSON", { type: "JSON" } );
					
					return ( ev: LoggingEvent ) => {
						try {
							logChannel.publish( JSON.parse( layoutFn( ev ) ) );
						} catch {
							logChannel.publish( { raw: layoutFn( ev ) } );
						}
					};
				}
			}
		};
		
		const logFile: DateFileAppender = {
			type: "dateFile",
			filename: "logs/bot",
			pattern: "yyyy-MM-dd.log",
			alwaysIncludePattern: true,
			layout: { type: "JSON" },
			numBackups: 30
		};
		
		const Default = { appenders: [ "console" ], level: this.logLevel };
		const device_appenders = [ "logFile", "console" ];
		tcpEnable && device_appenders.push( "network" );
		
		return <Configuration>{
			appenders: { console: appConsole, network: appNetwork, logFile },
			categories: {
				default: Default,
				"[progress]": {
					appenders: tcpEnable ? [ "network" ] : [ "console" ],
					level: this.logLevel
				},
				[this.deviceName]: {
					appenders: device_appenders,
					level: this.logLevel
				}
			},
			pm2: true,
			disableClustering: true
		};
	}
}