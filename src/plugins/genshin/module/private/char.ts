import { Private, Service } from "./main";

export class CharQueryService implements Service {
	public readonly parent: Private;
	
	public FixedField = <const>"charQuery";
	static FixedField = <const>"charQuery";
	
	constructor( p: Private ) {
		this.parent = p;
	}
	
	public getOptions(): any {
		return {};
	}
	
	public async initTest(): Promise<string> {
		return "角色信息查询功能已开启";
	}
}