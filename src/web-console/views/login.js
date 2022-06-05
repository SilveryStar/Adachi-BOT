const template =
	`<div class="login-base">
	<header class="login-header">
		<h3>Adachi-Admin</h3>
	</header>
	<main class="login-main">
		<div class="login-main-content">
			<div class="login-main-title">
				<a href="https://www.pixiv.net/artworks/85520334" target="_blank" draggable="false">
					<img class="login-logo" src="../public/image/logo.png" alt="ERROR" draggable="false" />
				</a>
				<h2 class="login-title">
					<span>BOT 网页控制台</span>
				</h2>
			</div>
			<div class="login-main-form">
				<el-input v-model.number="number" placeholder="BOT 账号" maxlength="13" clearable @input="val => number = val.replace(/[^\\d]/g, '')" @keyup.enter="loginByPassword" />
				<el-input v-model.trim="password" placeholder="BOT 密码" maxlength="20" clearable show-password @keyup.enter="loginByPassword" />
				<el-button type="primary" @click="loginByPassword" round>账号登入</el-button>
			</div>
		</div>
	</main>
	<footer class="login-footer">
		<span v-if="!isMobile">MIT Licensed | </span>
		<span>Adachi管理面板 ©2021 SilveryStar</span>
	</footer>
</div>`;

import router from "../router/index.js";

const { ElNotification } = ElementPlus;

const { defineComponent, ref, computed, inject } = Vue;
const { useRoute } = VueRouter;

export default defineComponent( {
	name: "Login",
	template,
	setup() {
		const number = ref( "" );
		const password = ref( "" );
		
		const route = useRoute();
		const { device } = inject( "app" );
		const { USER_LOGIN } = inject( "user" );
		
		const isMobile = computed( () => device.value === "mobile" );
		
		function loginByPassword() {
			USER_LOGIN( number.value, password.value ).then( () => {
				router.push( { path: route.query?.redirect || "/system/home" } );
			} ).catch( err => {
				ElNotification( {
					title: "提示信息",
					message: err.message,
					type: "error",
					duration: 2500
				} );
			} )
		}
		
		return {
			number,
			password,
			isMobile,
			loginByPassword
		}
	}
} );