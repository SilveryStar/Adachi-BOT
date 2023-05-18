import { AuthLevel } from "@/modules/management/auth";
import { GroupRole } from "icqq";

export interface GroupData {
	groupId: number;
	groupAvatar: string;
	groupName: string;
	groupAuth: AuthLevel;
	groupRole: GroupRole;
	interval: number;
	limits: string[];
}