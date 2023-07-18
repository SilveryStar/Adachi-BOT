import {
	createRouter,
	createWebHistory
} from "vue-router";
import systemRouters from "./system";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
	{
		path: "/",
		redirect: "/login"
	}, {
		path: "/login",
		name: "Login",
		component: () => import( "&/views/login/index.vue" ),
		meta: { title: "登录", noAuth: true }
	},
	...systemRouters,
	{
		path: '/:catchAll(.*)',
		name: '404',
		meta: { title: '404', noAuth: true },
		component: () => import('&/views/not-found.vue')
	}
];

const router = createRouter( {
	history: createWebHistory(),
	routes
} );

export default router;
