import BotConfig from "@/modules/config";
import Database from "@/modules/database";

export enum AuthLevel {
	Banned,
	User,
	Manager,
	Master
}

interface AuthorizationMethod {
	set( userID: number, level: AuthLevel ): Promise<void>;
	get( userID: number ): Promise<AuthLevel>;
	check( userID: number, limit: AuthLevel ): Promise<boolean>;
}

export default class Authorization implements AuthorizationMethod {
	private readonly master: number;
	private readonly redis: Database;
	
	constructor( config: BotConfig, redis: Database ) {
		this.master = config.master;
		this.redis = redis;
	}
	
	private static dbKey( userID: number ): string {
		return `adachi.auth-level-${ userID }`;
	}
	
	public async set( userID: number, level: AuthLevel ): Promise<void> {
		if ( level === AuthLevel.Master && userID !== this.master ) {
			level = AuthLevel.User;
		}
		await this.redis.setString( Authorization.dbKey( userID ), level );
	}
	
	public async get( userID: number ): Promise<AuthLevel> {
		if ( userID === this.master ) {
			return AuthLevel.Master;
		}
		const authStr: string | null = await this.redis.getString( Authorization.dbKey( userID ) );
		let auth = authStr ? Number.parseInt(authStr) : AuthLevel.User;
		/* 如果权限为 master 但与 setting 中的 master 不符，重置为 user */
		if ( auth === AuthLevel.Master ) {
			auth = AuthLevel.User;
			await this.redis.setString( Authorization.dbKey( userID ), AuthLevel.User );
		}
		return auth;
	}
	
	public async check( userID: number, limit: AuthLevel ): Promise<boolean> {
		const auth: AuthLevel = await this.get( userID );
		return auth >= limit;
	}
}