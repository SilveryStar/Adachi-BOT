import BotConfig from "./config";
import { Configuration, addLayout, configure } from "log4js";
import { parseZone } from "moment";

function getTimeString( date: Date ): string {
	return parseZone( date ).local().format( "HH:mm:ss.SSS" );
}

export default class WebConfiguration {
	private readonly deviceName: string;
	private readonly tcpLoggerPort: number;
	
	constructor( config: BotConfig ) {
		const platformName: string[] = [ "", "Android", "aPad", "Watch", "iMac", "iPad", "Android_8.8.88" ];
		
		this.tcpLoggerPort = config.webConsole.tcpLoggerPort;
		this.deviceName = `[${ platformName[config.platform] }:${ config.number }]`;
		this.setNetworkLayout();
		const cfg = this.getConfiguration( config.webConsole.enable, config.logLevel );
		configure( cfg );
	}
	
	private setNetworkLayout(): void {
		addLayout( "JSON", config => event => JSON.stringify( {
			category: event.categoryName,
			level: event.level.levelStr,
			color: event.level.colour,
			message: event.data[0],
			time: getTimeString( event.startTime )
		} ) );
	}
	
	private getConfiguration( enable: boolean, logLevel: BotConfig["logLevel"] ): Configuration {
		const appConsole = { type: "console" };
		const appNetwork = {
			type: "tcp",
			port: this.tcpLoggerPort,
			endMsg: "__ADACHI__",
			layout: { type: "JSON" }
		};
		const logFile = {
			type: "dateFile",
			filename: "logs/bot",
			pattern: "yyyy-MM-dd.log",
			alwaysIncludePattern: true,
			layout: { type: "JSON" }
		};
		
		const Default = { appenders: [ "console" ], level: "off" };
		const Device = {
			appenders: [ "logFile", enable ? "network" : "console" ],
			level: logLevel
		};
		
		return <Configuration>{
			appenders: { console: appConsole, network: appNetwork, logFile },
			categories: {
				default: Default,
				[this.deviceName]: Device,
				"[icqq]": Device
			},
			pm2: true,
			disableClustering: true
		};
	}
}