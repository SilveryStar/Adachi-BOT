import { createClient, RedisClientType } from "redis";
import { BotConfig } from "@/modules/config";
import { Client as CoreClient } from "@/modules/lib";

type Argument = Buffer | string;
type SetFieldValue = Argument | number;
/* set */
type SetValue =
	Record<string | number, SetFieldValue> |
	Map<SetFieldValue, SetFieldValue> |
	Array<[ SetFieldValue, SetFieldValue ]> |
	Array<SetFieldValue>;

interface DatabaseMethod {
	setTimeout( key: Argument, time: number ): Promise<void>;
	deleteKey( ...keys: Argument[] ): Promise<void>;
	getKeysByPrefix( prefix: string ): Promise<string[]>;
	/* Hash */
	setHash( key: Argument, value: SetValue ): Promise<void>;
	getHash( key: Argument ): Promise<Record<string, string>>;
	delHash( key: Argument, ...fields: Argument[] ): Promise<void>;
	incHash( key: Argument, field: Argument, increment: number ): Promise<void>;
	existHashKey( key: Argument, field: Argument ): Promise<boolean>;
	setHashField( key: Argument, field: SetFieldValue, value: SetFieldValue ): Promise<void>
	getHashField( key: Argument, field: string ): Promise<string>;
	/* String */
	setString( key: Argument, value: Argument | number, timeout?: number ): Promise<void>;
	getString( key: Argument ): Promise<string>;
	/* List */
	getList( key: Argument ): Promise<string[]>;
	getListLength( key: Argument ): Promise<number>;
	addListElement( key: Argument, ...value: Argument[] ): Promise<void>;
	delListElement( key: Argument, ...value: Argument[] ): Promise<void>;
	existListElement( key: Argument, value: any ): Promise<boolean>;
	/* Set */
	getSet( key: Argument ): Promise<string[]>;
	getSetMemberNum( key: string ): Promise<number>;
	addSetMember( key: Argument, ...value: Argument[] ): Promise<void>;
	delSetMember( key: Argument, ...value: Argument[] ): Promise<void>;
	existSetMember( key: Argument, value: Argument ): Promise<boolean>;
}

export default class Database implements DatabaseMethod {
	public client: RedisClientType;
	public online = false;
	
	constructor( config: BotConfig["db"], coreClient: CoreClient ) {
		this.client = this.initClient( config.port, config.password, coreClient );
		config.on( "refresh", async ( newCfg ) => {
			if ( this.online ) {
				await this.client.quit();
				this.online = false;
			}
			this.client = this.initClient( newCfg.port, newCfg.password, coreClient );
		} );
	}
	
	private initClient( port: number, password: string, coreClient: CoreClient ): any {
		const host: string = process.env.docker === "yes" ? "redis" : "localhost";
		const client = createClient( {
			socket: { port, host },
			password
		} );
		client.on( "connect", () => {
			this.online = true;
			coreClient.logger.info( "Redis 数据库已连接" );
		} );
		client.connect().then();
		return client;
	}
	
	private throwNotOnlineError() {
		if ( !this.online ) {
			throw new Error( "Redis client is not online" );
		}
	}
	
	public waitConnected(): Promise<void> {
		return new Promise( ( resolve, reject ) => {
			if ( this.online ) {
				return resolve();
			}
			const delay = 1000, timeout = 30000;
			let count = 0;
			const timer = setTimeout( () => {
				count += delay;
				if ( count > timeout ) {
					return reject( new Error( "Redis client is not online" ) );
				}
				if ( !this.online ) return;
				clearTimeout( timer );
				resolve();
			}, delay );
		} );
	}
	
	public async setTimeout( key: Argument, time: number ): Promise<void> {
		this.throwNotOnlineError();
		await this.client.expire( key, time );
	}
	
	public async deleteKey( ...keys: Argument[] ): Promise<void> {
		this.throwNotOnlineError();
		for ( let k of keys ) {
			await this.client.del( k );
		}
	}
	
