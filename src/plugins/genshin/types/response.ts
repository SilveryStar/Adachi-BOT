import { Abyss } from "./abyss";
import { BBS } from "./hoyobbs";
import { Character } from "./character";
import { UserInfo } from "./user-info";
import { Note } from "./note";
import { Ledger } from "./ledger";
import { SignInInfo, SignInResult } from "#genshin/types/sign-in";
import { AvatarDetailRaw } from "#genshin/types/avatar";

export type ResponseDataType = Abyss | BBS | Character |
	UserInfo | Note | SignInInfo | SignInResult | Ledger | AvatarDetailRaw;

export interface ResponseBody {
	retcode: number;
	message: string;
	data: ResponseDataType;
}