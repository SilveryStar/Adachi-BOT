import { Request } from "express";

export function getTokenByRequest(req: Request) {
	const auth = req.headers.authorization;
	if ( auth && auth.split( " " )[0] === "Bearer" ) {
		return auth.split( " " )[1]
	} else if ( req.query && req.query.token ) {
		return <string>req.query.token;
	}
	return null;
}