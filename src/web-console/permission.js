import router from "./router/index.js";
import $http from "./api/index.js"
import { tokenSession } from "./utils/session.js";

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
	return new Promise( resolve => {
		$http.TOKEN_CHECK( {}, "GET" ).then( () => {
			const token = tokenSession.get();
			resolve( token );
		} ).catch( () => {
			tokenSession.remove();
			resolve( "" );
		} );
	} );
}

/* 不需要登陆白名单 */
const whiteList = [ "/login" ];

router.beforeEach( async ( to, from, next ) => {
	const hasToken = await checkToken();
	document.title = getPageTitle( to.meta.title );
	
	if ( hasToken && whiteList.includes( to.path ) ) {
		return next( { name: "Home" } );
	}
	
	if ( !hasToken && !whiteList.includes( to.path ) ) {
		// 需要权限且不存在于白名单内的目标，添加跳转来源参数后跳转至登录页.
		return next( `/login?redirect=${ to.path }` );
	}
	next();
} );