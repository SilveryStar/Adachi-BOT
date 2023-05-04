import { createApp } from "vue";
import router from "./router";
import { createStore } from "./store";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/styles/index.scss";

import "./permission";

const app = createApp( App );
const pinia = createStore();
app.use( router )
	.use( pinia )
	.use( ElementPlus )
	.mount( "#app" );
