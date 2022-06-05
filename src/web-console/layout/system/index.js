const template = `<div class="user-layout" :class="{ open: isOpen }">
	<div class="mask" :class="{ open: isOpen && isMobile }" @click="toggle( false )" />
	<AsideView :is-open="isOpen" @toggle="toggle" />
	<main class="content">
		<NavView :is-open="isOpen" @toggle="toggle" />
		<el-scrollbar wrap-class="scrollbar-wrapper">
			<MainView />
			<FooterView />
		</el-scrollbar>
	</main>
</div>`;

import NavView from "./nav.js";
import AsideView from "./aside.js";
import MainView from "./main.js";
import FooterView from "./footer.js";

const { defineComponent, ref, watch, computed, inject } = Vue;

export default defineComponent( {
	name: "SystemLayout",
	template,
	components: {
		NavView,
		AsideView,
		MainView,
		FooterView
	},
	setup() {
		const { device } = inject( "app" );
		const isOpen = ref( false );
		
		const isMobile = computed( () => device.value === "mobile" );
		
		watch( () => isMobile.value, state => {
			isOpen.value = !state;
		}, { immediate: true } );
		
		function toggle( state ) {
			isOpen.value = state;
		}
		
		return {
			isOpen,
			isMobile,
			toggle
		}
	}
} );