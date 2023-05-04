import { CharacterInfo, InfoResponse, WeaponInfo } from "./info";

/* 对于 OSS 返回数据的类型检查 */
export function isWeaponInfo( obj: InfoResponse ): obj is WeaponInfo {
	return obj.type === "武器";
}

export function isCharacterInfo( obj: InfoResponse ): obj is CharacterInfo {
	return obj.type === "角色";
}