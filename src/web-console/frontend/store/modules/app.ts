import $http from "&/api";
import { defineStore } from "pinia";

export const useAppStore = defineStore( "app", {
	state: () => ( {
		device: "desktop",
		deviceWidth: 0,
		deviceHeight: 0,
		showTab: false
	} ),
	actions: {
		async CONFIG_REFRESH() {
			return await $http.BOT_REFRESH.post();
		},
		
		async BOT_RESTART() {
			try {
				await $http.BOT_RESTART.post();
			} catch ( error ) {
				throw new Error( "重启 BOT 出错" );
			}
		}
	}
} );