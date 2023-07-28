import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import http from "http";

// https://vitejs.dev/config/
export default ( env: any ) => {
	const isDev = env.mode === "development";
	return defineConfig( {
		root: __dirname,
		base: "/",
		publicDir: "./public",
		plugins: [ vue() ],
		server: {
			hmr: {
				server: isDev ? undefined : http.createServer( ( req, res ) => {
					res.end('adachi');
				} )
			},
			watch: {
				ignored: () => !isDev
			}
		},
		resolve: {
			alias: {
				"ROOT": path.resolve( __dirname, "./app.ts" ),
				"@": path.resolve( __dirname, "./src" ),
				"#": path.resolve( __dirname, "./src/plugins" ),
				"&": path.resolve( __dirname, "./src/web-console/frontend" )
			}
		},
		logLevel: isDev ? "info" : "silent",
		clearScreen: isDev,
		build: {
			rollupOptions: {
				input: {
					render: path.resolve(__dirname, "./src/render/index.html"),
					console: path.resolve(__dirname, "./src/web-console/frontend/index.html"),
				}
			},
		}
	} )
}
