import { Private, Service } from "#genshin/module/private/main";

export class MysQueryService implements Service {
	public readonly parent: Private;
	
	constructor( p: Private ) {
		this.parent = p;
	}
	
	public getOptions(): any {
		return {};
	}
	
	public async initTest(): Promise<string> {
		return "米游社信息查询功能已开启";
	}
}