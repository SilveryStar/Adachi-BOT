import { exec } from "child_process";


type ExecOptions = {
	env?: NodeJS.ProcessEnv
	timeout?: number;
	cwd?: string;
}

export async function execCommand( command: string, options?: ExecOptions ): Promise<string> {
	return new Promise( ( resolve, reject ) => {
		exec( command, {
			...options
		}, ( error, stdout, _stderr ) => {
			if ( error ) {
				reject( error );
			} else {
				resolve( stdout );
			}
		} );
	} )
}