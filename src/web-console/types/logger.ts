import { LogLevel } from "@/modules/lib";

export type LogMessage = {
	category: string;
	level: Uppercase<LogLevel>,
	color: string,
	message: any,
	time: string;
} | { raw: "string" }