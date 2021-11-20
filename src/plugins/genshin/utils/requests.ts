import request, { Response } from "request";

export default async function requests( options: any ): Promise<any> {
	return new Promise( ( resolve, reject ) => {
		request( options, ( error: any, response: Response, body: any ) => {
			if ( error ) {
				reject( error );
			} else {
				resolve( body );
			}
		} );
	} )
		.catch( ( reason: any ) => {
			console.log( reason );
		} );
}