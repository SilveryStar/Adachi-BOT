const { defineComponent, ref, onBeforeMount, onUnmounted } = Vue;

export default defineComponent( {
	name: "App",
	template: "<router-view :isMobile='isMobile' />",
	setup() {
		const isMobile = ref( false );
		
		function onLayoutResize() {
			/* 移动端地址栏问题 */
			document.documentElement.style.setProperty( "--app-height", `${ window.innerHeight }px` );
			isMobile.value = window.innerWidth <= 768;
		}
		
		onBeforeMount( () => {
			window.addEventListener( "resize", onLayoutResize );
			onLayoutResize();
		} )
		
		onUnmounted( () => {
			window.removeEventListener( "resize", onLayoutResize );
		} );
		
		return { isMobile };
	}
} );