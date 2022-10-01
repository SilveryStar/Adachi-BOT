import App from "./App.js";
import router from "./router/index.js";
import "./permission.js"
import iconFont from "./assets/iconfont/iconfont.css" assert { type: "css" };

// 不支持添加 css 文件内的 @import 内容
document.adoptedStyleSheets = [ iconFont ];

const app = Vue.createApp( App );
app.use( ElementPlus )
	.use( router )
	.mount( "#app" );