import { addLayout, Configuration, configure, DateFileAppender } from "log4js";
import { parseZone } from "moment";
import * as util from "util";

function getTimeString( date: Date ): string {
	return parseZone( date ).local().format( "HH:mm:ss.SSS" );
}

export default class CoreLogger {
	private readonly deviceName: string;

	constructor(
		private uin: number = 0,
		private logLevel: string,
		tcpLoggerPort: number,
		tcpEnable: boolean
	) {
		this.deviceName = this.uin ? `[${ this.uin }]` : "[adachi]";
		this.setNetworkLayout();
		const cfg = this.getConfiguration( tcpEnable, tcpLoggerPort );
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

	private getConfiguration( tcpEnable: boolean, tcpLoggerPort: number ): Configuration {
		const appConsole = { type: "stdout" };
		const appNetwork = {
			type: "tcp",
			port: tcpLoggerPort,
			endMsg: "__ADACHI__",
			layout: { type: "JSON" }
		};
		
		const logFile: DateFileAppender = {
			type: "dateFile",
			filename: "logs/bot",
			pattern: "yyyy-MM-dd.log",
			alwaysIncludePattern: true,
			layout: { type: "JSON" },
			numBackups: 0
		};
		
		const Default = { appenders: [ "console" ], level: this.logLevel };
		const device_appenders = [ "logFile", "console" ];
		tcpEnable && device_appenders.push( "network" );
		const Device = {
			appenders: device_appenders,
			level: this.logLevel
		};
		
		return <Configuration>{
			appenders: { console: appConsole, network: appNetwork, logFile },
			categories: {
				default: Default,
				"[progress]": {
					appenders: [ "network" ],
					level: this.logLevel
				},
				[this.deviceName]: Device
			},
			pm2: true,
			disableClustering: true
		};
	}
}