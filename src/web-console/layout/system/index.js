const template = `<div class="user-layout" :class="{ open: isOpen }">
	<div class="mask" :class="{ open: isOpen && isMobile }" @click="toggle( false )" />
	<AsideView :is-open="isOpen" :is-mobile="isMobile" @toggle="toggle" />
	<main class="content">
		<NavView :is-open="isOpen" @toggle="toggle" />
		<MainView />
	</main>
</div>`;

import NavView from "./nav.js";
import AsideView from "./aside.js";
import MainView from "./main.js";

const { defineComponent, ref, onMounted, watch } = Vue;

export default defineComponent( {
	name: "SystemLayout",
	template,
	components: {
		NavView,
		AsideView,
		MainView
	},
	props: {
		isMobile: {
			type: Boolean,
			default: false
		}
	},
	setup( props ) {
		const isOpen = ref( false );
		
		watch( () => props.isMobile, state => {
			isOpen.value = !state;
		}, { immediate: true } );
		
		onMounted( () => {
			isOpen.value = !props.isMobile
		} )
		
		function toggle( state ) {
			isOpen.value = state;
		}
		
		return {
			isOpen,
			toggle
		}
	}
} );