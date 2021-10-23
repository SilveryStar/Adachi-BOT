import { Abyss } from "./abyss";
import { BBS } from "./hoyobbs";
import { Character } from "./character";
import { UserInfo } from "./user-info";
import { Note } from "./note";

export type ResponseDataType = Abyss | BBS | Character | UserInfo | Note;

export interface ResponseBody {
	retcode: number;
	message: string;
	data: ResponseDataType;
}