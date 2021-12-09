import { Private, Service } from "./main";

export class MysQueryService implements Service {
	public readonly parent: Private;
	public appoint: string;
	
	public FixedField = <const>"mysQuery";
	static FixedField = <const>"mysQuery";
	
	constructor( p: Private ) {
		const options: Record<string, any> =
			p.options[ MysQueryService.FixedField ] || {};
		
		this.parent = p;
		this.appoint = options.appoint || "empty";
	}
	
	public getOptions(): any {
		return { appoint: this.appoint };
	}
	
	public async initTest(): Promise<string> {
		return "米游社信息查询功能已开启";
	}
	
	public async modifyAppointChar( id: string ): Promise<void> {
		this.appoint = id;
		/* 回传进行数据库更新 */
		await this.parent.refreshDBContent( MysQueryService.FixedField );
	}
}