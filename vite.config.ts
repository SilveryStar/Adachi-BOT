import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import http from "http";

// https://vitejs.dev/config/
export default () => {
	return defineConfig( {
		root: __dirname,
		base: "/",
		publicDir: "./public",
		plugins: [ vue() ],
		resolve: {
			alias: {
				"ROOT": path.resolve( __dirname, "./app.ts" ),
				"@": path.resolve( __dirname, "./src" ),
				"#": path.resolve( __dirname, "./src/plugins" ),
				"&": path.resolve( __dirname, "./src/web-console/frontend" )
			}
		},
		logLevel: "silent",
		build: {
			rollupOptions: {
				input: {
					console: path.resolve(__dirname, "./src/web-console/frontend/index.html"),
				}
			},
		},
		optimizeDeps: {
			exclude: [ "fsevents" ]
		}
	} )
}
