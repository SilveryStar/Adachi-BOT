import { resolve, dirname } from "path"
import { parse, stringify } from "yaml";
import * as fs from "fs";
import axios from "axios";
import compressing from "compressing";

export type PresetPlace = "config" | "plugin" | "root";

export type FileType = "directory" | "file" | null;

export type CompressType = "zip" | "tgz" | "tar";

export interface FileResponse {
	path: string;
}

export interface FileTypeResponse extends FileResponse {
	type: FileType;
}

export interface FileStatusResponse extends FileResponse {
	status: boolean;
}

type Tuple<T, N extends number, L extends any[] = []> =
	L["length"] extends N ? L : Tuple<T, N, [ ...L, T ]>;
type Union<T, N extends number, L extends any[] = [ T ]> =
	L["length"] extends N ? L[number] : Union<T, N, [ ...L, Tuple<T, L["length"]> ]>;
type UpdateIndex = Union<string, 10>;

interface ManagementMethod {
	getFilePath( path: string, place?: PresetPlace ): string;
	
	isExist( path: string ): Promise<boolean>;
	isExistSync( path: string ): boolean;
	
	getFileType( path: string ): Promise<FileTypeResponse>;
	getFileTypeSync( path: string ): FileTypeResponse;
	
	renameFile( fileName: string, newName: string, place?: PresetPlace ): Promise<void>;
	renameFileSync( fileName: string, newName: string, place?: PresetPlace ): void;
	
	createDir( dirName: string, place?: PresetPlace, recursive?: boolean ): Promise<FileStatusResponse>;
	createDirSync( dirName: string, place?: PresetPlace, recursive?: boolean ): FileStatusResponse;
	
	createParentDir( fileName: string, place?: PresetPlace ): Promise<FileStatusResponse>;
	createParentDirSync( fileName: string, place?: PresetPlace ): FileStatusResponse;
	
	getDirFiles( dirName: string, place?: PresetPlace ): Promise<string[]>;
	getDirFilesSync( dirName: string, place?: PresetPlace ): string[];
	
	copyFile( originPath: string, targetPath: string, place?: PresetPlace ): Promise<string>;
	copyFileSync( originPath: string, targetPath: string, place?: PresetPlace ): string;
	
	createFile( fileName: string, data: any, place?: PresetPlace ): Promise<FileStatusResponse>;
	createFileSync( fileName: string, data: any, place?: PresetPlace ): FileStatusResponse;
	
	loadFile( fileName: string, place?: PresetPlace, encoding?: BufferEncoding ): Promise<string | null>;
	loadFileSync( fileName: string, place?: PresetPlace, encoding?: BufferEncoding ): string | null;
	
	loadFileByStream( readSteam: fs.ReadStream ): Promise<Buffer | null>;
	loadFileByStream( fileName: string, highWaterMark?: number, place?: PresetPlace ): Promise<Buffer | null>;
	
	writeFile( fileName: string, data: any, place?: PresetPlace ): Promise<string>;
	writeFileSync( fileName: string, data: any, place?: PresetPlace ): string;
	
	deleteFile( fileName: string, place?: PresetPlace ): Promise<FileStatusResponse>;
	
	createYAML( ymlName: string, data: any, place?: PresetPlace ): Promise<FileStatusResponse>;
	createYAMLSync( ymlName: string, data: any, place?: PresetPlace ): FileStatusResponse;
	
	loadYAML( ymlName: string, place?: PresetPlace ): Promise<Record<string, any> | null>;
	loadYAMLSync( ymlName: string, place?: PresetPlace ): Record<string, any> | null;
	
	writeYAML( ymlName: string, data: any, place?: PresetPlace ): Promise<string>;
	writeYAMLSync( ymlName: string, data: any, place?: PresetPlace ): string;
	
	// updateYAML( ymlName: string, data: any, place?: PresetPlace, ...index: string[] ): Promise<string>;
	// updateYAMLSync( ymlName: string, data: any, place?: PresetPlace, ...index: string[] ): string;
	
	unCompressFile( type: CompressType, originPath: string, targetPath: string, place?: PresetPlace ): Promise<FileStatusResponse>;
	
