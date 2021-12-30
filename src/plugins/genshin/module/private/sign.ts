import { randomInt } from "#genshin/utils/random";
import { signInInfoPromise, signInResultPromise } from "#genshin/utils/promise";
import { scheduleJob, Job } from "node-schedule";
import { Private, Service } from "./main";
import { SignInInfo } from "#genshin/types";
import { Order } from "@modules/command";
import bot from "ROOT";

export class SignInService implements Service {
	public readonly parent: Private;
	public enable: boolean;
	private job?: Job;
	
	public FixedField = <const>"sign";
	static FixedField = <const>"sign";
	
	constructor( p: Private ) {
		const options: Record<string, any> =
			p.options[ SignInService.FixedField ] || {};
		
		this.parent = p;
		this.enable = options.enable === undefined
			? false : options.enable;
	}
	
	public async loadedHook(): Promise<any> {
		if ( this.enable ) {
			const delay: number = randomInt( 0, 99 );
			
			setTimeout( async () => {
				await this.sign( false );
				this.setScheduleJob();
			}, delay * 100 );
		}
	}
	
	public getOptions(): any {
		return { enable: this.enable };
	}
	
	public async initTest(): Promise<string> {
		const TOGGLE_SIGN = <Order>bot.command.getSingle( "silvery-star.private-toggle-sign" );
		return `米游社签到功能已放行，请使用「${ TOGGLE_SIGN.getHeaders()[0] }+账户编号」开启本功能`;
	}
	
	public async toggleEnableStatus(): Promise<void> {
		this.enable = !this.enable;
		if ( this.enable ) {
			await this.parent.sendMessage( "米游社签到功能已开启" );
			await this.sign( false );
			this.setScheduleJob();
		} else {
			await this.parent.sendMessage( "米游社签到功能已关闭" );
			this.cancelScheduleJob();
		}
		/* 回传进行数据库更新 */
		await this.parent.refreshDBContent( SignInService.FixedField );
	}
	
	private async sign( reply: boolean = true ): Promise<void> {
		const { uid, server, cookie } = this.parent.setting;
		try {
			const info = <SignInInfo>( await signInInfoPromise( uid, server, cookie ) );
			if ( info.isSign ) {
				reply ? await this.parent.sendMessage( "您今天已在米游社签到" ) : "";
				return;
			}
			await signInResultPromise( uid, server, cookie );
			await this.parent.sendMessage(
				`[UID${ uid }] - 今日签到完成，本月累计签到 ${ info.totalSignDay + 1 } 天`
			);
		} catch ( error ) {
			await this.parent.sendMessage( <string>error );
		}
	}
	
	private setScheduleJob(): void {
		const min: number = randomInt( 0, 59 );
		const cron: string = `0 ${ min } 8 * * *`;
		
		this.job = scheduleJob( cron, async () => {
			await this.sign();
			this.setScheduleJob();
		} );
	}
	
	private cancelScheduleJob(): void {
		if ( this.job !== undefined ) {
			this.job.cancel();
		}
	}
}