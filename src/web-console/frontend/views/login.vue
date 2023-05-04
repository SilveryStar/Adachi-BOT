<template>
	<div class="login-base">
		<header class="login-header">
			<h3>Adachi-Admin</h3>
		</header>
		<main class="login-main">
			<div class="login-main-content">
				<div class="login-main-title">
					<a href="https://www.pixiv.net/artworks/85520334" target="_blank" draggable="false">
						<img class="login-logo" src="/image/logo.png" alt="ERROR" draggable="false"/>
					</a>
					<h2 class="login-title">
						<span>BOT 网页控制台</span>
					</h2>
				</div>
				<div class="login-main-form">
					<el-input v-model.number="state.number" placeholder="BOT 账号" maxlength="13" clearable
					          @input="accountInput" @keyup.enter="loginByPassword"/>
					<el-input v-model.trim="state.password" placeholder="BOT 密码" maxlength="20" clearable
					          show-password @keyup.enter="loginByPassword"/>
					<p class="remember-account">
						<el-checkbox v-model="state.rememberAccount">记住账号</el-checkbox>
					</p>
					<el-button type="primary" :loading="state.loading" @click="loginByPassword" round>账号登入
					</el-button>
				</div>
			</div>
		</main>
		<footer class="login-footer">
			<span v-if="!isMobile">MIT Licensed | </span>
			<span>Adachi管理面板 &copy;{{ currentYear }} SilveryStar</span>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import { ElNotification } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { reactive, computed, onMounted } from "vue";
import { loginInfoSession } from "&/utils/session";
import { useAppStore, useUserStore } from "&/store";

const state = reactive( {
	number: "",
	password: "",
	loading: false,
	rememberAccount: true
} );

const currentYear: number = new Date().getFullYear();

onMounted( () => {
	const loginInfo = loginInfoSession.get();
	state.number = loginInfo?.number;
	state.rememberAccount = loginInfo?.rememberAccount;
} )

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const app = useAppStore();
const isMobile = computed( () => app.device === "mobile" );

function loginByPassword() {
	state.loading = true
	user.USER_LOGIN( state.number, state.password ).then( () => {
		if ( state.rememberAccount ) {
			loginInfoSession.set( {
				number: state.number,
				rememberAccount: state.rememberAccount
			} )
		} else {
			loginInfoSession.remove()
		}
		state.loading = false
		router.push( { path: <string>( route.query?.redirect ) || "/system/home" } );
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

function accountInput(val: string) {
	state.number = val.replace(/\D/g, "");
}
</script>

<style lang="scss" scoped>
.login-base {
	min-width: 240px;
	min-height: 542px;
	height: var(--app-height);
	display: flex;
	flex-direction: column;
	position: relative;
	background-color: #fff;
	user-select: none;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		width: 100%;
		height: 160%;
		top: 50%;
		left: 0;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background-color: #f6f7fc;
		box-shadow: -.4rem 0 1.25rem #e5e9ff inset;
	}

	> .login-header {
		position: relative;
		--header-height: 10vh;
		height: var(--header-height);

		> h3 {
			padding: 0 3rem;
			font-size: 2rem;
			font-weight: 700;
			line-height: var(--header-height);
			color: #0390fe;
		}
	}

	> .login-main {
		position: relative;
		flex: 1;

		> .login-main-content {
			width: 27rem;
			position: absolute;
			top: 45%;
			left: 50%;
			transform: translate(-50%, -50%);

			> .login-main-title {
				margin-bottom: 2rem;
				text-align: center;

				.login-logo {
					display: inline-block;
					width: 11rem;
					height: 11rem;
					margin-bottom: 1.2rem;
					border-radius: 50%;
				}

				.login-title {
					font-size: 1.6rem;
					font-weight: 500;
				}
			}

			.login-main-form {
				.el-input {
					margin-bottom: 1.25rem;
				}

				.remember-account {
					padding: 0 10px;
				}

				.el-input__wrapper,
				.el-button {
					width: 100%;
					height: 2.5rem;
					border-radius: 1.25rem;
					box-sizing: border-box;
				}

				.el-input__wrapper {
					padding: 0 1.5rem;
				}

				.el-button {
					margin-top: 1.25rem;
				}
			}
		}
	}

	> .login-footer {
		position: relative;
		height: 2.6rem;
		line-height: 2.6rem;
		font-size: 0.85rem;
		text-align: center;
		color: #999;
	}
}

@media (max-width: 768px) {
	.login-base {
		> .login-header {
			> h3 {
				padding: 0 2rem;
				font-size: 1.4rem;
			}
		}

		> .login-main {
			> .login-main-content {
				width: 75%;

				> .login-main-title {
					.login-logo {
						width: 9rem;
						height: 9rem;
					}

					.login-title {
						font-size: 1.4rem;
					}
				}
			}
		}
	}
}
</style>