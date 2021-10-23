import { ResponseDataType } from "./response";
import { Abyss } from "./abyss";
import { BBS } from "./hoyobbs";
import { Character } from "./character";
import { UserInfo } from "./user-info";
import { CharacterInfo, InfoResponse, WeaponInfo } from "./info";
import { Note } from "./note";

/* 对于米游社 API 返回数据的类型检查 */
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

export function isNote( obj: ResponseDataType ): obj is Note {
	return obj.type === "note";
}

/* 对于 OSS 返回数据的类型检查 */
export function isWeaponInfo( obj: InfoResponse ): obj is WeaponInfo {
	return obj.type === "武器";
}

export function isCharacterInfo( obj: InfoResponse ): obj is CharacterInfo {
	return obj.type === "角色";
}