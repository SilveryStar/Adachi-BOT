<template>
	<header class="header-view">
		<div class="header-menu">
			<div class="nav-left">
				<div class="nav-btn" @click="toggle">
					<i :class="isOpen ? 'icon-close' : 'icon-open'"></i>
				</div>
				<el-breadcrumb separator="/">
					<transition-group name="breadcrumb-transform">
						<el-breadcrumb-item v-for="(b, bKey) of state.breadcrumbs" :key="bKey">
							<span v-if="bKey === state.breadcrumbs.length - 1">{{ b.meta?.title }}</span>
							<a v-else @click="toLink(b)">{{ b.meta?.title }}</a>
						</el-breadcrumb-item>
					</transition-group>
				</el-breadcrumb>
			</div>

			<ul class="nav-right">
				<li class="nav-btn" @click.stop="changeThem">
					<i v-if="isDark" class="icon-taiyang"></i>
					<i v-else class="icon-yueliang"></i>
				</li>
				<el-button type="primary" :loading="state.refreshLoading" @click="configRefresh" link>刷新配置
				</el-button>
				<el-button type="primary" :loading="state.restartLoading" @click="botRestart" link>重启BOT</el-button>
				<li class="nav-btn" @click="accountLogout">
					<i class="icon-exit"></i>
				</li>
			</ul>
		</div>
		<Tabs/>
	</header>
</template>

<script lang="ts" setup>
import { watch, reactive, ref } from "vue";
import { useAppStore, useUserStore } from "&/store";
import Tabs from "./tabs.vue";
import { useRouter, useRoute, RouteLocationMatched } from "vue-router";
import { ElNotification, ElMessageBox } from "element-plus";
import { Sunny,Moon } from '@element-plus/icons-vue'
import { useDark, useToggle } from "@vueuse/core";

const isDark = useDark()

const changeThem  = () => {
	useToggle(isDark)
	isDark.value = !isDark.value
}


interface IState {
	breadcrumbs: RouteLocationMatched[];
	refreshLoading: boolean;
	restartLoading: boolean;
}

const emits = defineEmits<{
	( e: "toggle", state: boolean ): void;
}>();

const props = withDefaults( defineProps<{
	isOpen?: boolean;
}>(), {
	isOpen: false
} );

/* 切换开关状态 */
const toggle = () => {
	emits( "toggle", !props.isOpen );
}

const state: IState = reactive( {
	breadcrumbs: [],
	refreshLoading: false,
	restartLoading: false
} );

/* 判断当前路由是否为 home 页 */
const isHomeRoute = ( currenRoute: RouteLocationMatched ) => {
	return ( <string | undefined>currenRoute.name )?.trim().toLocaleLowerCase() === "Home".toLocaleLowerCase();
}

const route = useRoute();

/* 获取面包屑数组 */
function getBreadcrumb() {
	let matched = route.matched.filter( r => r.meta?.title );
	const first = matched[0];
	if ( !isHomeRoute( first ) ) {
		const homeRoute: RouteLocationMatched[] = <any>[ { path: "/system/home", meta: { title: '首页' } } ];
		matched = homeRoute.concat( matched );
	}
	state.breadcrumbs = matched.filter( ( item ) => {
		return item.meta?.title && item.meta?.breadcrumb !== false
	} )
}

watch( () => route.path, () => {
	getBreadcrumb();
}, { immediate: true } )

const router = useRouter();
const user = useUserStore();
/* 退出登录 */
const accountLogout = async () => {
	await user.USER_LOGOUT();
	await router.push( "/login" );
}

/* 点击跳转 */
const toLink = ( { redirect, path }: RouteLocationMatched ) => {
	if ( redirect && typeof redirect === "string" ) {
		router.push( redirect );
	} else {
		router.push( path );
	}
}

const app = useAppStore();
/* 刷新配置 */
const configRefresh = async () => {
	state.refreshLoading = true;
	try {
		await app.CONFIG_REFRESH();
		ElNotification( {
			title: "成功",
			message: "刷新配置成功。",
			type: "success",
			duration: 2000
		} );
	} catch {
	}
	state.refreshLoading = false;
}

/* 重启bot */
const botRestart = () => {
	state.restartLoading = true;
	app.BOT_RESTART().then( () => {
		ElMessageBox.alert( "重启成功，页面将在10秒后自动刷新。", "提示", {
			confirmButtonText: "确定",
			type: "warning",
			center: true
		} );
		setTimeout( () => {
			location.reload();
		}, 10000 );
	} ).catch( () => {
		state.restartLoading = false;
	} );
}
</script>

<style lang="scss" scoped>
.header-view {
	color: #000;
	position: relative;
	user-select: none;
	flex-shrink: 0;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
	z-index: 100;

	.header-menu {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 18px;
		height: var(--header-height);

		.nav-left {
			display: flex;
			align-items: center;

			.el-breadcrumb {
				margin-left: 18px;

				.el-breadcrumb__inner {
					span,
					a {
						font-size: 14px;
						line-height: 20px;
						font-weight: 500;
						color: #666;
					}
				}
			}
		}

		/* 头部按钮样式 */
		.nav-right {
			display: flex;
			align-items: center;
			column-gap: 10px;

			.nav-btn {
				padding: 7px;
				border-radius: 4px;
				cursor: pointer;
				transition: background-color .3s;

				&:hover {
					background-color: #f0f2f5;
				}

				> i {
					font-size: 20px;
					font-weight: 300;
				}
			}
		}
	}
}
</style>