	downloadFile<T extends string | string[]>( url: string, savePath: T, setValueCallBack?: ( data: Buffer ) => any, place?: PresetPlace, retry?: number ): Promise<T>;
	downloadFileStream(
		url: string,
		savePath: string,
		place?: PresetPlace,
		onData?: ( chunk: string | Buffer ) => void,
		highWaterMark?: number,
		retry?: number
	): Promise<string>;
	// updateYAMLs( ymlName: string, data: Array<{ index: UpdateIndex, data: any }>, place?: PresetPlace ): void;
}

export default class FileManagement implements ManagementMethod {
	private static _instance: FileManagement | null = null;
	public readonly root: string;
	public readonly config: string;
	public readonly plugin: string;
	
	constructor() {
		this.root = process.cwd();
		this.config = this.createDirSync( "config", "root" ).path;
		this.plugin = this.createDirSync( "src/plugins", "root" ).path;
	}
	
	public static getInstance() {
		if ( !FileManagement._instance ) {
			FileManagement._instance = new FileManagement();
		}
		return FileManagement._instance;
	}
	
	public getFilePath( path: string, place: PresetPlace = "config" ): string {
		const h: string = place === "config" ? this.config
			: place === "plugin" ? this.plugin : this.root;
		return resolve( h, path );
	}
	
	public isExist( path: string ): Promise<boolean> {
		return new Promise( resolve => {
			fs.access( path, error => {
				resolve( !error );
			} );
		} );
	}
	
	public isExistSync( path: string ): boolean {
		try {
			fs.accessSync( path );
			return true;
		} catch ( error ) {
			return false;
		}
	}
	
	public getFileType( fileName: string, place: PresetPlace = "config" ): Promise<FileTypeResponse> {
		return new Promise( resolve => {
			const path: string = this.getFilePath( fileName, place );
			fs.stat( path, ( error, stats ) => {
				if ( error ) {
					return resolve( { path, type: null } );
				}
				resolve( { path, type: stats.isFile() ? "file" : "directory" } );
			} );
		} );
	}
	
	public getFileTypeSync( fileName: string, place: PresetPlace = "config" ): FileTypeResponse {
		const path: string = this.getFilePath( fileName, place );
		try {
			const stats = fs.statSync( path );
			return { path, type: stats.isFile() ? "file" : "directory" };
		} catch ( error ) {
			return { path, type: null };
		}
	}
	
	public renameFile( fileName: string, newName: string, place: PresetPlace = "config" ): Promise<void> {
		const oldPath: string = this.getFilePath( fileName, place );
		const newPath: string = this.getFilePath( newName, place );
		return new Promise( resolve => {
			fs.rename( oldPath, newPath, () => {
				resolve();
			} );
		} );
	}
	
	public renameFileSync( fileName: string, newName: string, place: PresetPlace = "config" ): void {
		const oldPath: string = this.getFilePath( fileName, place );
		const newPath: string = this.getFilePath( newName, place );
		fs.renameSync( oldPath, newPath );
	}
	
	public createDir( dirName: string, place: PresetPlace = "config", recursive: boolean = true ): Promise<FileStatusResponse> {
		return new Promise( ( resolve, reject ) => {
			const path: string = this.getFilePath( dirName, place );
			this.isExist( path ).then( exist => {
				if ( exist ) {
					return resolve( { path, status: exist } );
				}
				fs.mkdir( path, { recursive }, err => {
					if ( err ) {
						return reject( err );
					}
					resolve( { path, status: exist } );
				} );
			} )
		} );
	}
	
	public createDirSync( dirName: string, place: PresetPlace = "config", recursive: boolean = true ): FileStatusResponse {
		const path: string = this.getFilePath( dirName, place );
		const exist: boolean = this.isExistSync( path );
		if ( !exist ) {
			fs.mkdirSync( path, { recursive } );
		}
		return { path, status: exist };
	}
	
	// 创建父级目录
	public async createParentDir( fileName: string, place: PresetPlace = "config" ): Promise<FileStatusResponse> {
		const parentDir: string = dirname( fileName );
		await this.createDir( parentDir, place );
		const path: string = this.getFilePath( fileName, place );
		const exist = await this.isExist( path );
		return { path, status: exist };
	}
	