	public async getKeysByPrefix( prefix: string ): Promise<string[]> {
		this.throwNotOnlineError();
		const keys = this.client.keys( prefix + "*" );
		return keys || [];
	}
	
	public async setHash( key: Argument, value: SetValue ): Promise<void> {
		this.throwNotOnlineError();
		await this.client.hSet( key, value );
	}
	
	public async getHash( key: Argument ): Promise<Record<string, string>> {
		this.throwNotOnlineError();
		const data = await this.client.hGetAll( key );
		return data || {};
	}
	
	public async delHash( key: Argument, ...fields: Argument[] ): Promise<void> {
		this.throwNotOnlineError();
		await this.client.hDel( key, fields );
	}
	
	public async incHash( key: Argument, field: Argument, increment: number ): Promise<void> {
		this.throwNotOnlineError();
		if ( parseInt( increment.toString() ) === increment ) {
			await this.client.hIncrBy( key, field, increment );
		} else {
			await this.client.hIncrByFloat( key, field, increment );
		}
	}
	
	public async existHashKey( key: Argument, field: Argument ): Promise<boolean> {
		this.throwNotOnlineError();
		return await this.client.hExists( key, field );
	}
	
	public async setHashField( key: Argument, field: SetFieldValue, value: SetFieldValue ): Promise<void> {
		this.throwNotOnlineError();
		await this.client.hSet( key, field, value );
	}
	
	public async getHashField( key: Argument, field: Argument ): Promise<string> {
		this.throwNotOnlineError();
		const data = await this.client.hGet( key, field );
		return data || "";
	}
	
	public async setString( key: Argument, value: Argument | number, timeout?: number ): Promise<void> {
		this.throwNotOnlineError();
		const formatValue: Argument = typeof value === "number" ? value.toString() : value;
		if ( timeout === undefined ) {
			await this.client.set( key, formatValue );
		} else {
			await this.client.setEx( key, timeout, formatValue );
		}
	}
	
	public async getString( key: Argument ): Promise<string> {
		this.throwNotOnlineError();
		const data = await this.client.get( key );
		return data || "";
	}
	
	public async getList( key: Argument ): Promise<string[]> {
		this.throwNotOnlineError();
		const data = await this.client.lRange( key, 0, -1 );
		return data || [];
	}
	
	public async getListLength( key: Argument ): Promise<number> {
		this.throwNotOnlineError();
		const length = await this.client.lLen( key );
		return length || 0;
	}
	
	public async addListElement( key: Argument, ...value: Argument[] ): Promise<void> {
		this.throwNotOnlineError();
		await this.client.rPush( key, value );
	}
	
	public async delListElement( key: Argument, ...value: Argument[] ): Promise<void> {
		this.throwNotOnlineError();
		for ( let v of value ) {
			await this.client.lRem( key, 0, v );
		}
	}
	
	public async existListElement( key: Argument, value: any ): Promise<boolean> {
		this.throwNotOnlineError();
		const list: string[] = await this.getList( key );
		return list.includes( value.toString() );
	}
	
	public async getSet( key: Argument ): Promise<string[]> {
		this.throwNotOnlineError();
		const data = await this.client.sMembers( key );
		return data || [];
	}
	
	public async getSetMemberNum( key: string ): Promise<number> {
		this.throwNotOnlineError();
		return await this.client.sCard( key );
	}
	
	public async addSetMember( key: Argument, ...value: Argument[] ): Promise<void> {
		this.throwNotOnlineError();
		await this.client.sAdd( key, value );
	}
	
	public async delSetMember( key: Argument, ...value: Argument[] ): Promise<void> {
		this.throwNotOnlineError();
		await this.client.sRem( key, value );
	}
	
	public async existSetMember( key: Argument, value: Argument ): Promise<boolean> {
		this.throwNotOnlineError();
		return await this.client.sIsMember( key, value );
	}
}