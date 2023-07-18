import $http from "&/api";
import { defineStore } from "pinia";
import { reactive, toRefs } from "vue";

export const useAppStore = defineStore( "app", () => {
	const state = reactive( {
		hasRoot: false,
		device: "desktop",
		deviceWidth: 0,
		deviceHeight: 0,
		showTab: false
	} );
	
	const CONFIG_REFRESH = async () => {
		return await $http.BOT_REFRESH.post();
	}
	
	const BOT_RESTART = async () => {
		try {
			await $http.BOT_RESTART.post();
		} catch ( error ) {
			throw new Error( "重启 BOT 出错" );
		}
	}
	
	return {
		...toRefs( state ),
		CONFIG_REFRESH,
		BOT_RESTART
	}
} )