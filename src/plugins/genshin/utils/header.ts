import { Command } from "../../../modules/command";
import { AuthLevel } from "../../../modules/auth";
import { groupCommands, privateCommands } from "../../../bot";

function getHeader(
	key: string,
	level: AuthLevel = AuthLevel.User,
	type: string = "private"
): string[] {
	const commands: Command[] = type === "private"
		                      ? privateCommands[level]
							  : groupCommands[level];
	return commands.find( el => el.key === key )?.getHeaders() || [];
}

function existHeader(
	value: string,
	key: string,
	level: AuthLevel = AuthLevel.User,
	type: string = "private"
): boolean {
	const list: string[] = getHeader( key, level, type );
	return list.includes( value );
}

export {
	getHeader,
	existHeader
}