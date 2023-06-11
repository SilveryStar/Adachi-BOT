import { BotConfig } from "./config";
import { Configuration, addLayout, configure } from "log4js";
import { parseZone } from "moment";

function getTimeString( date: Date ): string {
	return parseZone( date ).local().format( "HH:mm:ss.SSS" );
}

export default class WebConfiguration {
	private deviceName: string;
	private tcpLoggerPort: number;
	
	constructor( config: BotConfig ) {
		const platformName: string[] = [ "", "Android", "aPad", "Watch", "iMac", "iPad", "Android_8.8.88" ];
		
		this.tcpLoggerPort = config.webConsole.tcpLoggerPort;
		this.deviceName = `[${ platformName[config.base.platform] }:${ config.base.number }]`;
		this.setNetworkLayout();
		const cfg = this.getConfiguration( config.webConsole.enable, config.base.logLevel );
		configure( cfg );
		config.base.on( "refresh", ( newCfg, oldCfg ) => {
			if ( newCfg.platform !== oldCfg.platform || newCfg.number !== oldCfg.number || newCfg.logLevel !== oldCfg.logLevel ) {
				this.deviceName = `[${ platformName[newCfg.platform] }:${ newCfg.number }]`;
				const cfg = this.getConfiguration( config.webConsole.enable, newCfg.logLevel );
				configure( cfg );
			}
		} );
		config.webConsole.on( "refresh", ( newCfg, oldCfg ) => {
			if ( newCfg.enable !== oldCfg.enable || newCfg.tcpLoggerPort !== oldCfg.tcpLoggerPort ) {
				this.tcpLoggerPort = newCfg.tcpLoggerPort;
				const cfg = this.getConfiguration( newCfg.enable, config.base.logLevel );
				configure( cfg );
			}
		} );
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
	
	private getConfiguration( enable: boolean, logLevel: BotConfig["base"]["logLevel"] ): Configuration {
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
				"[progress]": {
					appenders: [ "network" ],
					level: logLevel
				},
				[this.deviceName]: Device,
				"[icqq]": Device
			},
			pm2: true,
			disableClustering: true
		};
	}
}