import { Abyss } from "./abyss";
import { BBS } from "./hoyobbs";
import { Character } from "./character";
import { UserInfo } from "./user-info";

export type ResponseDataType = Abyss | BBS | Character | UserInfo;

export interface ResponseBody {
	retcode: number;
	message: string;
	data: ResponseDataType;
}