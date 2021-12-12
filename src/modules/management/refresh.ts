import FileManagement, { PresetPlace } from "@modules/file";
import Command from "@modules/command/main";
import bot from "ROOT";

export type RefreshTarget =
	{ [ key: string ]: any } &
	{ refresh(): Promise<string> };

export interface RefreshCatch {
	log: string;
	msg: string;
}

interface RefreshableSetting {
	path: string;
	target: RefreshTarget;
}

interface RefreshConfigMethod {
	registerRefreshableFile( fileName: string, target: RefreshTarget, place?: PresetPlace ): void;
}

export default class RefreshConfig implements RefreshConfigMethod {
	private readonly file: FileManagement;
	private readonly include: RefreshableSetting[];
	public isRefreshing: boolean;
	
	constructor( file: FileManagement, command: Command ) {
		const path: string = file.getFilePath( "commands", "config" )
		this.include = [ { path, target: command } ];
		this.file = file;
		this.isRefreshing = false;
	}
	
	public registerRefreshableFile(
		fileName: string,
		target: RefreshTarget,
		place: PresetPlace = "config"
	): void {
		const path: string = this.file.getFilePath( fileName, place );
		this.include.push( { path, target } );
	}
	
	public async do(): Promise<string[]> {
		this.isRefreshing = true;
		const respList: string[] = [];
		for ( let setting of this.include ) {
			try {
				const msg: string = await setting.target.refresh();
				respList.push( msg );
			} catch ( error ) {
				const err = <RefreshCatch>error;
				respList.push( err.msg );
				bot.logger.error( err.log );
			}
		}
		this.isRefreshing = false;
		return respList;
	}
}