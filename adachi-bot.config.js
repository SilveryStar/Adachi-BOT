module.exports = {
	apps: [ {
		name: "adachi-bot",
		cwd: "./",
		script: "app.ts",
		min_uptime: "1000",
		interpreter: "./node_modules/.bin/ts-node",
		interpreter_args: "-r tsconfig-paths/register",
		autorestart: false
	} ]
}