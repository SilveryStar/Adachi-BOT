import { AuthLevel } from "@/modules/management/auth";
import { GroupMemberInfo } from "@/modules/lib";

export interface UserInfo {
	userID: number;
	avatar: string;
	nickname: string;
	isFriend: boolean;
	botAuth: AuthLevel;
	interval: number;
	limits: string[];
	groupInfoList: ( string | GroupMemberInfo )[];
	subInfo?: string[]
}