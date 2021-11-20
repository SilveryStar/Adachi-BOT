const template =
`<el-container
	class="layout-container"
	:class="{ mobile: isMobile }"
>
	<div
		class="mantle"
		:class="{ open: isOpen }"
		@click="toggle"
	/>
	<Header @t="toggle" :class="{ open: isOpen }"/>
	<Aside :class="{ open: isOpen }"/>
	<el-scrollbar class="main-scrollbar">
		<Main />
		<Footer :isMobile="isMobile"/>
	</el-scrollbar>
</el-container>`;

import Aside from "./aside.js";
import Main from "./main.js";
import Footer from "./footer.js";
import Header from "./header.js";
const { defineComponent, ref, watch } = Vue;
const { useRoute } = VueRouter;

export default defineComponent( {
	name: "Theme",
	components: { Header, Aside, Main, Footer },
	props: { isMobile: Boolean },
	template,
	setup( props ) {
		const route = useRoute();
		const isOpen = ref( false );
		function toggle() {
			isOpen.value = !isOpen.value;
		}
		
		watch( () => route.path, () => {
			if ( props.isMobile ) {
				setTimeout( () => toggle(), 275 );
			}
		} );

		return { toggle, isOpen };
	}
} );