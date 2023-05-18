import { LogLevel } from "icqq";

export interface LogMessage {
	category: string;
	level: Uppercase<LogLevel>,
	color: string,
	message: any,
	time: string;
}