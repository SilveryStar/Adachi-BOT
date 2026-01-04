import JWT from "jsonwebtoken";

export function getToken( secret: string, userID: number ): string {
	return JWT.sign( {
		uid: userID
	}, secret, {
		expiresIn: "24h",
		algorithm: "HS256"
	} );
}

export function validateToken( secret: string, token: string ) {
	try {
		const verify = JWT.verify( token, secret );
		if ( typeof verify === "string" ) {
			return false;
		}
		const exp = verify.exp!;
		const current = Math.floor( Date.now() / 1000 )
		return current < exp;
	} catch ( err ) {
		return false;
	}
}