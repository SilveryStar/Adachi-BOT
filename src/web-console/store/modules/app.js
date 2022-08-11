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
	
	return {
		...toRefs( state ),
		SET_DEVICE,
		SET_DEVICE_WIDTH,
		SET_DEVICE_HEIGHT,
		SET_SHOW_TAB
	};
}