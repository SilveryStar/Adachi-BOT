import { Status } from "@/modules/lib/types/common";

/** 版本信息 */
export interface GoCqVersionInfo {
	/** 应用标识 */
	app_name: "go-cqhttp";
	/** 应用版本 */
	app_version: string;
	/** 应用完整名称 */
	app_full_name: string;
	/** 默认 6 */
	protocol_name: number;
	/** OneBot 标准版本 */
	protocol_version: "v11";
	/** 原Coolq版本 */
	coolq_edition: "pro";
	coolq_directory: string;
	/** 是否为go-cqhttp */
	"go-cqhttp": true;
	plugin_version: "4.15.0";
	plugin_build_number: 99;
	plugin_build_configuration: "release";
	runtime_version: string;
	runtime_os: string;
	/** 应用版本 */
	version: string;
}

/** 状态 */
export interface GoCqStatus extends Status {
	/** 同 online */
	good: boolean;
}

/** 下载文件到缓存目录 */
export interface GoCqDownloadFile {
	/** 下载文件的绝对路径 */
	file: string;
}

/** 检查链接安全性 */
export interface CheckUrlSafely {
	/** 安全等级, 1: 安全 2: 未知 3: 危险 */
	level: 1 | 2 | 3;
}

/** 获取中文分词 ( 隐藏 API ) */
export interface WordSlices {
	/** 词组 */
	slices: string[];
}