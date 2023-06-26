import { FollowInfo } from "@/modules/command";

export interface HelpCommand {
	id: number;
	header: string;
	body: FollowInfo;
	cmdKey: string;
	detail: string;
	pluginName: string;
}

export interface HelpRouterData {
	detailCmd: string;
	commands: Record<string, HelpCommand[]>;
}