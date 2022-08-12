const template = `<div v-if="showTab" class="header-tab">
	<el-scrollbar class="horizontal-wrap">
		<div class="tab-list">
			<router-link
				v-for="(r, rKey) of routeList"
				:key="rKey"
				:class="{ active: $route.name === r.name }"
				:to="r.path"
			>
				{{ r.meta ? r.meta.title : r.name }}
			</router-link>
		</div>
	</el-scrollbar>
</div>`

import systemRoutes from "../../router/system.js";

const { defineComponent, reactive, toRefs, watch, inject } = Vue;
const { useRoute } = VueRouter;

export default defineComponent( {
	name: "HeaderTabs",
	template,
	setup() {
		const route = useRoute();
		const { showTab } = inject( "app" );
		
		const state = reactive( {
			routeList: [],
			showTab: false
		} )
		
		watch( () => route.path, () => {
			const parentRoute = systemRoutes.find( r => {
				return r.children?.find( c => c.name === route.name );
			} );
			if ( parentRoute ) {
				const children = parentRoute.children || [];
				state.routeList = children.filter( c => c.meta?.nav === true );
			} else {
				state.routeList = [];
			}
			const showTabState = state.routeList.length !== 0;
			showTab.value = state.showTab = showTabState;
			document.body.style.setProperty( "--extra-header", showTabState ? "40px" : "0px" );
		}, { immediate: true } )
		
		return {
			...toRefs( state )
		};
	}
} )