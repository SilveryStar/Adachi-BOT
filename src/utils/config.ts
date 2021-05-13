import { readFileSync } from "fs";
import { resolve } from "path";
import * as YAML from "yaml";

function loadYAML( fileName: string ): any {
	const file: string = readFileSync( resolve( `./config/${ fileName }.yml` ), "utf-8" );
	return YAML.parse( file );
}

export {
	loadYAML
}