/** 登录号信息 */
export interface LoginInfo {
	/** QQ 号 */
	user_id: number;
	/** QQ 昵称 */
	nickname: string;
}

interface ModelVariant {
	model_show: string;
	need_pay: boolean;
}

/** 在线机型 */
export interface ModelShow {
	variants: ModelVariant[];
}

/** 客户端信息 */
interface Device {
	/** 客户端ID */
	app_id: number;
	/** 设备名称 */
	device_name: string;
	/** 设备类型 */
	device_kind: string;
}

/** 当前账号在线客户端列表 */
export interface OnlineClients {
	/** 在线客户端列表 */
	clients: Device[];
}