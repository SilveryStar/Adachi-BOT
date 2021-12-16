import FileManagement, { PresetPlace } from "@modules/file";
import Command from "@modules/command/main";
import bot from "ROOT";

export type RefreshTarget =
	{ [ key: string ]: any } &
	{ refresh( ...args: any ): Promise<string> };

export interface RefreshCatch {
	log: string;
	msg: string;
}

interface RefreshableFile {
	type: "file";
	fileName: string;
	place: PresetPlace;
	target: RefreshTarget;
}

interface RefreshableFunc {
	type: "func";
	target: RefreshTarget;
}

type RefreshableSetting = RefreshableFile | RefreshableFunc;

interface RefreshableMethod {
	registerRefreshableFile( fileName: string, target: RefreshTarget, place?: PresetPlace ): void;
	registerRefreshableFunc( target: RefreshTarget ): void;
}

export default class Refreshable implements RefreshableMethod {
	private readonly file: FileManagement;
	private readonly include: RefreshableSetting[];
	public isRefreshing: boolean;
	
	constructor( file: FileManagement, command: Command ) {
		this.include = [ {
			type: "file", fileName: "commands",
			place: "config", target: command
		} ];
		this.file = file;
		this.isRefreshing = false;
	}
	
	public registerRefreshableFile(
		fileName: string,
		target: RefreshTarget,
		place: PresetPlace = "config"
	): void {
		this.include.push( { type: "file", fileName, place, target } );
	}
	
	public registerRefreshableFunc( target: RefreshTarget ): void {
		this.include.push( { type: "func", target } );
	}
	
	public async do(): Promise<string[]> {
		this.isRefreshing = true;
		const respList: string[] = [];
		for ( let setting of this.include ) {
			try {
				let config: any = undefined;
				if ( setting.type === "file" ) {
					const { fileName, place } = setting;
					config = bot.file.loadYAML( fileName, place );
				}
				const msg: string = await setting.target.refresh( config );
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