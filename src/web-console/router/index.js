import systemRouters from "./system.js";

const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
	{
		path: "/",
		redirect: "/login"
	}, {
		path: "/login",
		name: "Login",
		component: () => import( "../views/login.js" ),
		meta: { title: "登录", noAuth: true }
	},
	...systemRouters,
	{
		path: '/:catchAll(.*)',
		name: '404',
		meta: { title: '404', noAuth: true },
		component: () => import('../views/not-found.js')
	}
];

const router = createRouter( {
	routes,
	history: createWebHashHistory()
} );

export default router;
