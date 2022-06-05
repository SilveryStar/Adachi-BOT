const { reactive, toRefs } = Vue;

export function useAppStore() {
	const state = reactive( {
		device: "desktop",
		deviceWidth: 0,
		deviceHeight: 0
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
	
	return {
		...toRefs( state ),
		SET_DEVICE,
		SET_DEVICE_WIDTH,
		SET_DEVICE_HEIGHT
	};
}