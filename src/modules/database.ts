import { createClient, RedisClient } from "redis";
import { Logger } from "log4js";
import FileManagement from "./file";

interface DatabaseMethod {
	setTimeout( key: string, time: number ): Promise<void>;
	deleteKey( ...keys: string[] ): Promise<void>;
	getKeysByPrefix( prefix: string ): Promise<string[]>;
	/* Hash */
	setHash( key: string, value: any ): Promise<void>;
	getHash( key: string ): Promise<any>;
	delHash( key: string, ...fields: string[] ): Promise<void>;
	incHash( key: string, field: string, increment: number ): Promise<void>;
	existHashKey( key: string, field: string ): Promise<boolean>;
	/* String */
	setString( key: string, value: any, timeout?: number ): Promise<void>;
	getString( key: string ): Promise<string | null>;
	/* List */
	getList( key: string ): Promise<string[]>;
	getListLength( key: string ): Promise<number>;
	addListElement( key: string, ...value: any[] ): Promise<void>;
	delListElement( key: string, ...value: any[] ): Promise<void>;
	existListElement( key: string, value: any ): Promise<boolean>;
	/* Set */
	getSet( key: string ): Promise<string[]>;
	getSetMemberNum( key: string ): Promise<number>;
	addSetMember( key: string, ...value: any[] ): Promise<void>;
	delSetMember( key: string, ...value: any[] ): Promise<void>;
	existSetMember( key: string, value: any ): Promise<boolean>;
}

export default class Database implements DatabaseMethod {
	public readonly client: RedisClient;
	
	constructor( port: number, logger: Logger, file: FileManagement ) {
		const host: string = process.env.docker === "yes" ? "redis" : "localhost";
		
		this.client = createClient( port, host );
		this.client.on( "connect", async () => {
			logger.info( "Redis 数据库已连接" );
		} );
	}
	
	public async setTimeout( key: string, time: number ): Promise<void> {
		this.client.expire( key, time );
	}
	
	public async deleteKey( ...keys: string[] ): Promise<void> {
		for ( let k of keys ) {
			this.client.del( k );
		}
	}
	
	public async getKeysByPrefix( prefix: string ): Promise<string[]> {
		return new Promise( ( resolve, reject ) => {
			this.client.keys( prefix + "*", ( error: Error | null, keys: string[] ) => {
				if ( error !== null ) {
					reject( error );
				} else {
					resolve( keys || [] );
				}
			} );
		} );
	}
	
	public async setHash( key: string, value: any ): Promise<void> {
		this.client.hmset( key, value );
	}
	
	public async getHash( key: string ): Promise<any> {
		return new Promise( ( resolve, reject ) => {
			this.client.hgetall( key, ( error: Error | null, data: { [key: string]: string } ) => {
				if ( error !== null ) {
					reject( error );
				} else {
					resolve( data || {} );
				}
			} );
		} );
	}
	
	public async delHash( key: string, ...fields: string[] ): Promise<void> {
		this.client.hdel( key, fields );
	}
	
	public async incHash( key: string, field: string, increment: number ): Promise<void> {
		if ( parseInt( increment.toString() ) === increment ) {
			this.client.hincrby( key, field, increment );
		} else {
			this.client.hincrbyfloat( key, field, increment );
		}
	}
	
	public async existHashKey( key: string, field: string ): Promise<boolean> {
		return new Promise( ( resolve, reject ) => {
			this.client.hexists( key, field, ( error: Error | null, data: number ) => {
				if ( error !== null ) {
					reject( false );
				} else {
					resolve( data === 1 );
				}
			} );
		} );
	}
	
	public async setString( key: string, value: any, timeout?: number ): Promise<void> {
		if ( timeout === undefined ) {
			this.client.set( key, value );
		} else {
			this.client.setex( key, timeout, value );
		}
	}
	
	public async getString( key: string ): Promise<string> {
		return new Promise( ( resolve, reject ) => {
			this.client.get( key, ( error: Error | null, data: string | null ) => {
				if ( error !== null ) {
					reject( error );
				} else {
					resolve( data || "" );
				}
			} );
		} );
	}
	
	public async getList( key: string ): Promise<string[]> {
		return new Promise( ( resolve, reject ) => {
			this.client.lrange( key, 0, -1, ( error: Error | null, data: string[] ) => {
				if ( error !== null ) {
					reject( error );
				} else {
					resolve( data || [] );
				}
			} );
		} );
	}
	
	public async getListLength( key: string ): Promise<number> {
		return new Promise( ( resolve, reject ) => {
			this.client.llen( key, ( error: Error | null, length: number ) => {
				if ( error !== null ) {
					reject( error );
				} else {
					resolve( length || 0 );
				}
			} );
		} );
	}
	
	public async addListElement( key: string, ...value: any[] ): Promise<void> {
		this.client.rpush( key, value );
	}
	
	public async delListElement( key: string, ...value: any[] ): Promise<void> {
		for ( let v of value ) {
			this.client.lrem( key, 0, v );
		}
	}
	
	public async existListElement( key: string, value: any ): Promise<boolean> {
		const list: string[] = await this.getList( key );
		return list.includes( value.toString() );
	}
	
	public async getSet( key: string ): Promise<string[]> {
		return new Promise( ( resolve, reject ) => {
			this.client.smembers( key, ( error: Error | null, data: string[] ) => {
				if ( error !== null ) {
					reject( error );
				} else {
					resolve( data || [] );
				}
			} );
		} );
	}
	
	public async getSetMemberNum( key: string ): Promise<number> {
		return new Promise( ( resolve, reject ) => {
			this.client.scard( key, ( error: Error | null, data: number ) => {
				if ( error !== null ) {
					reject( error );
				} else {
					resolve( data || 0 );
				}
			} );
		} );
	}
	
	public async addSetMember( key: string, ...value: any[] ): Promise<void> {
		this.client.sadd( key, value );
	}
	
	public async delSetMember( key: string, ...value: any[] ): Promise<void> {
		this.client.srem( key, value );
	}
	
	public async existSetMember( key: string, value: any ): Promise<boolean> {
		return new Promise( ( resolve, reject ) => {
			this.client.sismember( key, value, ( error: Error | null, data: number ) => {
				if ( error !== null ) {
					reject( false );
				} else {
					resolve( data === 1 );
				}
			} );
		} );
	}
}