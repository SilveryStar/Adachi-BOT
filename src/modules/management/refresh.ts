import FileManagement, { PresetPlace } from "@/modules/file";
import Command from "@/modules/command/main";
import bot from "ROOT";

interface RefreshTargetFun {
	( ...args: any[] ): Promise<string | void> | string | void;
}

interface RefreshTargetFile {
	[P: string]: any;
	refresh: RefreshTargetFun;
}

export type RefreshTarget<T extends "fun" | "file"> = T extends "fun" ? RefreshTargetFun : RefreshTargetFile;

export interface RefreshCatch {
	log: string;
	msg: string;
}

interface RefreshableFile {
	type: "file";
	fileName: string;
	place: PresetPlace;
	target: RefreshTarget<"file">;
}

interface RefreshableObj {
	type: "obj";
	target: RefreshTarget<"file">;
}

interface RefreshableFunc {
	type: "func";
	target: RefreshTarget<"fun">;
}

type RefreshableSetting = RefreshableFile | RefreshableFunc | RefreshableObj;

interface RefreshableMethod {
	register( fileName: string, target: RefreshTarget<"file">, place?: PresetPlace ): void;
	register( target: RefreshTarget<"file"> ): void;
	register( target: RefreshTarget<"fun"> ): void;
}

export default class Refreshable implements RefreshableMethod {
	private readonly include: RefreshableSetting[] = [];
	public isRefreshing: boolean = false;
	
	public register( fileName: string, target: RefreshTarget<"file">, place?: PresetPlace ): void;
	public register( target: RefreshTarget<"file"> ): void;
	public register( target: RefreshTarget<"fun"> ): void;
	
	public register(
		fileNameOrTarget: string | RefreshTarget<"fun"> | RefreshTarget<"file">,
		target?: RefreshTarget<"file">,
		place: PresetPlace = "config"
	): void {
		if ( typeof fileNameOrTarget === "string" ) {
			target && this.include.push( { type: "file", fileName: fileNameOrTarget, place, target } );
		} else if ( typeof fileNameOrTarget === "function" ) {
			this.include.push( { type: "func", target: fileNameOrTarget } );
		} else {
			this.include.push( { type: "obj", target: fileNameOrTarget } );
		}
	}
	
	public async do(): Promise<string[]> {
		this.isRefreshing = true;
		const respList: string[] = [];
		for ( let setting of this.include ) {
			try {
				let message: string | void;
				if ( setting.type === "file" ) {
					const { fileName, place } = setting;
					const config: any = bot.file.loadYAML( fileName, place ) || {};
					message = await setting.target.refresh( config );
				} else if ( setting.type === "func" ) {
					message = await setting.target();
				} else {
					message = await setting.target.refresh();
				}
				if ( message ) {
					respList.push( message );
				}
			} catch ( error ) {
				const err = <RefreshCatch>error;
				respList.push( err.msg );
			}
		}
		this.isRefreshing = false;
		return respList;
	}
}