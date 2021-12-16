import bot from "ROOT";
import { Order } from "@modules/command";
import { AuthLevel } from "@modules/management/auth";
import { Note, Expedition } from "#genshin/types";
import { Private, Service, UserInfo } from "./main";
import { scheduleJob, Job } from "node-schedule";
import { dailyNotePromise } from "#genshin/utils/promise";

interface PushEvent {
	type: "resin" | "expedition";
	job: Job;
}

export class NoteService implements Service {
	public readonly parent: Private;
	
	private timePoint: number[];
	private events: PushEvent[] = [];
	private globalData: Note | string = "";
	private readonly feedbackCatch: () => Promise<void>;
	
	public FixedField = <const>"note";
	static FixedField = <const>"note";
	
	constructor( p: Private ) {
		const options: Record<string, any> =
			p.options[ NoteService.FixedField ] || {};
		
		this.parent = p;
		this.timePoint = options.timePoint || [ 120, 155 ];
		this.feedbackCatch = async () => {
			await this.parent.sendMessage( <string>this.globalData );
		};
		
		this.refreshPushEvent().catch( this.feedbackCatch );
		scheduleJob( "0 0 */1 * * *", () => {
			this.refreshPushEvent().catch( this.feedbackCatch );
		} );
	}
	
	public getOptions(): any {
		return { timePoint: this.timePoint };
	}
	
	public async initTest(): Promise<string> {
		await this.getData();
		if ( typeof this.globalData === "string" ) {
			return "实时便笺功能开启失败：\n" +
				   this.globalData + "\n" +
				   "可能是因为米游社数据未公开或米游社内未开启实时便笺";
		} else {
			const auth: AuthLevel = await bot.auth.get( this.parent.setting.userID );
			const SET_TIME = <Order>bot.command.getSingle( "silvery-star.note-set-time", auth );
			return "实时便笺功能已开启：\n" +
				   "默认情况下，树脂数量达到 120 和 155 时会发送进行私聊推送\n" +
				   `也可以通过「${ SET_TIME.getHeaders()[0] }+账户编号+树脂量」来设置\n` +
				   "当冒险探索结束时，BOT 也会进行提醒";
		}
	}
	
	public async modifyTimePoint( time: number[] ): Promise<void> {
		/* 过滤超过 160 的树脂量 */
		this.timePoint = time.filter( el => el <= 160 );
		this.refreshPushEvent().catch( this.feedbackCatch );
		/* 回传进行数据库更新 */
		await this.parent.refreshDBContent( NoteService.FixedField );
	}
	
	public async toJSON(): Promise<string> {
		await this.getData();
		return JSON.stringify( {
			...<Note>this.globalData,
			uid: this.parent.setting.uid
		} );
	}
	
	private async getData(): Promise<void> {
		try {
			const setting: UserInfo = this.parent.setting;
			this.globalData = <Note>await dailyNotePromise(
				setting.uid,
				setting.server,
				setting.cookie
			);
		} catch ( error ) {
			this.globalData = <string>error;
		}
	}
	
	private clearEvents(): void {
		for ( let e of this.events ) {
			e.job.cancel();
		}
		this.events = [];
	}
	
	private async refreshPushEvent(): Promise<void> {
		const now: number = new Date().getTime();
		
		await this.getData();
		if ( typeof this.globalData === "string" ) {
			return Promise.reject();
		}
		
		/* 清空当前事件 */
		this.clearEvents();
		
		for ( let t of this.timePoint ) {
			/* 当前树脂量超过设定量则不处理 */
			if ( this.globalData.currentResin >= t ) {
				continue;
			}

			const recovery: number = parseInt( this.globalData.resinRecoveryTime );
			const remaining: number = recovery - ( 160 - t ) * 8 * 60;
			const time = new Date( now + remaining * 1000 );

			const job: Job = scheduleJob( time, async () => {
				await this.parent.sendMessage( `[UID${ this.parent.setting.uid }] - 树脂量已经到达 ${ t } 了哦~` );
			} );
			this.events.push( { type: "resin", job } );
		}
		
		const expeditions: Expedition[] = this.globalData.expeditions
			.filter( el => el.status === "Ongoing" )
			.sort( ( x, y ) => {
				return parseInt( x.remainedTime ) - parseInt( y.remainedTime );
			} );
		if ( expeditions.length === 0 ) {
			return Promise.resolve();
		}
		
		const compressed: any = [];
		let num: number = 0;

		compressed.push( { num: 1, ...expeditions.shift() } );
		for ( let e of expeditions ) {
			if ( parseInt( e.remainedTime ) - parseInt( compressed[num].remainedTime ) <= 30 ) {
				compressed[num].num++;
				compressed[num].remainedTime = e.remainedTime;
			} else {
				num++;
				compressed.push( { num: 1, ...e } );
			}
		}
		
		for ( let c of compressed ) {
			const time = new Date( now + parseInt( c.remainedTime ) * 1000 );
			const job: Job = scheduleJob( time, async () => {
				await this.parent.sendMessage( `[UID${ this.parent.setting.uid }] - 已有 ${ c.num } 个探索派遣任务完成` );
			} );
			this.events.push( { type: "expedition", job } );
		}
	}
}