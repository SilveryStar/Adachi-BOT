import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default ( env: any ) => {
	console.log( env );
	const isDev = env.mode === "development";
	return defineConfig( {
		root: __dirname,
		base: "/",
		publicDir: "./public",
		plugins: [ vue() ],
		server: {
			hmr: isDev
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
