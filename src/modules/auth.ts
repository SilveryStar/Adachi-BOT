import { Redis, botConfig } from "../bot";

enum AuthLevel {
	Banned,
	User,
	Manager,
	Master
}

async function setAuthLevel( qqID: number, level: AuthLevel ): Promise<void> {
	await Redis.setString( `adachi.auth-level-${ qqID }`, level );
}

async function getAuthLevel( qqID: number ): Promise<AuthLevel> {
	if ( qqID === botConfig.master ) {
		return AuthLevel.Master;
	} else {
		const data: string | null = await Redis.getString( `adachi.auth-level-${ qqID }` );
		return data === null ? AuthLevel.User : parseInt( data );
	}
}

async function checkAuthLevel( qqID: number, limit: AuthLevel ): Promise<boolean> {
	const level: AuthLevel = await getAuthLevel( qqID );
	return level >= limit;
}

export {
	AuthLevel,
	setAuthLevel,
	getAuthLevel,
	checkAuthLevel
}