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
				<el-input v-model.number="number" placeholder="BOT 账号" maxlength="13" clearable @input="val => number = val.replace(/[^\\d]/g, '')" @keyup.enter="sendLoginReq" />
				<el-input v-model.trim="password" placeholder="BOT 密码" maxlength="20" clearable show-password @keyup.enter="sendLoginReq" />
				<el-button type="primary" @click="sendLoginReq" round>账号登入</el-button>
			</div>
		</div>
	</main>
	<footer class="login-footer">
		<span v-if="!isMobile">MIT Licensed | </span>
		<span>Adachi管理面板 ©2021 SilveryStar</span>
	</footer>
</div>`;

import router from "../router/index.js";
import $http from "../api/index.js"

const { defineComponent, ref } = Vue;
const { ElNotification } = ElementPlus;

export default defineComponent( {
	name: "Login",
	template,
	props: { isMobile: Boolean },
	setup() {
		const number = ref( "" );
		const password = ref( "" );
		
		function sendLoginReq() {
			if ( number.value.length === 0 || password.value.length === 0 ) {
				ElNotification( {
					title: "提示信息",
					message: "账号或密码不可为空",
					type: "error",
					duration: 2500
				} );
				return;
			}
			
			const pwd = md5( password.value );
			$http.USER_LOGIN( {
				num: number.value,
				pwd: pwd
			} )
				.then( res => {
					localStorage.setItem( "token", res.data.token );
					router.push( { name: "Home" } )
				} )
				.catch( err => {
					ElNotification( {
						title: "提示信息",
						message: "账号或密码不正确",
						type: "error",
						duration: 2500
					} );
				} );
		}
		
		return {
			number, password, sendLoginReq
		}
	}
} );