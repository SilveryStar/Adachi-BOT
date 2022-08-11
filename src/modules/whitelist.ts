import { RefreshCatch } from "@modules/management/refresh";
import FileManagement from "@modules/file";

export class WhiteList {
	private userList: number[];
	private groupList: number[];
	
	constructor( file: FileManagement ) {
		const path = file.getFilePath( "whitelist.yml" );
		const isExist = file.isExist( path );
		if ( !isExist ) {
			this.createConfig( file );
		}
		const data = file.loadYAML( "whitelist" );
		this.userList = data.user.filter( w => typeof w === "number" );
		this.groupList = data.group.filter( w => typeof w === "number" );
	}
	
	/* 创建配置文件 */
	private createConfig( file: FileManagement ) {
		file.createYAML(
			"whitelist",
			{
				tips: "此文件仅在setting.yml中开启useWhitelist时有效，不填写号码时默认不限制使用",
				user: [ "（用户QQ）" ],
				group: [ "（群号）" ]
			}
		)
	}
	
	/* 用户白名单校验 */
	public userValid( userId: number ): boolean {
		/* 列表内无账号，不限制使用 */
		if ( this.userList.length === 0 ) {
			return true;
		}
		return this.userList.includes( userId );
	}
	
	/* 群组白名单校验 */
	public groupValid( groupId: number, userId: number ): boolean {
		if ( !this.userValid( userId ) ) {
			return false;
		}
		/* 列表内无账号，不限制使用 */
		if ( this.groupList.length === 0 ) {
			return true;
		}
		return this.groupList.includes( groupId );
	}
	
	public async refresh( config ): Promise<string> {
		try {
			this.userList = config.user.filter( w => typeof w === "number" );
			this.groupList = config.group.filter( w => typeof w === "number" );
			return "whitelist 重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: "whitelist 重新加载失败，请前往控制台查看日志"
			};
		}
	}
}