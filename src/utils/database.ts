import { createClient, RedisClient } from "redis";
import { Adachi, migrate } from "../bot";

interface DatabaseMethod {
	setTimeout( key: string, time: number ): Promise<void>
	deleteKey( ...keys: string[] ): Promise<void>
	getKeysByPrefix( prefix: string ): Promise<Array<string>>
	setHash( key: string, value: any ): Promise<void>
	getHash( key: string ): Promise<any>
	delHash( key: string, ...fields: string[] ): Promise<void>
	setString( key: string, value: any, timeout?: number ): Promise<void>
	getString( key: string ): Promise<string | null>
	getList( key: string ): Promise<Array<string>>
	getListLength( key: string ): Promise<number>
	addListElement( key: string, ...value: any[] ): Promise<void>
	delListElement( key: string, ...value: any[] ): Promise<void>
	existListElement( key: string, value: any ): Promise<boolean>
}

class Database implements DatabaseMethod {
	public readonly client: RedisClient;
	
	constructor( port: number ) {
		const host: string = process.env.docker === "yes" ? "redis" : "localhost";
		this.client = createClient( port, host );
		
		this.client.on( "connect", async () => {
			Adachi.logger.info( "Redis 数据库已连接" );
			await migrate();
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
	
	public async getKeysByPrefix( prefix: string ): Promise<Array<string>> {
		return new Promise( ( resolve, reject ) => {
			this.client.keys( prefix + "*", ( error: Error | null, keys: string[] ) => {
				if ( error !== null ) {
					reject( [] );
				} else {
					resolve( keys );
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
	
	public async getListLength( key: string ): Promise<number> {
		return new Promise( ( resolve, reject ) => {
			this.client.llen( key, ( error: Error | null, length: number ) => {
				if ( error !== null ) {
					reject( -1 );
				} else {
					resolve( length );
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