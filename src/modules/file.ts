import { resolve, dirname } from "path"
import { parse, stringify } from "yaml";
import * as fs from "fs";
import axios from "axios";

export type PresetPlace = "config" | "plugin" | "root";

export type FileType = "directory" | "file" | null;

export interface CreateResponse {
	exist: boolean;
	path: string;
}

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
	readFile( fileName: string, place: PresetPlace ): string | null;
	readFileByStream( fileName: string, place: PresetPlace, highWaterMark?: number ): Promise<string | null>;
	createDir( dirName: string, place?: PresetPlace, recursive?: boolean ): CreateResponse;
	getDirFiles( dirName: string, place?: PresetPlace ): string[];
	createFile( fileName: string, data: any, place?: PresetPlace ): CreateResponse;
	createYAML( ymlName: string, data: any, place?: PresetPlace ): CreateResponse;
	loadFile( fileName: string, place?: PresetPlace, encoding?: BufferEncoding ): any;
	loadYAML( ymlName: string, place?: PresetPlace ): Record<string, any> | null;
	writeYAML( ymlName: string, data: any, place?: PresetPlace ): string;
	writeFile( fileName: string, data: any, place?: PresetPlace ): string;
	updateYAML( ymlName: string, data: any, place?: PresetPlace, ...index: string[] ): string;
	downloadFile<T extends string | string[]>( url: string, savePath: T, setValueCallBack?: ( data: Buffer ) => any, place?: PresetPlace, retry?: number ): Promise<T>;
	// updateYAMLs( ymlName: string, data: Array<{ index: UpdateIndex, data: any }>, place?: PresetPlace ): void;
}

export default class FileManagement implements ManagementMethod {
	public readonly root: string;
	public readonly config: string;
	public readonly plugin: string;
	
	constructor( root: string ) {
		this.root = root;
		this.config = this.createDir( "config", "root" ).path;
		this.plugin = this.createDir( "src/plugins", "root" ).path;
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
			const stats = fs.statSync( path );
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
	
	public readFile( fileName: string, place: PresetPlace ): string | null {
		const path: string = this.getFilePath( fileName, place );
		try {
			return fs.readFileSync( path, "utf-8" );
		} catch {
			return null;
		}
	}
	
	public readFileByStream( fileName: string, place: PresetPlace, highWaterMark: number = 64 ): Promise<string | null> {
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
				resolve( null );
			} );
		} )
	}
	
	public createDir( dirName: string, place: PresetPlace = "config", recursive: boolean = true ): CreateResponse {
		const path: string = this.getFilePath( dirName, place );
		const exist: boolean = this.isExist( path );
		if ( !exist ) {
			fs.mkdirSync( path, { recursive } );
		}
		return { path, exist };
	}
	
	// 创建父级目录
	private createParentDir( fileName: string, place: PresetPlace ): CreateResponse {
		const parentDir: string = dirname( fileName );
		this.createDir( parentDir, place );
		const path: string = this.getFilePath( fileName, place );
		const exist = this.isExist( path );
		return { path, exist };
	}
	
	public getDirFiles( dirName: string, place: PresetPlace = "config" ): string[] {
		try {
			const path: string = this.getFilePath( dirName, place );
			return fs.readdirSync( path );
		} catch {
			return [];
		}
	}
	
	public createFile( fileName: string, data: any, place: PresetPlace = "config" ): CreateResponse {
		const { path, exist } = this.createParentDir( fileName, place );
		if ( !exist ) {
			fs.writeFileSync( path, data );
		}
		return { path, exist };
	}
	
	public createYAML( ymlName: string, data: any, place: PresetPlace = "config" ): CreateResponse {
		const { path, exist } = this.createParentDir( ymlName + ".yml", place );
		if ( !exist ) {
			fs.writeFileSync( path, stringify( data ) );
		}
		return { path, exist };
	}
	
	public loadFile( fileName: string, place: PresetPlace = "config", encoding: BufferEncoding = "utf-8" ): string {
		const path: string = this.getFilePath( fileName, place );
		try {
			return fs.readFileSync( path, encoding );
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
	
	public writeFile( fileName: string, data: any, place: PresetPlace = "config" ): string {
		const { path } = this.createParentDir( fileName, place );
		fs.writeFileSync( path, data );
		return path;
	}
	
	public writeYAML( ymlName: string, data: any, place: PresetPlace = "config" ): string {
		const { path } = this.createParentDir( ymlName + ".yml", place );
		fs.writeFileSync( path, stringify( data ) );
		return path;
	}
	
	public updateYAML(
		ymlName: string,
		data: any,
		place: PresetPlace = "config",
		...index: string[]
	): string {
		const oldData: any = this.loadYAML( ymlName, place ) || {};
		// @ts-ignore
		const newData: any = set( oldData, index, data );
		return this.writeYAML( ymlName, newData, place );
	}
	
	public async downloadFile<T extends string | string[]>(
		url: string,
		savePath: T,
		setValueCallBack?: ( data: Buffer ) => any,
		place: PresetPlace = "root",
		retry = 3
	): Promise<T> {
		try {
			const fileRes = await axios.get( url, {
				responseType: "arraybuffer",
				maxContentLength: Infinity,
				timeout: 10000
			} );
			let data: any = Buffer.from( fileRes.data );
			if ( setValueCallBack ) {
				data = setValueCallBack( data );
			}
			if ( typeof savePath === "string" ) {
				return <T>this.writeFile( savePath, data, place );
			} else {
				return <T>savePath.map( path => {
					return this.writeFile( path, data, place );
				} );
			}
		} catch ( error ) {
			if ( retry > 0 ) {
				retry--;
				return await this.downloadFile( url, savePath, setValueCallBack, place, retry );
			}
			throw error;
		}
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