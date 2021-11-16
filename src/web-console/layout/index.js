import Theme from "./theme.js";
const { defineComponent, onBeforeMount, onUnmounted, ref, computed } = Vue;

export default defineComponent( {
	name: "Layout",
	components: { Theme },
	template: "<Theme :isMobile='isMobile'/>",
	setup() {
		const width = ref( 0 );
		const isMobile = computed( () => {
			return width.value <= 768;
		} );
		const onLayoutResize = () => {
			width.value = document.body.clientWidth;
		};
		
		onBeforeMount( () => {
			onLayoutResize();
			addEventListener( "resize", onLayoutResize );
		} );
		onUnmounted( () => {
			addEventListener( "resize", onLayoutResize );
		} );
		
		return { isMobile };
	}
} );