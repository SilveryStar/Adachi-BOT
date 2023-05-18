import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default ( env: any ) => {
	console.log( env );
	
	return defineConfig( {
		root: __dirname,
		base: "/dist",
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
