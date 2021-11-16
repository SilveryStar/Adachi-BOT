import bot from "ROOT"
import { getRealName, NameResult } from "../utils/name";
import { scheduleJob } from "node-schedule";
import { isCharacterInfo, isWeaponInfo, InfoResponse } from "../types";
import { randomInt } from "../utils/random";
import { getDailyMaterial, getInfo } from "../utils/api";
import { render } from "../utils/render";
import { take } from "lodash";

export interface DailyMaterial {
	"Mon&Thu": string[];
	"Tue&Fri": string[];
	"Wed&Sat": string[];
}

interface DailyInfo {
	name: string;
	rarity: number;
}

export class DailySet {
	private readonly weaponSet: Record<string, DailyInfo[]>;
	private readonly characterSet: Record<string, DailyInfo[]>;
	
	constructor( data: InfoResponse[] ) {
		this.weaponSet = {};
		this.characterSet = {};
		
		for ( let d of data ) {
			const { name, rarity }: { name: string, rarity: number } = d;
			if ( isCharacterInfo( d ) ) {
				this.add( take( d.talentMaterials, 3 ), { name, rarity }, "character" );
			} else if ( isWeaponInfo( d ) ) {
				this.add( d.ascensionMaterials[0], { name, rarity }, "weapon" );
			}
		}
	}
	
	private add( keyAsArr: string[], value: any, type: string ): void {
		const name: string = `${ type }Set`;
		const keys: string[] = Object.keys( this[name] );
		const key: string = JSON.stringify( keyAsArr );
		const find: string | undefined = keys.find( el => el === key );
		
		if ( !find ) {
			this[name][key] = [ value ];
		} else {
			this[name][key].push( value );
		}
	}
	
	public get(): Record<string, string> {
		return {
			weapon: Buffer.from( JSON.stringify( this.weaponSet ) ).toString( "base64" ),
			character: Buffer.from( JSON.stringify( this.characterSet ) ).toString( "base64" )
		};
	}
}

export class DailyClass {
	private detail: DailyMaterial;
	private userSubTmp: Record<number, DailySet> = {};
	
	constructor() {
		this.detail = { "Mon&Thu": [], "Tue&Fri": [], "Wed&Sat": [] };
		getDailyMaterial().then( ( result: DailyMaterial ) => {
			this.detail = result;
		} );
		scheduleJob( "0 0 0 * * *", async () => {
			this.detail = await getDailyMaterial();
		} );

		scheduleJob( "0 0 6 * * *", async () => {
			const users: string[] = await bot.redis.getKeysByPrefix( "silvery-star.daily-sub-" );
			const date: Date = new Date();
			
			/* 获取当日副本对应的角色和武器 */
			let todayInfoSet: string[] = [];
			const week: number = date.getDay();
			if ( week === 1 || week === 4 ) {
				todayInfoSet = this.detail["Mon&Thu"];
			} else if ( week === 2 || week === 5 ) {
				todayInfoSet = this.detail["Tue&Fri"];
			} else if ( week === 3 || week === 6 ) {
				todayInfoSet = this.detail["Wed&Sat"];
			}
			
			/* 获取所有角色和武器的信息 */
			const allData: InfoResponse[] = [];

			if ( week !== 0 ) {
				for ( let targetName of todayInfoSet ) {
					const data = await getInfo( targetName );
					if ( typeof data !== "string" ) {
						allData.push( data );
					}
				}
			}

			/* 群发订阅信息 */
			const groupData = new DailySet( allData );
			const groupIDs: string[] = await bot.redis.getList( "silvery-star.daily-sub-group" );
			const subMessage: string = week === 0
									 ? "周日所有材料都可以刷取哦~"
								     : await render( "daily", groupData.get() ); // 渲染全体图片
			for ( let id of groupIDs ) {
				await bot.client.sendGroupMsg( parseInt( id ), subMessage );
			}

			/* 周日不对订阅信息的用户进行私发 */
			if ( week === 0 ) {
				return;
			}
			
			/* 私发订阅信息 */
			for ( let key of users ) {
				const subList: string[] = await bot.redis.getList( key );
				const userID: number = parseInt( <string>key.split( "-" ).pop() );
				if ( subList.length === 0 ) {
					continue;
				}
				
				const privateSub: InfoResponse[] = [];
				for ( let item of subList ) {
					const find: InfoResponse | undefined = allData.find( el => el.name === item );
					if ( find === undefined ) {
						continue;
					}
					privateSub.push( find );
				}
				if ( privateSub.length === 0 ) {
					continue;
				}
				
				const privateData = new DailySet( privateSub );
				this.userSubTmp[userID] = privateData;
				
				const randomMinute: number = randomInt( 3, 59 );
				date.setMinutes( randomMinute );
				
				scheduleJob( date, async () => {
					const image: string = await render( "daily", privateData.get() );
					await bot.client.sendPrivateMsg( userID, image );
				} );
			}
		} );
	}
	
	public async getUserSubscription( userID: number ): Promise<string> {
		const date: Date = new Date();
		if ( date.getDay() === 0 ) {
			return "周日所有材料都可以刷取哦~";
		}
		
		const data: DailySet | undefined = this.userSubTmp[userID];
		return data === undefined
			        ? "您还没有订阅过素材或 BOT 当日数据未更新，请先订阅素材并在早晨六点后再次尝试"
					: await render( "daily", data.get() );
	}
	
	public async modifySubscription( userID: number, operation: boolean, name: string, isGroup: boolean ): Promise<string> {
		/* 添加/删除群聊订阅 */
		if ( isGroup ) {
			const dbKey: string = "silvery-star.daily-sub-group";
			const exist: boolean = await bot.redis.existListElement( dbKey, name );
		
			if ( exist === operation ) {
				return `群聊 ${ name } ${ operation ? "已订阅" : "未曾订阅" }`;
			} else if ( operation ) {
				await bot.redis.addListElement( dbKey, name );
			} else {
				await bot.redis.delListElement( dbKey, name );
			}
			
			return `群聊订阅${ operation ? "添加" : "取消" }成功`;
		}
		
		/* 添加/删除私聊订阅 */
		const result: NameResult = getRealName( name );
		
		if ( result.definite ) {
			const realName: string = <string>result.info;
			const dbKey: string = `silvery-star.daily-sub-${ userID }`;
			const exist: boolean = await bot.redis.existListElement( dbKey, realName );

			if ( exist === operation ) {
				return `「${ realName }」${ operation ? "已订阅" : "未曾订阅" }`;
			} else if ( operation ) {
				await bot.redis.addListElement( dbKey, realName );
			} else {
				await bot.redis.delListElement( dbKey, realName );
			}
			
			return `订阅${ operation ? "添加" : "取消" }成功`;
		} else if ( result.info === "" ) {
			return `未找到名为「${ name }」的角色或武器，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈`;
		} else {
			return `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }`;
		}
	}
}