const template =
`<div class="login">
	<header class="login-header">
		<div class="login-inner">
			<a href="https://www.pixiv.net/artworks/85520334" target="_blank">
				<img class="login-logo" src="../public/image/logo.png" alt="ERROR" />
			</a>
			<h2 class="login-title">
				<span>Adachi-Admin</span>
				<span>BOT 网页控制台</span>
			</h2>
		</div>
	</header>
	<main class="login-main">
		<el-input v-model.number="number" placeholder="BOT 账号" maxlength="13" clearable />
		<el-input v-model.trim="password" placeholder="BOT 密码" maxlength="20" clearable show-password />
		<el-button type="primary" @click="sendLoginReq" round>账号登入</el-button>
	</main>
</div>`;

import router from "../router/index.js";

const { defineComponent, ref } = Vue;
const { get } = axios;
const { ElNotification } = ElementPlus;

export default defineComponent( {
	name: "Login",
	template,
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
			get( `/api/login?num=${ number.value }&pwd=${ password.value }` )
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
			number, password,
			sendLoginReq
		}
	}
} );