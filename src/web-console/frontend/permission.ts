import router from "./router";
import $http from "./api"
import { tokenSession } from "./utils/session";
import { useAppStore } from "&/store";

/* 设置当前网站标题 */
function getPageTitle( pageTitle ) {
	const defaultTitle = "Adachi-Admin";
	if ( pageTitle ) {
		return `${ pageTitle } | ${ defaultTitle }`;
	}
	return defaultTitle;
}

/* 检查token */
async function checkToken() {
	try {
		await $http.TOKEN_CHECK.get();
		return true;
	} catch ( error ) {
		tokenSession.remove();
		return false;
	}
}

/* 检查 token */
async function checkHasRoot(): Promise<boolean> {
	const hasRoot = await $http.ROOT_CHECK.get();
	return hasRoot.data;
}

/* 不需要登陆白名单 */
const whiteList = [ "/login" ];

router.beforeEach( async ( to, from, next ) => {
	document.title = getPageTitle( to.meta.title );
	const app = useAppStore();
	
	if ( !app.hasRoot ) {
		app.hasRoot = await checkHasRoot();
	}
	if ( !app.hasRoot ) {
		if ( to.name !== "Login" || to.query.createRoot !== "true" ) {
			/* 无账号时跳转创建账号 */
			return next( {
				name: "Login",
				query: {
					createRoot: "true"
				}
			} );
		}
	} else {
		if ( to.name === "Login" && to.query.createRoot === "true" ) {
			return next( { name: "Login" } );
		}
	}
	
	const hasToken = await checkToken();
	
	if ( hasToken && whiteList.includes( to.path ) ) {
		return next( { name: "Home" } );
	}
	
	if ( !hasToken && !whiteList.includes( to.path ) ) {
		// 需要权限且不存在于白名单内的目标，添加跳转来源参数后跳转至登录页.
		return next( { name: "Login" } );
	}
	next();
} );