export interface WebAccount {
	username: string;
	password: string;
	role: "root" | "user";
	createTime: number;
}