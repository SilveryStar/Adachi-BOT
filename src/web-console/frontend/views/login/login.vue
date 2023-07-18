<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { loginInfoSession } from "&/utils/session";
import { ElNotification } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "&/store";

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const state = reactive( {
	nickname: "",
	password: "",
	loading: false,
	rememberAccount: true
} );

function loginByPassword() {
	state.loading = true
	user.USER_LOGIN( state.nickname, state.password ).then( () => {
		if ( state.rememberAccount ) {
			loginInfoSession.set( {
				nickname: state.nickname,
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
			type: "warning",
			duration: 2500
		} );
		state.loading = false
	} )
}

onMounted( () => {
	const loginInfo = loginInfoSession.get();
	state.nickname = loginInfo?.nickname;
	state.rememberAccount = loginInfo?.rememberAccount;
} );

function setNickname( nickname: string ) {
	state.nickname = nickname;
}

defineExpose( {
	setNickname
} );
</script>

<template>
	<div class="login">
		<el-input v-model.number="state.nickname" placeholder="用户名" maxlength="13" clearable
		          @keyup.enter="loginByPassword"/>
		<el-input v-model.trim="state.password" placeholder="密码" maxlength="20" clearable
		          show-password @keyup.enter="loginByPassword"/>
		<p class="remember-account">
			<el-checkbox v-model="state.rememberAccount">记住账号</el-checkbox>
		</p>
		<el-button type="primary" :loading="state.loading" @click="loginByPassword" round>账号登入
		</el-button>
	</div>
</template>

<style scoped lang="scss">

</style>