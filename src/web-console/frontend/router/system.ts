import { RouteRecordRaw } from "vue-router";

const systemRoutes: Array<RouteRecordRaw> = [
	{
		path: "/system",
		name: "System",
		redirect: "/system/home",
		meta: { title: "后台管理", hidden: true }
	},
	{
		path: "/system/home",
		name: "Home",
		component: () => import("&/views/home.vue"),
		meta: { title: "首页", icon: "icon-home", layout: "system", group: "Mains" }
	},
	{
		path: "/system/dashboard",
		redirect: "/system/dashboard/main",
		name: "Dashboard",
		component: () => import("&/layout/default/index.vue"),
		meta: { title: "控制台", icon: "icon-dashboard", layout: "system", group: "Mains" },
		children: [
			{
				path: "/system/dashboard/main",
				name: "DashboardMain",
				component: () => import("&/views/dashboard/index.vue"),
				meta: { title: "总览", nav: true }
			},
			{
				path: "/system/dashboard/setting",
				name: "Setting",
				component: () => import("&/views/dashboard/setting.vue"),
				meta: { title: "基本配置", nav: true }
			},
			{
				path: "/system/dashboard/commands",
				name: "Commands",
				component: () => import("&/views/dashboard/commands.vue"),
				meta: { title: "指令配置", nav: true }
			},
			// {
			// 	path: "/system/dashboard/other",
			// 	name: "OtherConfig",
			// 	component: () => import("&/views/dashboard/other.vue"),
			// 	meta: { title: "其他配置", nav: true }
			// },
			{
				path: "/system/dashboard/plugins",
				name: "PluginsConfig",
				component: () => import("&/views/dashboard/plugins.vue"),
				meta: { title: "插件配置", nav: true }
			}
		]
	},
	{
		path: "/system/log",
		name: "Log",
		component: () => import("&/views/log.vue"),
		meta: { title: "日志", icon: "icon-logs", layout: "system", group: "Components" }
	},
	{
		path: "/system/user",
		redirect: "/system/user/user",
		name: "User",
		component: () => import("&/layout/default/index.vue"),
		meta: { title: "用户", icon: "icon-user", layout: "system", group: "Components" },
		children: [
			{
				path: "/system/user/user",
				name: "UserList",
				component: () => import("&/views/user/user/index.vue"),
				meta: { title: "用户列表", nav: true },
			},
			{
				path: "/system/user/group",
				name: "GroupList",
				component: () => import("&/views/user/group/index.vue"),
				meta: { title: "群组列表", nav: true }
			}
		]
	},
	{
		path: "/system/message",
		name: "Message",
		component: () => import("&/views/message/index.vue"),
		meta: { title: "消息", icon: "icon-chat", layout: "system", group: "Components" }
	},
	{
		path: "/system/layout",
		name: "PlugLayout",
		component: () => import("&/views/pluglayout/index.vue"),
		meta: { title: "插件布局", icon: "icon-icon_buju-", layout: "system", group: "Components" }
	}
];

export default systemRoutes;