export class RequestParamsError extends Error {
	constructor( message = "Error Params" ) {
		super( message );
		this.name = "RequestParamsError";
	}
}