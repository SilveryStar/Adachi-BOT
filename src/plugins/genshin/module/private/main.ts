import bot from "ROOT";
import { MessageType, SendFunc } from "@modules/message";
import { AuthLevel } from "@modules/management/auth";
import { Order } from "@modules/command";
import { NoteService } from "./note";
import { MysQueryService } from "./mys";
import { AbyQueryService } from "./abyss";
import { SignInService } from "./sign";
import { Md5 } from "md5-typescript";
import { pull } from "lodash";
import { getRegion } from "#genshin/utils/region";

export interface Service {
	parent: Private;
	FixedField: string;
	getOptions(): any;
	initTest(): Promise<string>;
}

/* 获取元组第一位 */
type TupleHead<T extends any[]> = T[0];
/* 弹出元组第一位 */
type TupleShift<T extends Service[]> = T extends [ infer L, ... infer R ] ? R : never;
/* 合并交叉类型 */
type Merge<T> = { [ P in keyof T ]: T[P] };
/* 向接口中添加新字段 */
type ObjectExpand<T, U extends Service> = Merge<
	{ [ P in keyof T ]: T[P] } &
	{ [ P in U["FixedField"] ]: U }
>;
/* 定义扩展私人服务的基本接口 */
type BasicExpand = Record<string, Service>;
/* 递归定义扩展私人服务类型 */
type ExpandedService<T extends any[], E extends BasicExpand = {}> = T extends []
	? E
	: ExpandedService<TupleShift<T>, ObjectExpand<E, TupleHead<T>>>;
/* 定义扩展私有服务 */
type ServiceTuple = [ NoteService, SignInService, MysQueryService, AbyQueryService ];
/* 获取扩展私人服务类型 */
type Services = ExpandedService<ServiceTuple>;

export class UserInfo {
	public readonly uid: string;
	public readonly cookie: string;
	public readonly server: string;
	public readonly userID: number;
	public readonly mysID: number;
	
	constructor( uid: string, cookie: string, userID: number, mysID: number ) {
		this.uid = uid;
		this.cookie = cookie;
		this.userID = userID;
		this.mysID = mysID;
		this.server = getRegion( uid[0] );
	}
}

const dbPrefix: string = "silvery-star.private-";

/*
* 依据 https://github.com/SilveryStar/Adachi-BOT/issues/70#issuecomment-946331850 重新设计
* 期望在未来可以进行功能扩展
* */
export class Private {
	public readonly setting: UserInfo;
	public readonly services: Services;
	public readonly sendMessage: SendFunc;
	public readonly dbKey: string;
	
	public options: Record<string, any>;
	
	static parse( content: string ): Private {
		const data = JSON.parse( content );
		if ( !data.setting.mysID ) {
			const reg = new RegExp( /.*?ltuid=([0-9]+).*?/g );
			const execRes = <RegExpExecArray>reg.exec( data.setting.cookie );
			data.setting.mysID = parseInt( execRes[1] );
		}
		return new Private(
			data.setting.uid,    data.setting.cookie,
			data.setting.userID, data.setting.mysID,
			data.options
		);
	}
	
	constructor(
		uid: string, cookie: string,
		userID: number, mysID: number,
		options?: Record<string, any>
	) {
		this.options = options || {};
		this.setting = new UserInfo( uid, cookie, userID, mysID );
		this.sendMessage = bot.message.getSendMessageFunc( userID, MessageType.Private );
		
		const md5: string = Md5.init( `${ userID }-${ uid }` );
		this.dbKey = dbPrefix + md5;
		this.services = {
			[ NoteService.FixedField ]:     new NoteService( this ),
			[ SignInService.FixedField ]:   new SignInService( this ),
			[ MysQueryService.FixedField ]: new MysQueryService( this ),
			[ AbyQueryService.FixedField ]: new AbyQueryService( this )
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
		await bot.redis.setString( this.dbKey, this.stringify() );
	}
}

export class PrivateClass {
	private readonly list: Private[];
	
	constructor() {
		this.list = [];
		
		bot.redis.getKeysByPrefix( dbPrefix ).then( async ( keys: string[] ) => {
			for ( let k of keys ) {
				const data = await bot.redis.getString( k );
				if ( !data ) {
					continue;
				}
				const account = Private.parse( data );
				this.list.push( account );
			}
		} );
	}
	
	public getUserPrivateList( userID: number ): Private[] {
		return this.list.filter( el => el.setting.userID === userID );
	}
	
	public async getSinglePrivate( userID: number, privateID: number ): Promise<Private | string> {
		const list: Private[] = this.getUserPrivateList( userID );
		const auth: AuthLevel = await bot.auth.get( userID );
		if ( privateID > list.length || privateID === 0 ) {
			const PRIVATE_LIST = <Order>bot.command.getSingle(
				"silvery-star.private-list", auth
			);
			return `无效的编号，请使用 ${ PRIVATE_LIST.getHeaders()[0] } 检查`;
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
		const reg = new RegExp( /.*?ltuid=([0-9]+).*?/g );
		const execRes = <RegExpExecArray>reg.exec( cookie );
		const mysID: number = parseInt( execRes[1] );
		
		const newPrivate = new Private( uid, cookie, userID, mysID );
		this.list.push( newPrivate );
		await bot.redis.setString( newPrivate.dbKey, newPrivate.stringify() );

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
			await bot.redis.deleteKey( single.dbKey );
			return "私人服务取消成功";
		}
	}
}