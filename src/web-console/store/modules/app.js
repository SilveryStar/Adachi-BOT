import $http from "../../api/index.js";

const { reactive, toRefs } = Vue;

export function useAppStore() {
	const state = reactive( {
		device: "desktop",
		deviceWidth: 0,
		deviceHeight: 0,
		showTab: false
	} );
	
	function SET_DEVICE( device ) {
		state.device = device;
	}
	
	function SET_DEVICE_WIDTH( width ) {
		state.deviceWidth = width;
	}
	
	function SET_DEVICE_HEIGHT( height ) {
		state.deviceHeight = height;
	}
	
	function SET_SHOW_TAB( showTab ) {
		state.showTab = showTab;
	}
	
	async function CONFIG_REFRESH() {
		return await $http.BOT_REFRESH();
	}
	
	async function BOT_RESTART() {
		await $http.BOT_RESTART();
	}
	
	return {
		...toRefs( state ),
		SET_DEVICE,
		SET_DEVICE_WIDTH,
		SET_DEVICE_HEIGHT,
		SET_SHOW_TAB,
		CONFIG_REFRESH,
		BOT_RESTART
	};
}