import { createClient, RedisClient } from "redis";
import { Adachi } from "../bot";

interface DatabaseMethod {
	deleteKey( ...keys: string[] ): Promise<void>
	setHash( key: string, value: any ): Promise<void>
	getHash( key: string ): Promise<any>
	delHash( key: string, ...fields: string[] ): Promise<void>
	setString( key: string, value: any, timeout?: number ): Promise<void>
	getString( key: string ): Promise<string | null>
	getList( key: string ): Promise<Array<string>>
	addListElement( key: string, ...value: any[] ): Promise<void>
	delListElement( key: string, ...value: any[] ): Promise<void>
	existListElement( key: string, value: any ): Promise<boolean>
}

class Database implements DatabaseMethod {
	public readonly client: RedisClient;
	
	constructor( port: number ) {
		this.client = createClient( port );
		
		this.client.on( "connect", () => {
			Adachi.logger.info( "Redis 数据库已连接" );
		} );
	}
	
	public async deleteKey( ...keys: string[] ): Promise<void> {
		for ( let k of keys ) {
			this.client.del( k );
		}
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
					resolve( data );
				}
			} );
		} );
	}
	
	public async delHash( key: string, ...fields: string[] ): Promise<void> {
		this.client.hdel( key, fields );
	}
	
	public async setString( key: string, value: any, timeout?: number ): Promise<void> {
		if ( timeout === undefined ) {
			this.client.set( key, value );
		} else {
			this.client.setex( key, timeout, value );
		}
	}
	
	public async getString( key: string ): Promise<string | null> {
		return new Promise( ( resolve, reject ) => {
			this.client.get( key, ( error: Error | null, data: string | null ) => {
				if ( error !== null ) {
					reject( error );
				} else {
					resolve( data );
				}
			} );
		} );
	}
	
	public async getList( key: string ): Promise<Array<string>> {
		return new Promise( ( resolve, reject ) => {
			this.client.lrange( key, 0, -1, ( error: Error | null, data: string[] ) => {
				if ( error !== null ) {
					reject( [] );
				} else {
					resolve( data );
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
		const list: Array<string> = await this.getList( key );
		return list.includes( value.toString() );
	}
}

export { Database }