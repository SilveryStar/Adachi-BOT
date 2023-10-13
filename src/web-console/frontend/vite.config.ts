import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue';
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig( {
	base: "/",
	plugins: [ vue() ],
	resolve: {
		alias: {
			"@": path.join( __dirname, "./src" )
		}
	},
	optimizeDeps: {
		exclude: [ "fsevents" ]
	}
} )
