<template>
	<aside class="aside-view">
		<el-scrollbar wrap-class="scrollbar-wrapper">
			<el-menu :default-active="$route.path" router>
				<a class="logo-box" href="https://github.com/SilveryStar/Adachi-BOT" target="_blank">
					<img src="/image/logo-text.png" alt="ERROR" draggable="false">
<!--					<p>-->
						<p class="login-title">Adachi-BOT</p>
						<p class="login-desc">Admin</p>
<!--					</p>-->
				</a>
				<div v-for="(groupRoutes, groupName) in userRoutes" :key="groupName" class="routes-group">
					<h3 class="group-title">{{ groupName }}</h3>
					<div v-for="routes of groupRoutes" :key="routes.path">
						<el-sub-menu v-if="routes.children && routes.children.length > 1" :index="routes.path">
							<template #title>
								<i :class="routes.meta?.icon"></i>
								<span>{{ routes.meta?.title }}</span>
							</template>
							<el-menu-item v-for="route of routes.children" :key="route.path" :index="route.path"
							              @click="cancelToggle">
								<i :class="route.meta?.icon"></i>
								<span>{{ route.meta?.title }}</span>
							</el-menu-item>
						</el-sub-menu>
						<el-menu-item v-else :index="routes.path" @click="cancelToggle">
							<i :class="routes.meta?.icon"></i>
							<span>{{ routes.meta?.title }}</span>
						</el-menu-item>
					</div>
				</div>
			</el-menu>
		</el-scrollbar>
	</aside>
</template>

<script lang="ts" setup>
import { useAppStore } from "&/store";
import systemRoutes from "&/router/system";
import { RouteRecordRaw } from "vue-router";

const emits = defineEmits<{
	( e: "toggle", state: boolean ): void
}>();
const app = useAppStore();

// 关闭弹窗
function cancelToggle() {
	if ( app.device === "mobile" ) {
		emits( "toggle", false );
	}
}

/* 获取实际route列表 */
const formatRoutes = ( routes: RouteRecordRaw[], children: RouteRecordRaw[] = [] ): RouteRecordRaw[] => {
	for ( const route of routes ) {
		if ( route.meta?.nav || route.meta?.hidden ) continue;
		if ( !route.children ) {
			children.push( route );
			continue;
		}
		// 过滤隐藏子项
		const childShow = route.children.filter( item => !item.meta?.nav && !item.meta?.hidden );
		// 若仅有一个非隐藏子项，使用子项路由，否则使用路由本身
		const trueRoute = childShow.length === 1 ? childShow[0] : route;
		const trueCloneRoute = JSON.parse( JSON.stringify( trueRoute ) );
		trueCloneRoute.children = [];

		// 递归整理子路由
		if ( trueRoute.children ) {
			formatRoutes( trueRoute.children, trueCloneRoute.children );
		}
		children.push( trueCloneRoute );
	}
	return children;
}

/* 分组route列表 */
const groupRoutes = ( routes: RouteRecordRaw[] ) => {
	const routesList: Record<string, RouteRecordRaw[]> = {};
	routes.forEach( r => {
		const group = ( <string>r.meta?.group ) || "other";
		if ( !routesList[group] ) {
			routesList[group] = [];
		}
		routesList[group].push( r );
	} );
	return routesList;
}

const userRoutes = groupRoutes( formatRoutes( systemRoutes ) );
</script>

<style lang="scss" scoped>
.aside-view {
	position: fixed;
	left: 0;
	top: 0;
	width: var(--aside-width);
	height: var(--app-height);
	user-select: none;
	transition: transform .3s;
	z-index: 200;

	.el-scrollbar {
		height: 100%;
	}

	.el-menu {
		width: 100%;
		min-height: var(--app-height);

		.logo-box {
			display: flex;
			align-items: center;
			padding: 0 10px;
			height: 60px;
			box-sizing: border-box;

			> img {
				margin-right: 6px;
				width: 25px;
				height: 25px;
			}

			.login-title {
				margin-right: 3px;
				font-weight: 700;
				font-size: 22px;
			}

			.login-desc {
				font-size: 16px;
				color: #999;
			}
		}

		.routes-group {
			margin-top: 17px;

			.group-title {
				padding: 6px 21px;
				font-weight: 500;
				font-size: 14px;
				line-height: 17px;
				color: #ccc;
			}
		}

		.el-menu-item,
		.el-sub-menu__title {
			display: flex;
			align-items: center;
			color: #333;
			font-weight: 700;
			font-size: 14px;
			border-left: 4px solid transparent;

			i[class^="icon-"] {
				margin-right: 14px;
				font-size: 26px;
				font-weight: 300;
			}
		}

		.el-menu-item {
			&.is-active {
				background-color: #fff9e7 !important;
				border-left-color: var(--base-color);
			}

			&:hover {
				background-color: #f0f2f5;
			}
		}
	}
}
</style>