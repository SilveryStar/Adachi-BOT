const template = `<aside class="aside-view">
	<el-scrollbar wrap-class="scrollbar-wrapper">
		<el-menu :default-active="$route.path" router>
			<a class="logo-box" href="https://github.com/SilveryStar/Adachi-BOT" target="_blank">
        		<img src="../../public/image/logo-text.png" alt="ERROR" draggable="false">
        		<p>
        			<span class="login-title">Adachi-BOT</span>
        			<span class="login-desc">Admin</span>
				</p>
      		</a>
      		<div v-for="group in Object.keys(userRoutes)" :key="group" class="routes-group">
      			<h3 class="group-title">{{ group }}</h3>
      			<div v-for="routes of userRoutes[group]" :key="routes.path">
      	  			<el-sub-menu v-if="routes.children && routes.children.length > 1" :class="{'is-active': route.path === routes.path}" :index="routes.path">
      	    			<template #title>
      	    				<i :class="routes.meta?.icon"></i>
      	    				<span>{{ routes.meta?.title }}</span>
			  			</template>
      	    			<el-menu-item v-for="route of routes.children" :key="route.path" :index="route.path" @click="cancelToggle">
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
</aside>`;

import systemRoutes from "../../router/system.js";

const { defineComponent, inject } = Vue;

export default defineComponent( {
	name: "AsideView",
	template,
	emits: [ "toggle" ],
	setup( props, { emit } ) {
		const { device } = inject( "app" );
		
		// 关闭弹窗
		function cancelToggle() {
			if ( device.value === "mobile" ) {
				emit( "toggle", false );
			}
		}
		
		/* 获取实际route列表 */
		function formatRoutes( routes, children = [] ) {
			for ( const route of routes ) {
				if ( route.meta?.hidden ) continue;
				if ( !route.children ) {
					children.push( route );
					continue;
				}
				// 过滤隐藏子项
				const childShow = route.children.filter( item => !item.meta?.hidden );
				// 若仅有一个非隐藏子项，使用子项路由，否则使用路由本身
				const trueRoute = childShow.length === 1 ? childShow[0] : route;
				const trueCloneRoute = JSON.parse( JSON.stringify( trueRoute ) );
				trueCloneRoute.children = [];
				
				// 递归整理子路由
				if ( trueRoute.children ) {
					getRouteList( trueRoute.children, trueCloneRoute.children );
				}
				children.push( trueCloneRoute );
			}
			return children;
		}
		
		/* 分组route列表 */
		function groupRoutes( routes ) {
			const routesList = {};
			for ( const r of routes ) {
				const group = r.meta?.group || "other";
				if ( !routesList[group] ) {
					routesList[group] = [];
				}
				routesList[group].push( r );
			}
			return routesList;
		}
		
		const userRoutes = groupRoutes( formatRoutes( systemRoutes ) );
		
		return {
			userRoutes,
			cancelToggle
		}
	}
} );