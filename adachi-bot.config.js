module.exports = {
	apps: [ {
		name: "adachi-bot",
		cwd: "./",
		script: "app.ts",
		min_uptime: "1000",
		interpreter: "./node_modules/.bin/ts-node",
		interpreter_args: "-r tsconfig-paths/register",
		exec_mode: "cluster",
		instances: 1,
		autorestart: false
	} ]
}