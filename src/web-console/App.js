const template = `<component :is="layout" :isMobile="isMobile"></component>`

import * as l from "./layout/index.js";
const { defineComponent, ref, onBeforeMount, onUnmounted, computed } = Vue;
const { useRoute } = VueRouter;

export default defineComponent( {
	name: "App",
	template,
	components: {
		BlankLayout: l.BlankLayout,
		SystemLayout: l.SystemLayout
	},
	setup() {
		const route = useRoute();
		const layout = computed(() => `${ route.meta.layout || "blank" }-layout`)
		
		// 是否移动端
		const isMobile = ref( false );
		
		function onLayoutResize() {
			/* 移动端地址栏问题 */
			document.documentElement.style.setProperty( "--app-height", `${ window.innerHeight }px` );
			isMobile.value = window.innerWidth <= 768;
		}
		
		onBeforeMount( () => {
			onLayoutResize();
			window.addEventListener( "resize", onLayoutResize );
		} )
		
		onUnmounted( () => {
			window.removeEventListener( "resize", onLayoutResize );
		} );
		
		return { layout, isMobile };
	}
} );