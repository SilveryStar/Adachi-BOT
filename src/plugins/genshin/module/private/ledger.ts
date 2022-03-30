import { Private, Service } from "./main";

export class LedgerQueryService implements Service {
	public readonly parent: Private;
	
	public FixedField = <const>"ledgerQuery";
	static FixedField = <const>"ledgerQuery";
	
	constructor( p: Private ) {
		this.parent = p;
	}
	
	public getOptions(): any {
		return {};
	}
	
	public async initTest(): Promise<string> {
		return "旅行者札记查询功能已开启";
	}
}