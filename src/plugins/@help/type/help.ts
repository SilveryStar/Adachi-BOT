import { FollowInfo } from "@/modules/command";
import { MessageScope } from "@/modules/message";

export interface HelpCommand {
	id: number;
	header: string;
	body: FollowInfo;
	scope: MessageScope;
	cmdKey: string;
	detail: string;
	pluginName: string;
}

export interface HelpRouterData {
	messageType: "private" | "group";
	detailCmd: string;
	commands: Record<string, HelpCommand[]>;
}