import { Status } from "@/modules/lib/types/common";

/** 版本信息 */
export interface OneBotVersionInfo {
	/** 应用标识 */
	app_name: string;
	/** 应用版本 */
	app_version: string;
	/** OneBot 标准版本 */
	protocol_version: string;
	/** 其他属性 */
	[P: string]: any;
}

/** 状态 */
export interface OneBotStatus extends Status {
	[P: string]: any;
}