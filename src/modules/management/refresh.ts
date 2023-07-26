import { PresetPlace } from "@/modules/file";
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
	register( fileName: string, target: RefreshTarget<"file">, place?: PresetPlace, type?: string ): void;
	register( target: RefreshTarget<"file">, type?: string ): void;
	register( target: RefreshTarget<"fun">, type?: string ): void;
	do(): Promise<string[]>;
}

export default class Refreshable implements RefreshableMethod {
	private systemKey = Symbol( "adachi" );
	private static _instance: Refreshable | null = null;
	private readonly include: Map<string | symbol, RefreshableSetting[]> = new Map();
	public isRefreshing: boolean = false;
	
	public static getInstance() {
		if ( !Refreshable._instance ) {
			Refreshable._instance = new Refreshable();
		}
		return Refreshable._instance;
	}
	
	public register( fileName: string, target: RefreshTarget<"file">, place?: PresetPlace, type?: string ): void;
	public register( target: RefreshTarget<"file">, type?: string ): void;
	public register( target: RefreshTarget<"fun">, type?: string ): void;
	
	public register(
		fileNameOrTarget: string | RefreshTarget<"fun"> | RefreshTarget<"file">,
		targetOrType?: RefreshTarget<"file"> | string,
		place: PresetPlace = "config",
		type?: string
	): void {
		let registerKey: string | symbol = type || this.systemKey;
		if ( typeof targetOrType === "string" ) {
			registerKey = targetOrType;
		}
		const events = this.include.get( registerKey ) || [];
		if ( typeof fileNameOrTarget === "string" ) {
			typeof targetOrType === "object" && events.push( { type: "file", fileName: fileNameOrTarget, place, target: targetOrType } );
		} else if ( typeof fileNameOrTarget === "function" ) {
			events.push( { type: "func", target: fileNameOrTarget } );
		} else {
			events.push( { type: "obj", target: fileNameOrTarget } );
		}
		this.include.set( registerKey, events );
	}
	
	public logout( type: string ) {
		this.include.delete( type );
	}
	
	public async do(): Promise<string[]> {
		this.isRefreshing = true;
		const respList: string[] = [];
		for ( let setting of [ ...this.include.values() ].flat() ) {
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