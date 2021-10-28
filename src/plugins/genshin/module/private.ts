import { getRegion } from "../utils/region";
import { pull } from "lodash";
import { getHeader as h } from "../utils/header";
import { getSendMessageFunc, MessageType, sendType } from "../../../modules/message";
import { getAuthLevel, AuthLevel } from "../../../modules/auth";
import { NoteService } from "./note";
import { Md5 } from "md5-typescript";
import { Redis } from "../../../bot";

interface Service {
	parent: Private;
	getOptions: () => any;
	initTest: () => Promise<string>;
}

class UserInfo {
	public readonly uid: string;
	public readonly cookie: string;
	public readonly server: string;
	public readonly userID: number;
	
	constructor( uid: string, cookie: string, userID: number ) {
		this.uid = uid;
		this.cookie = cookie;
		this.userID = userID;
		this.server = getRegion( uid[0] );
	}
}

const dbPrefix: string = "silvery-star.private-";

/*
* 依据 https://github.com/SilveryStar/Adachi-BOT/issues/70#issuecomment-946331850 重新设计
* 期望在未来可以进行功能扩展
* */
class Private {
	public readonly setting: UserInfo;
	public readonly services: Record<string, Service>;
	public readonly sendMessage: sendType;
	public readonly dbKey: string;
	
	public options: Record<string, any>;
	
	static parse( content: string ): any {
		const data = JSON.parse( content );
		return new Private(
			data.setting.uid,
			data.setting.cookie,
			data.setting.userID,
			data.options
		);
	}
	
	constructor( uid: string, cookie: string, userID: number, options?: Record<string, any> ) {
		this.options = options || {};
		this.setting = new UserInfo( uid, cookie, userID );
		this.sendMessage = getSendMessageFunc( userID, MessageType.Private );
		
		const md5: string = Md5.init( `${ userID }-${ uid }` );
		this.dbKey = dbPrefix + md5;
		
		this.services = {
			note: new NoteService( this )
		};
		this.options = this.globalOptions();
	}
	
	private globalOptions(): any {
		const options = {};
		for ( let k of Object.keys( this.services ) ) {
			options[k] = this.services[k].getOptions();
		}
		return options;
	}
	
	public stringify(): string {
		return JSON.stringify( {
			setting: this.setting,
			options: this.options
		} );
	}
	
	public async refreshDBContent( field: string ): Promise<void> {
		this.options[field] = this.services[field].getOptions();
		await Redis.setString( this.dbKey, this.stringify() );
	}
}

class PrivateClass {
	private readonly list: Private[];
	
	constructor() {
		this.list = [];
		
		Redis.getKeysByPrefix( dbPrefix )
			.then( async ( keys: string[] ) => {
				for ( let k of keys ) {
					const data = await Redis.getString( k );
					if ( !data ) {
						continue;
					}
					this.list.push( Private.parse( data ) );
				}
			} );
	}
	
	public getUserPrivateList( userID: number ): Private[] {
		return this.list.filter( el => el.setting.userID === userID );
	}
	
	public async getSinglePrivate( userID: number, privateID: number ): Promise<Private | string> {
		const list: Private[] = this.getUserPrivateList( userID );
		const auth: AuthLevel = await getAuthLevel( userID );
		if ( privateID > list.length ) {
			return `无效的编号，请使用 ${ h( "silvery-star.private-list", auth )[0] } 检查`;
		} else {
			return list[privateID - 1];
		}
	}
	
	public getUserInfoList( userID: number ): UserInfo[] {
		return this.getUserPrivateList( userID ).map( el => el.setting );
	}
	
	public async addPrivate( uid: string, cookie: string, userID: number ): Promise<string> {
		const list: Private[] = this.getUserPrivateList( userID );
		if ( list.some( el => el.setting.uid === uid ) ) {
			return `UID${ uid } 的私人服务已经申请`;
		}
		
		const newPrivate = new Private( uid, cookie, userID );
		this.list.push( newPrivate );
		await Redis.setString( newPrivate.dbKey, newPrivate.stringify() );

		const values: Service[] = Object.values( newPrivate.services );
		const contents: string[] = await Promise.all( values.map( async el => await el.initTest() ) );
		return `私人服务开启成功，UID: ${ uid }` + [ "", ...contents  ].join( "\n" );
	}
	
	public async delPrivate( userID: number, privateID: number ): Promise<string> {
		const single: Private | string = await this.getSinglePrivate( userID, privateID );
		if ( typeof single === "string" ) {
			return single;
		} else {
			pull( this.list, single );
			await Redis.deleteKey( single.dbKey );
			return "私人服务取消成功";
		}
	}
}

export {
	Private,
	Service,
	PrivateClass,
	UserInfo
}