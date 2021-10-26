import { accessSync, closeSync, mkdirSync, openSync, readFileSync, writeSync } from "fs";
import { parse, stringify } from "yaml";
import { resolve } from "path";
import { set } from "object-immutable-set";
import { ROOTPATH } from "../../app";

function getFilePath( name: string ): string {
	return resolve( `${ ROOTPATH }/config/${ name }.yml` );
}

function exists( path: string ): boolean {
	try {
		accessSync( path );
		return true;
	} catch ( error ) {
		return false;
	}
}

function createFolder( dirName: string ): boolean {
	const dirPath: string = resolve( `${ ROOTPATH }/${ dirName }` );
	const exist: boolean = exists( dirPath );
	if ( !exist ) {
		mkdirSync( dirPath );
	}
	return exist;
}

function createYAML( fileName: string, config: any ): boolean {
	const filePath: string = getFilePath( fileName );
	const exist: boolean = exists( filePath );
	if ( !exist ) {
		writeYAML( fileName, config );
	}
	return exist
}

function readYAML( fileName: string ): string {
	return readFileSync( getFilePath( fileName ), "utf-8" );
}

function writeYAML( fileName: string, config: any ): void {
	const filePath: string = getFilePath( fileName );
	const openedFile: number = openSync( filePath, "w" );
	writeSync( openedFile, stringify( config ) );
	closeSync( openedFile );
}

function loadYAML( fileName: string ): any {
	const file: string = readYAML( fileName );
	const config: any = parse( file );
	return config === null ? {} : config;
}

function updateYAML( fileName: string, newData: any, ...index: string[] ): void {
	const oldConfig: any = loadYAML( fileName );
	// @ts-ignore
	const newConfig: any = set( oldConfig, index, newData );
	writeYAML( fileName, newConfig );
}

export {
	loadYAML,
	readYAML,
	writeYAML,
	updateYAML,
	createYAML,
	createFolder,
	exists
}