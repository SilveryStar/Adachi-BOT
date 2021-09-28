/**
 * @interface
 * 米游社绑定数据
 * @list 通行证绑定的 miHoYo 游戏
 * */
export interface BBS {
	type: "bbs";
	list: Game[];
}

/**
 * @interface
 * 绑定游戏数据
 * @hasRole 角色是否存在
 * @gameId 游戏编号
 * @gameRoleId 游戏内 ID
 * @nickname 游戏内昵称
 * @region 服务器代号
 * @regionName 服务器名
 * @level 游戏等级
 * @backgroundImage 背景图
 * @isPublic 数据是否公开
 * @url 数据 API URL
 * @data 游戏数据
 * @dataSwitches 选择数据
 * */
export interface Game {
	hadRole: boolean;
	gameId: number;
	gameRoleId: string;
	nickname: string;
	region: string;
	regionName: string;
	level: number;
	backgroundImage: string;
	isPublic: boolean;
	url: string;
	data: Data[];
	dataSwitches: DataSwitch[];
}

interface Data {
	name: string;
	type: number;
	value: string;
}

interface DataSwitch {
	switchId: number;
	isPublic: boolean;
	switchName: string;
}