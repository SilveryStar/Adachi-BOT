import JWT from "jsonwebtoken";

export default function getToken( secret: string, userID: number ): string {
	return JWT.sign( {
		uid: userID
	}, secret, {
		expiresIn: "24h",
		algorithm: "HS256"
	} );
}