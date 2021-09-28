import { ResponseDataType } from "./response";
import { Abyss } from "./abyss";
import { BBS } from "./hoyobbs";
import { Character } from "./character";
import { UserInfo } from "./user-info";

export function isAbyss( obj: ResponseDataType ): obj is Abyss {
	return obj.type === "abyss";
}

export function isBBS( obj: ResponseDataType ): obj is BBS {
	return obj.type === "bbs";
}

export function isCharacter( obj: ResponseDataType ): obj is Character {
	return obj.type === "character";
}

export function isUserInfo( obj: ResponseDataType ): obj is UserInfo {
	return obj.type === "user-info";
}