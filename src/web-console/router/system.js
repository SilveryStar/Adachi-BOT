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
		name: "User",
		component: () => import("../views/user/index.js"),
		meta: { title: "用户", icon: "icon-user", layout: "system", group: "Components" }
	}
];

export default systemRoutes;