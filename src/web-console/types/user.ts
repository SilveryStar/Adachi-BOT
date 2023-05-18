import { AuthLevel } from "@/modules/management/auth";
import { MemberInfo } from "icqq";

export interface UserInfo {
	userID: number;
	avatar: string;
	nickname: string;
	isFriend: boolean;
	botAuth: AuthLevel;
	interval: number;
	limits: string[];
	groupInfoList: ( string | MemberInfo )[];
	subInfo?: string[]
}