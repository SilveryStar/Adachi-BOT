import BotConfig from "@modules/config";
import Database from "@modules/database";

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
		await this.redis.setString( Authorization.dbKey( userID ), level );
	}

	public async get( userID: number ): Promise<AuthLevel> {
		if ( userID === this.master ) {
			return AuthLevel.Master;
		}
		const auth: string | null = await this.redis.getString( Authorization.dbKey( userID ) );
		return !auth ? AuthLevel.User : parseInt( auth );
	}
	
	public async check( userID: number, limit: AuthLevel ): Promise<boolean> {
		const auth: AuthLevel = await this.get( userID );
		return auth >= limit;
	}
}