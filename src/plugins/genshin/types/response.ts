import { Abyss } from "./abyss";
import { BBS } from "./hoyobbs";
import { Character } from "./character";
import { UserInfo } from "./user-info";
import { Note } from "./note";
import { Ledger } from "./ledger";
import { SignInInfo, SignInResult } from "./sign-in";
import { AvatarDetailRaw } from "./avatar";
import { CalendarList, CalendarDetail } from "./calendar";
import { CookieToken, GetLtoken, MutiTokenResult, VerifyLtoken } from "./cookie";
import { WishList } from "./wish";

export type ResponseDataType = Abyss | BBS | Character |
	UserInfo | Note | SignInInfo | SignInResult | Ledger | AvatarDetailRaw |
	CalendarList | CalendarDetail | CookieToken | MutiTokenResult | VerifyLtoken | GetLtoken | WishList;

export interface ResponseBody<T extends ResponseDataType> {
	retcode: number;
	message: string;
	data: T;
}