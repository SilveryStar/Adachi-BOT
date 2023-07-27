const os = require( "os" );
const app = {
	name: "adachi-bot",
	cwd: "./",
	script: "app.ts",
	min_uptime: "1000",
	interpreter: "./node_modules/.bin/ts-node",
	env_production: {
		NODE_ENV: "production"
	},
	env_development: {
		NODE_ENV: "development"
	},
	exec_mode: "fork",
	instances: 1,
	autorestart: false
};

if ( os.platform() === "win32" ) {
	app.exec_mode = "cluster";
}
module.exports = {
	apps: [ app ]
}