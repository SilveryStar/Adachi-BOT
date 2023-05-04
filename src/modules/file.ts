import { resolve } from "path"
import { parse, stringify } from "yaml";
import * as fs from "fs";

export type PresetPlace = "config" | "plugin" | "root";

export type FileType = "directory" | "file" | null;

type Tuple<T, N extends number, L extends any[] = []> =
	L["length"] extends N ? L : Tuple<T, N, [ ...L, T ]>;
type Union<T, N extends number, L extends any[] = [ T ]> =
	L["length"] extends N ? L[number] : Union<T, N, [ ...L, Tuple<T, L["length"]> ]>;
type UpdateIndex = Union<string, 10>;

interface ManagementMethod {
	isExist( path: string ): boolean;
	getFileType( path: string ): FileType;
	getFilePath( path: string, place?: PresetPlace ): string;
	renameFile( fileName: string, newName: string, place?: PresetPlace ): void;
	readFile( fileName: string, place: PresetPlace ): string;
	readFileByStream( fileName: string, place: PresetPlace, highWaterMark?: number ): Promise<string>;
	createDir( dirName: string, place?: PresetPlace, recursive?: boolean ): boolean;
	getDirFiles( dirName: string, place?: PresetPlace ): string[];
	createFile( fileName: string, data: any, place?: PresetPlace ): boolean;
	createFileRecursion( fileName: string, data: any, place?: PresetPlace ): boolean;
	createYAML( ymlName: string, data: any, place?: PresetPlace ): boolean;
	loadFile( fileName: string, place?: PresetPlace ): any;
	loadYAML( ymlName: string, place?: PresetPlace ): Record<string, any> | null;
	writeYAML( ymlName: string, data: any, place?: PresetPlace ): void;
	writeFile( fileName: string, data: any, place?: PresetPlace ): void;
	updateYAML( ymlName: string, data: any, place?: PresetPlace, ...index: string[] ): void;
	// updateYAMLs( ymlName: string, data: Array<{ index: UpdateIndex, data: any }>, place?: PresetPlace ): void;
}

export default class FileManagement implements ManagementMethod {
	public readonly root: string;
	public readonly config: string;
	public readonly plugin: string;
	
	constructor( root: string ) {
		this.root = root;
		this.config = resolve( root, "config" );
		this.plugin = resolve( root, "src/plugins" );
	}
	
	public isExist( path: string ): boolean {
		try {
			fs.accessSync( path );
			return true;
		} catch ( error ) {
			return false;
		}
	}
	
	public getFileType( fileName: string, place: PresetPlace = "config" ): FileType {
		try {
			const path: string = this.getFilePath( fileName, place );
			const stats = fs.statSync(path);
			if ( stats.isFile() ) {
				return "file";
			} else {
				return "directory";
			}
		} catch ( error ) {
			return null;
		}
	}
	
	public getFilePath( path: string, place: PresetPlace = "config" ): string {
		const h: string = place === "config" ? this.config
			: place === "plugin" ? this.plugin : this.root;
		return resolve( h, path );
	}
	
	public renameFile( fileName: string, newName: string, place: PresetPlace = "config" ): void {
		const oldPath: string = this.getFilePath( fileName, place );
		const newPath: string = this.getFilePath( newName, place );
		fs.renameSync( oldPath, newPath );
	}
	
	public readFile( fileName: string, place: PresetPlace ): string {
		const path: string = this.getFilePath( fileName, place );
		return fs.readFileSync( path, "utf-8" );
	}
	
	public readFileByStream( fileName: string, place: PresetPlace, highWaterMark: number = 64 ): Promise<string> {
		return new Promise( ( resolve, reject ) => {
			const path: string = this.getFilePath( fileName, place );
			const rs = fs.createReadStream( path, { highWaterMark: highWaterMark * 1024 } );
			const dataList: Buffer[] = [];
			rs.on( "data", ( chunk ) => {
				dataList.push( <Buffer>chunk );
			} );
			rs.on( "end", () => {
				const data = Buffer.concat( dataList ).toString( "utf-8" );
				resolve( data );
			} )
			rs.on( "error", ( error ) => {
				reject( error );
			} );
		} )
	}
	
	public createDir( dirName: string, place: PresetPlace = "config", recursive: boolean = false ): boolean {
		const path: string = this.getFilePath( dirName, place );
		const exist: boolean = this.isExist( path );
		if ( !exist ) {
			fs.mkdirSync( path, { recursive } );
		}
		return exist;
	}
	
	public getDirFiles( dirName: string, place: PresetPlace = "config" ): string[] {
		const path: string = this.getFilePath( dirName, place );
		return fs.readdirSync( path );
	}
	
	public createFile( fileName: string, data: any, place: PresetPlace = "config" ): boolean {
		const path: string = this.getFilePath( fileName, place );
		const exist: boolean = this.isExist( path );
		if ( !exist ) {
			this.writeFile( fileName, data, place );
		}
		return exist;
	}
	
	public createFileRecursion( fileName: string, data: any, place: PresetPlace = "config" ): boolean {
		const fileList = fileName.split( "/" );
		// 遍历创建父级目录
		const filePath = fileList.reduce( ( prev, cur  ) => {
			this.createDir( prev, place );
			return `${prev}/${cur}`;
		} );
		const exist: boolean = this.createFile(filePath, data, place);
		return exist;
	}
	
	public createYAML( ymlName: string, data: any, place: PresetPlace = "config" ): boolean {
		const path: string = this.getFilePath( ymlName, place ) + ".yml";
		const exist: boolean = this.isExist( path );
		if ( !exist ) {
			this.writeYAML( ymlName, data, place );
		}
		return exist;
	}
	
	public loadFile( fileName: string, place: PresetPlace = "config" ): string {
		const path: string = this.getFilePath( fileName, place );
		try {
			return fs.readFileSync( path, "utf-8" );
		} catch {
			return "";
		}
	}
	
	public loadYAML( ymlName: string, place: PresetPlace = "config" ): Record<string, any> | null {
		const path: string = this.getFilePath( ymlName, place ) + ".yml";
		try {
			const file: string = fs.readFileSync( path, "utf-8" );
			return parse( file ) || null;
		} catch {
			return null;
		}
	}
	
	public writeFile( fileName: string, data: any, place: PresetPlace = "config" ): void {
		const path: string = this.getFilePath( fileName, place );
		const opened: number = fs.openSync( path, "w" );
		fs.writeSync( opened, data );
		fs.closeSync( opened );
	}
	
	public writeYAML( ymlName: string, data: any, place: PresetPlace = "config" ): void {
		const path: string = this.getFilePath( ymlName, place ) + ".yml";
		const opened: number = fs.openSync( path, "w" );
		fs.writeSync( opened, stringify( data ) );
		fs.closeSync( opened );
	}
	
	public updateYAML(
		ymlName: string,
		data: any,
		place: PresetPlace = "config",
		...index: string[]
	): void {
		const oldData: any = this.loadYAML( ymlName, place ) || {};
		// @ts-ignore
		const newData: any = set( oldData, index, data );
		this.writeYAML( ymlName, newData, place );
	}
	
	// public updateYAMLs(
	// 	ymlName: string,
	// 	data: Array<{ index: UpdateIndex; data: any }>,
	// 	place: PresetPlace = "config"
	// ): void {
	// 	const oldData: any = this.loadYAML( ymlName, place );
	//
	// }
}