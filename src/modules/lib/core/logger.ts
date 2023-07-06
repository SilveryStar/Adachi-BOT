import { Configuration, addLayout, configure, Logger, getLogger } from "log4js";
import { parseZone } from "moment";

function getTimeString( date: Date ): string {
	return parseZone( date ).local().format( "HH:mm:ss.SSS" );
}

export default class CoreLogger {
	private deviceName: string;
	
	constructor(
		private uin: number = 0,
		private logLevel: string,
		tcpLoggerPort: number,
		tcpEnable: boolean
	) {
		this.deviceName = uin ? `[${ uin }]` : "[adachi]";
		this.setNetworkLayout();
		const cfg = this.getConfiguration( tcpEnable, tcpLoggerPort );
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
	
	private getConfiguration( tcpEnable: boolean, tcpLoggerPort: number ): Configuration {
		const appConsole = { type: "console" };
		const appNetwork = {
			type: "tcp",
			port: tcpLoggerPort,
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
			appenders: [ "logFile", tcpEnable ? "network" : "console" ],
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