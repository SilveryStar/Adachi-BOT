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
          		<p class="remember-account">
          			<el-checkbox v-model="rememberAccount">记住账号</el-checkbox>
          		</p>
				<el-button type="primary" :loading="loading" @click="loginByPassword" round>账号登入</el-button>
			</div>
		</div>
	</main>
	<footer class="login-footer">
		<span v-if="!isMobile">MIT Licensed | </span>
		<span>Adachi管理面板 ©2021 SilveryStar</span>
	</footer>
</div>`;

import router from "../router/index.js";
import { loginInfoSession } from "../utils/session.js";

const { ElNotification } = ElementPlus;

const { defineComponent, reactive, toRefs, computed, onMounted, inject } = Vue;
const { useRoute } = VueRouter;

export default defineComponent( {
	name: "Login",
	template,
	setup() {
		const route = useRoute();
		const { device } = inject( "app" );
		const { USER_LOGIN } = inject( "user" );
		
		const state = reactive( {
			number: "",
			password: "",
			loading: false,
			rememberAccount: true
		} )
		
		const isMobile = computed( () => device.value === "mobile" );
		
		onMounted( () => {
			const loginInfo = loginInfoSession.get();
			state.number = loginInfo?.number;
			state.rememberAccount = loginInfo?.rememberAccount;
			console.log( loginInfo )
		} )
		
		function loginByPassword() {
			state.loading = true
			USER_LOGIN( state.number, state.password ).then( () => {
				if ( state.rememberAccount ) {
					loginInfoSession.set( {
						number: state.number,
						rememberAccount: state.rememberAccount
					} )
				} else {
					loginInfoSession.remove()
				}
				state.loading = false
				router.push( { path: route.query?.redirect || "/system/home" } );
			} ).catch( err => {
				ElNotification( {
					title: "提示信息",
					message: err.message,
					type: "error",
					duration: 2500
				} );
				state.loading = false
			} )
		}
		
		return {
			...toRefs( state ),
			isMobile,
			loginByPassword
		}
	}
} );