	public createParentDirSync( fileName: string, place: PresetPlace = "config" ): FileStatusResponse {
		const parentDir: string = dirname( fileName );
		this.createDirSync( parentDir, place );
		const path: string = this.getFilePath( fileName, place );
		const exist = this.isExistSync( path );
		return { path, status: exist };
	}
	
	public getDirFiles( dirName: string, place: PresetPlace = "config" ): Promise<string[]> {
		return new Promise( resolve => {
			const path: string = this.getFilePath( dirName, place );
			fs.readdir( path, ( res, data ) => {
				if ( res ) {
					return resolve( [] );
				}
				resolve( data );
			} )
		} );
	}
	
	public getDirFilesSync( dirName: string, place: PresetPlace = "config" ): string[] {
		try {
			const path: string = this.getFilePath( dirName, place );
			return fs.readdirSync( path );
		} catch {
			return [];
		}
	}
	
	public async copyFile( originPath: string, targetPath: string, place: PresetPlace = "config" ): Promise<string> {
		originPath = this.getFilePath( originPath, place );
		targetPath = this.getFilePath( targetPath, place );
		const { path: tPath } = await this.createParentDir( targetPath, place );
		return new Promise( ( resolve, reject ) => {
			fs.copyFile( originPath, targetPath, error => {
				if ( error ) {
					reject( error );
				} else {
					resolve( tPath );
				}
			} )
		} );
	}
	
	public copyFileSync( originPath: string, targetPath: string, place: PresetPlace = "config" ): string {
		originPath = this.getFilePath( originPath, place );
		const { path: tPath } = this.createParentDirSync( targetPath, place );
		fs.copyFileSync( originPath, tPath );
		return tPath;
	}
	
	public async createFile( fileName: string, data: any, place: PresetPlace = "config" ): Promise<FileStatusResponse> {
		return new Promise( ( resolve, reject ) => {
			this.createParentDir( fileName, place ).then( ( { path, status } ) => {
				if ( status ) {
					return resolve( { path, status } );
				}
				fs.writeFile( path, data, error => {
					if ( error ) {
						return reject( error );
					}
					resolve( { path, status } );
				} );
			} ).catch( error => {
				reject( error );
			} )
		} );
	}
	
	public createFileSync( fileName: string, data: any, place: PresetPlace = "config" ): FileStatusResponse {
		const { path, status } = this.createParentDirSync( fileName, place );
		if ( !status ) {
			fs.writeFileSync( path, data );
		}
		return { path, status };
	}
	
	public loadFile( fileName: string, place: PresetPlace = "config", encoding: BufferEncoding = "utf-8" ): Promise<string | null> {
		return new Promise( resolve => {
			const path: string = this.getFilePath( fileName, place );
			fs.readFile( path, encoding, ( error, data ) => {
				if ( error ) {
					return resolve( null );
				}
				resolve( data );
			} );
		} );
	}
	
	public loadFileSync( fileName: string, place: PresetPlace = "config", encoding: BufferEncoding = "utf-8" ): string | null {
		const path: string = this.getFilePath( fileName, place );
		try {
			return fs.readFileSync( path, encoding );
		} catch {
			return null;
		}
	}
	
	public loadFileByStream( readSteam: fs.ReadStream ): Promise<Buffer | null>;
	public loadFileByStream( fileName: string, highWaterMark?: number, place?: PresetPlace ): Promise<Buffer | null>;
	public loadFileByStream( fileNameOrReadSteam: string | fs.ReadStream, highWaterMark: number = 64, place: PresetPlace = "config" ): Promise<Buffer | null> {
		return new Promise( ( resolve, reject ) => {
			let rs: fs.ReadStream;
			if ( typeof fileNameOrReadSteam === "string" ) {
				const path: string = this.getFilePath( fileNameOrReadSteam, place );
				rs = fs.createReadStream( path, { highWaterMark: highWaterMark * 1024 } );
			} else {
				rs = fileNameOrReadSteam;
			}
			
			const dataList: Buffer[] = [];
			rs.on( "data", ( chunk ) => {
				dataList.push( <Buffer>chunk );
			} );
			rs.on( "end", () => {
				const data = Buffer.concat( dataList );
				resolve( data );
			} )
			rs.on( "error", () => {
				resolve( null );
			} );
		} )
	}
	
