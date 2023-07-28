import bot from "ROOT";
import { isJsonString } from "@/utils/verify";
import { WebAccount } from "@/web-console/types/account";
import FileManagement from "@/modules/file";

class WebConsoleAccount {
	public dbKey = "adachi.webconsole-user";
	public rootFile = "data/root";
	private root: WebAccount | null;
	
	constructor() {
		const rootData = FileManagement.getInstance().loadYAML( this.rootFile, "root" );
		if ( rootData?.username && rootData?.password && rootData?.createTime ) {
			this.root = <WebAccount>{ ...rootData, role: "root" };
		} else {
			this.root = null;
		}
	}
	
	public hasRoot() {
		return !!this.root;
	}
	
	public createRoot( username: string, password: string ): string | undefined {
		if ( this.root ) {
			return "仅允许存在一个 root 用户";
		}
		const data: WebAccount = {
			username,
			password,
			role: "root",
			createTime: Date.now()
		}
		bot.file.writeYAML( this.rootFile, data, "root" )
		this.root = data;
	}
	
	public async getAccount( username: string ) {
		if ( username === this.root?.username ) {
			return this.root;
		}
		let accountList: WebAccount[];
		try {
			const list = await bot.redis.getList( this.dbKey );
			accountList = list
				.map( account => {
					if ( isJsonString( account ) ) {
						return JSON.parse( account );
					}
					return false;
				} )
				.filter( account => !!account );
		} catch {
			accountList = [];
		}
		const account = accountList.find( account => account.username === username );
		return account || null;
	}
	
	public async createAccount( username: string, password: string, role: WebAccount["role"] ): Promise<string | undefined> {
		if ( role === "root" ) {
			return "禁止创建 root 用户";
		}
		await bot.redis.addListElement( this.dbKey, JSON.stringify( {
			username,
			password,
			role,
			createTime: Date.now()
		} ) )
	}
}

export default new WebConsoleAccount();