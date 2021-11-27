import { Private, Service } from "#genshin/module/private/main";

export class AbyQueryService implements Service {
	public readonly parent: Private;
	
	constructor( p: Private ) {
		this.parent = p;
	}
	
	public getOptions(): any {
		return {};
	}
	
	public async initTest(): Promise<string> {
		return "深境螺旋信息查询功能已开启";
	}
}