	public writeFile( fileName: string, data: any, place: PresetPlace = "config" ): Promise<string> {
		return new Promise( ( resolve, reject ) => {
			this.createParentDir( fileName, place ).then( ( { path } ) => {
				fs.writeFile( path, data, ( error ) => {
					if ( error ) {
						return reject( error );
					}
					resolve( path );
				} )
			} ).catch( error => {
				reject( error );
			} )
		} );
	}
	
	public writeFileSync( fileName: string, data: any, place: PresetPlace = "config" ): string {
		const { path } = this.createParentDirSync( fileName, place );
		fs.writeFileSync( path, data );
		return path;
	}
	
	public async deleteFile( fileName: string, place: PresetPlace = "config" ): Promise<FileStatusResponse> {
		const { type: fileType, path: filePath } = await this.getFileType( fileName, place );
		if ( !fileType ) {
			return { path: filePath, status: false };
		}
		if ( fileType === "directory" ) {
			const fileList = await this.getDirFiles( fileName, place );
			const deleteResponse = await Promise.all( fileList.map( async file => {
				if ( !fileName.endsWith( "/" ) ) {
					fileName += "/";
				}
				return await this.deleteFile( fileName + file, place );
			} ) );
			const dDirRes: boolean = await new Promise( resolve => {
				fs.rmdir( filePath, ( err ) => resolve( !err ) );
			} );
			deleteResponse.push( { status: dDirRes, path: filePath } );
			const status = !deleteResponse.some( item => !item.status );
			return { status, path: filePath }
		} else {
			const status: boolean = await new Promise( resolve => {
				fs.unlink( filePath, ( err ) => resolve( !err ) );
			} );
			return { status, path: filePath };
		}
	}
	
	public createYAML( ymlName: string, data: any, place: PresetPlace = "config" ): Promise<FileStatusResponse> {
		return new Promise( ( resolve, reject ) => {
			this.createParentDir( ymlName + ".yml", place ).then( ( { path, status } ) => {
				if ( status ) {
					return resolve( { path, status } );
				}
				fs.writeFile( path, stringify( data ), error => {
					if ( error ) {
						return reject( error );
					}
					resolve( { path, status } );
				} );
			} ).catch( error => {
				reject( error );
			} )
		} );
	}
	
	public createYAMLSync( ymlName: string, data: any, place: PresetPlace = "config" ): FileStatusResponse {
		const { path, status } = this.createParentDirSync( ymlName + ".yml", place );
		if ( !status ) {
			fs.writeFileSync( path, stringify( data ) );
		}
		return { path, status };
	}
	
	public loadYAML( ymlName: string, place: PresetPlace = "config" ): Promise<Record<string, any> | null> {
		return new Promise( resolve => {
			const path: string = this.getFilePath( ymlName, place ) + ".yml";
			fs.readFile( path, "utf-8", ( error, data ) => {
				if ( error ) {
					return resolve( null );
				}
				resolve( parse( data ) || null );
			} );
		} );
	}
	
	public loadYAMLSync( ymlName: string, place: PresetPlace = "config" ): Record<string, any> | null {
		const path: string = this.getFilePath( ymlName, place ) + ".yml";
		try {
			const file: string = fs.readFileSync( path, "utf-8" );
			return parse( file ) || null;
		} catch {
			return null;
		}
	}
	
	public writeYAML( ymlName: string, data: any, place: PresetPlace = "config" ): Promise<string> {
		return new Promise( ( resolve, reject ) => {
			this.createParentDir( ymlName + ".yml", place ).then( ( { path } ) => {
				fs.writeFile( path, stringify( data ), ( error ) => {
					if ( error ) {
						return reject( error );
					}
					resolve( path );
				} )
			} ).catch( error => {
				reject( error );
			} )
		} );
	}
	
	public writeYAMLSync( ymlName: string, data: any, place: PresetPlace = "config" ): string {
		const { path } = this.createParentDirSync( ymlName + ".yml", place );
		fs.writeFileSync( path, stringify( data ) );
		return path;
	}
	
