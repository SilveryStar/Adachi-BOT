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
						<span v-if="isCreateRoot" class="desc">（初次进入，请先创建 root 账号）</span>
					</h2>
				</div>
				<div class="login-main-form">
					<register v-if="isCreateRoot" @completed="initUsername"/>
					<login v-else :user-name="username" ref="loginRef" />
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
import { computed, ref } from "vue";
import { useAppStore } from "@/store";
import { useRoute } from "vue-router";
import Login from "./login.vue";
import Register from "./register.vue";

const currentYear: number = new Date().getFullYear();

const app = useAppStore();
const isMobile = computed( () => app.device === "mobile" );

const route = useRoute();
const createComplete = ref( false );
const isCreateRoot = computed( () => {
	return !createComplete.value && route.query.createRoot === "true";
} );

const title = computed( () => {
	return isCreateRoot.value ? "创建 root 账号" : "BOT 网页控制台"
} );

const username = ref( "" );
const loginRef = ref<InstanceType<typeof Login> | null>( null );
function initUsername( value: string ) {
	createComplete.value = true;
	username.value = value;
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
					display: flex;
					flex-direction: column;
					align-items: center;
					font-size: 1.6rem;
					font-weight: 500;

					.desc {
						font-size: 1rem;
					}
				}
			}

			::v-deep( .login-main-form ) {
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