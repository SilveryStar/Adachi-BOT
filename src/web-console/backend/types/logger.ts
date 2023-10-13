import { LogLevel } from "@/modules/lib";

export interface LogMessage {
	category: string;
	level: Uppercase<LogLevel>,
	color: string,
	message: any,
	time: string;
}