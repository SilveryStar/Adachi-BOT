import App from "./App.js";
import router from "./router/index.js";
import "./permission.js"

const app = Vue.createApp( App );
app.use( ElementPlus )
	.use( router )
	.component( "v-chart", VueECharts )
	.mount( "#app" );