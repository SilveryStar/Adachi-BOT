import { Command } from "../../../modules/command";
import { AuthLevel } from "../../../modules/auth";
import { groupCommands, privateCommands } from "../../../bot";

function getHeader(
	key: string,
	type: string = "private",
	level: AuthLevel = AuthLevel.User
): string[] {
	const commands: Command[] = type === "private"
		                      ? privateCommands[level]
							  : groupCommands[level];
	return commands.find( el => el.key === key )?.getHeaders() || [];
}

export { getHeader }