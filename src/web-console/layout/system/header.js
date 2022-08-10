const template = `<header class="header-view">
	<div class="header-menu">
		<div class="nav-left">
			<div class="nav-btn" @click="toggle">
				<i :class="isOpen ? 'icon-close' : 'icon-open'"></i>
			</div>
			<el-breadcrumb separator="/">
    			<transition-group name="breadcrumb-transform">
    		  		<el-breadcrumb-item v-for="(b, bKey) of breadcrumbs" :key="bKey">
    		    		<span v-if="bKey === breadcrumbs.length - 1">{{ b.meta?.title }}</span>
    		    		<a v-else @click="toLink(b)">{{ b.meta?.title }}</a>
    		  		</el-breadcrumb-item>
    			</transition-group>
  			</el-breadcrumb>
		</div>
		<div class="nav-btn" @click="accountLogout">
			<i class="icon-exit"></i>
		</div>
	</div>
	<Tabs />
</header>`;

import Tabs from "./tabs.js";

const { defineComponent, ref, watch, inject } = Vue;
const { useRouter, useRoute } = VueRouter;

export default defineComponent( {
	name: "NavView",
	template,
	components: {
		Tabs
	},
	emits: [ "toggle" ],
	props: {
		isOpen: {
			type: Boolean,
			default: false
		}
	},
	setup( props, { emit } ) {
		const router = useRouter();
		const route = useRoute();
		const { USER_LOGOUT } = inject( "user" );
		
		// 面包屑数组
		const breadcrumbs = ref( [] );
		
		/* 判断当前路由是否为 home 页 */
		function isHomeRoute( currenRoute ) {
			return currenRoute.name?.trim().toLocaleLowerCase() === "Home".toLocaleLowerCase();
		}
		
		/* 获取面包屑数组 */
		function getBreadcrumb() {
			let matched = route.matched.filter( r => r.meta?.title );
			const first = matched[0];
			if ( !isHomeRoute( first ) ) {
				matched = [ { path: '/system/home', meta: { title: '首页' } } ].concat( matched );
			}
			breadcrumbs.value = matched.filter( ( item ) => {
				return item.meta?.title && item.meta?.breadcrumb !== false
			} )
		}
		
		/* 退出登录 */
		function accountLogout() {
			USER_LOGOUT().then( () => {
				router.push( "/login" );
			} )
		}
		
		/* 切换开关状态 */
		function toggle() {
			emit( "toggle", !props.isOpen );
		}
		
		watch( () => route.path, () => {
			getBreadcrumb();
		}, { immediate: true } )
		
		/* 点击跳转 */
		function toLink( { redirect, path } ) {
			if ( redirect ) {
				router.push( redirect );
			} else {
				router.push( path );
			}
		}
		
		return {
			breadcrumbs,
			toLink,
			toggle,
			accountLogout
		}
	}
} );