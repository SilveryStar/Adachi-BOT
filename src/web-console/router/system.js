import DefaultLayout from  "../layout/default/index.js";

const systemRoutes = [
	{
		path: "/system",
		name: "System",
		redirect: "/system/home",
		meta: { title: "后台管理", hidden: true }
	},
	{
		path: "/system/home",
		name: "Home",
		component: () => import("../views/home.js"),
		meta: { title: "首页", icon: "icon-home", layout: "system", group: "Mains" }
	},
	{
		path: "/system/dashboard",
		name: "Dashboard",
		component: () => import("../views/dashboard.js"),
		meta: { title: "控制台", icon: "icon-dashboard", layout: "system", group: "Mains" }
	},
	{
		path: "/system/log",
		name: "Log",
		component: () => import("../views/log.js"),
		meta: { title: "日志", icon: "icon-logs", layout: "system", group: "Components" }
	},
	{
		path: "/system/user",
		redirect: "/system/user/user",
		name: "User",
		component: DefaultLayout,
		meta: { title: "用户", icon: "icon-user", layout: "system", group: "Components" },
		children: [
			{
				path: "/system/user/user",
				name: "UserList",
				component: () => import("../views/user/user/index.js"),
				meta: { title: "用户列表", nav: true },
			},
			{
				path: "/system/user/group",
				name: "GroupList",
				component: () => import("../views/user/group/index.js"),
				meta: { title: "群组列表", nav: true }
			}
		]
	},
	{
		path: "/system/message",
		name: "Message",
		component: () => import("../views/message/index.js"),
		meta: { title: "消息", icon: "icon-chat", layout: "system", group: "Components" }
	}
];

export default systemRoutes;