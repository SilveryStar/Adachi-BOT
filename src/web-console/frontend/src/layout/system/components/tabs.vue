<template>
	<div v-if="showTab" class="header-tab">
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
	</div>
</template>

<script lang="ts" setup>
import {  ref, watch } from "vue";
import { RouteRecordRaw, useRoute } from "vue-router";
import systemRoutes from "@/router/system";
import { useAppStore } from "@/store";

const route = useRoute();
const app = useAppStore();

const routeList = ref<RouteRecordRaw[]>([]);
const showTab = ref(false);

watch( () => route.path, () => {
	const parentRoute = systemRoutes.find( r => {
		return r.children?.find( c => c.name === route.name );
	} );
	if ( parentRoute ) {
		const children = parentRoute.children || [];
		routeList.value = children.filter( c => c.meta?.nav === true );
	} else {
		routeList.value = [];
	}
	const showTabState = routeList.value.length !== 0;
	app.showTab = showTab.value = showTabState;
	document.body.style.setProperty( "--extra-header", showTabState ? "40px" : "0px" );
}, { immediate: true } );
</script>

<style lang="scss" scoped>
.header-tab {
	padding: 0 18px;
	height: var(--nav-height);
	border-top: 1px solid #e6e6e6;
	box-sizing: border-box;

	.el-scrollbar {
		height: 100%;
	}

	.tab-list {
		display: flex;
		align-items: center;
		column-gap: 10px;
		height: var(--nav-height);

		> a {
			position: relative;
			display: block;
			padding: 11px 10px;
			font-size: 14px;
			color: #999;
			white-space: nowrap;
			transition: color .2s ease-out;

			&.active,
			&:hover {
				color: #333;

				&::after {
					opacity: 1;
					transform: scaleX(1);
				}
			}

			&::after {
				content: "";
				position: absolute;
				bottom: 2px;
				left: 0;
				right: 0;
				height: 2px;
				background-color: #409EFF;
				transform: scaleX(0);
				opacity: 0;
				transition: transform .2s ease-out, opacity .2s ease-out;
			}
		}
	}
}
</style>