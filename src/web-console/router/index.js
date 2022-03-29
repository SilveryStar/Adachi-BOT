import Layout from "../layout/index.js";

const { createRouter, createWebHashHistory } = VueRouter;
const { get } = axios;

const routes = [ {
	path: "/",
	redirect: "/login"
}, {
	path: "/login",
	name: "Login",
	meta: { title: "登录" },
	component: () => import( "../view/login.js" )
}, {
	component: Layout,
	children: [ {
		path: "/home",
		name: "Home",
		meta: { title: "首页" },
		component: () => import( "../view/home.js" )
	} ]
}, {
	component: Layout,
	children: [ {
		path: "/log",
		name: "Log",
		meta: { title: "日志" },
		component: () => import( "../view/log.js" )
	} ]
}, {
	component: Layout,
	children: [ {
		path: "/user",
		name: "User",
		meta: { title: "用户" },
		component: () => import( "../view/user.js" )
	} ]
}, {
	component: Layout,
	children: [ {
		path: "/stat",
		name: "Stat",
		meta: { title: "统计" },
		component: () => import( "../view/stat.js" )
	} ]
} ];

const router = createRouter( {
	routes,
	history: createWebHashHistory()
} );

export default router;
