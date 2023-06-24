import BotConfig from "./config";
import { addLayout, Configuration, configure, DateFileAppender } from "log4js";
import { parseZone } from "moment";
import util from "util";

function getTimeString( date: Date ): string {
	return parseZone( date ).local().format( "HH:mm:ss.SSS" );
}

export default class WebConfiguration {
	private readonly deviceName: string;
	private readonly tcpLoggerPort: number;
	
	constructor( config: BotConfig ) {
		const platformName: string[] = [ "", "Android", "aPad", "Watch", "iMac", "iPad", "Tim" ];
		
		this.tcpLoggerPort = config.webConsole.tcpLoggerPort;
		this.deviceName = `[${ platformName[config.platform] }:${ config.number }]`;
		this.setNetworkLayout();
		const cfg = this.getConfiguration( config.webConsole.enable, config.logLevel, config.logKeepDays );
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
	
	private getConfiguration( enable: boolean, logLevel: BotConfig["logLevel"], logKeepDays: number ): Configuration {
		const appConsole = { type: "stdout" };
		const appNetwork = {
			type: "tcp",
			port: this.tcpLoggerPort,
			endMsg: "__ADACHI__",
			layout: { type: "JSON" }
		};
		const logFile: DateFileAppender = {
			type: "dateFile",
			filename: "logs/bot",
			pattern: "yyyy-MM-dd.log",
			alwaysIncludePattern: true,
			layout: { type: "JSON" },
			daysToKeep: logKeepDays,
			keepFileExt: true
		};
		
		const Default = { appenders: [ "console" ], level: logLevel };
		const device_appenders = [ "logFile", "console" ];
		enable && device_appenders.push( "network" );
		const Device = {
			appenders: device_appenders,
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