	// public async updateYAML(
	// 	ymlName: string,
	// 	data: any,
	// 	place: PresetPlace = "config",
	// 	...index: string[]
	// ): Promise<string> {
	// 	const oldData: any = ( await this.loadYAML( ymlName, place ) ) || {};
	// 	// @ts-ignore
	// 	const newData: any = set( oldData, index, data );
	// 	return await this.writeYAML( ymlName, newData, place );
	// }
	//
	// public updateYAMLSync(
	// 	ymlName: string,
	// 	data: any,
	// 	place: PresetPlace = "config",
	// 	...index: string[]
	// ): string {
	// 	const oldData: any = this.loadYAMLSync( ymlName, place ) || {};
	// 	// @ts-ignore
	// 	const newData: any = set( oldData, index, data );
	// 	return this.writeYAMLSync( ymlName, newData, place );
	// }
	
	public async unCompressFile( type: CompressType, originPath: string, targetPath: string, place: PresetPlace = "config" ): Promise<FileStatusResponse> {
		const unCompressOrigin = this.getFilePath( originPath, place );
		if ( !await this.isExist( unCompressOrigin ) ) {
			return { path: "", status: false };
		}
		
		const unCompressTarget = this.getFilePath( targetPath, place );
		await compressing[type].uncompress( unCompressOrigin, unCompressTarget );
		return { path: unCompressTarget, status: true }
	}
	
	// public async unCompressFile( type: CompressType, originPath: string, targetPath: string, place: PresetPlace = "config", highWaterMark = 64 ): Promise<FileStatusResponse> {
	// 	const unCompressOrigin = this.getFilePath( originPath, place );
	// 	if ( !await this.isExist( unCompressOrigin ) ) {
	// 		return { path: "", status: false };
	// 	}
	//
	// 	const { path: unCompressTarget } = await this.createDir( targetPath, place );
	// 	return new Promise( resolve => {
	// 		const readStream = fs.createReadStream( unCompressOrigin, { highWaterMark } );
	// 		const writeStream = new compressing[type].UncompressStream();
	//
	// 		writeStream.on( "finish", () => {
	// 			writeStream.close();
	// 			resolve( { path: unCompressTarget, status: true } );
	// 		} );
	// 		writeStream.on( "error", ( err ) => {
	// 			console.log( err )
	// 			resolve( { path: unCompressTarget, status: false } );
	// 		} );
	//
	// 		readStream.pipe( writeStream );
	// 	} )
	// }
	
	public async downloadFile<T extends string | string[]>(
		url: string,
		savePath: T,
		setValueCallBack?: ( data: Buffer ) => any,
		place: PresetPlace = "config",
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
				data = await setValueCallBack( data );
			}
			if ( typeof savePath === "string" ) {
				return <T>( await this.writeFile( savePath, data, place ) );
			} else {
				const originPath = await this.writeFile( savePath[0], data, place );
				const pathList: string[] = [ originPath ];
				for ( const path of savePath.slice( 1 ) ) {
					pathList.push( await this.copyFile( originPath, path, place ) );
				}
				return <T>pathList;
			}
		} catch ( error ) {
			if ( retry > 0 ) {
				retry--;
				return await this.downloadFile( url, savePath, setValueCallBack, place, retry );
			}
			throw error;
		}
	}
	
	public async downloadFileStream(
		url: string,
		savePath: string,
		place: PresetPlace = "config",
		onData: ( chunk: string | Buffer ) => void = () => {
		},
		highWaterMark = 64,
		retry = 3
	): Promise<string> {
		try {
			const res = await axios.get( url, {
				responseType: "stream",
				maxContentLength: Infinity,
				timeout: 10000
			} );
			const readStream: fs.ReadStream = res.data;
			
			const { path } = await this.createParentDir( savePath, place );
			
			return new Promise( ( resolve, reject ) => {
				readStream.on( "data", onData );
				const writeStream = fs.createWriteStream( path, { highWaterMark } );
				writeStream.on( "finish", () => {
					writeStream.close();
					resolve( path );
				} ).on( "error", ( err ) => {
					reject( err );
				} );
				
				readStream.pipe( writeStream );
			} );
			
		} catch ( error ) {
			if ( retry > 0 ) {
				retry--;
				return await this.downloadFileStream( url, savePath, place, onData, highWaterMark, retry );
			}
			throw error;
		}
	}
}