import Layout from "../layout/index.js";

const { createRouter, createWebHashHistory } = VueRouter;
const { get } = axios;

const routes = [ {
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

async function checkToken() {
	return new Promise( resolve => {
		get( "/check" )
			.then( () => {
				resolve( localStorage.getItem( "token" ) || "" )
			} )
			.catch( () => {
				localStorage.removeItem( "token" );
				resolve( "" );
			} );
	} );
}

router.beforeEach( async ( to, from, next ) => {
	const token = await checkToken();
	if ( to.path === "/" ) {
		next( { name: "Login" } );
		document.title = "登录 | Adachi-Admin";
	} else {
		if ( to.path === "/login" ) {
			if ( token ) {
				next( { name: "Home" } );
				document.title = "首页 | Adachi-Admin";
			} else {
				next();
				document.title = "登录 | Adachi-Admin";
			}
		} else {
			if ( token ) {
				next();
				document.title = `${ to.meta.title } | Adachi-Admin`
			} else {
				next( { name: "Login" } );
				document.title = "登录 | Adachi-Admin";
			}
		}
	}
} );

export default router;
