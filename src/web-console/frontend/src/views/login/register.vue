<script setup lang="ts">
import $http from "@/api";
import { Md5 } from "md5-typescript";
import { reactive } from "vue";
import { ElNotification } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useAppStore, useUserStore } from "@/store";

const route = useRoute();
const router = useRouter();
const app = useAppStore();
const user = useUserStore();

const state = reactive( {
	username: "",
	password: "",
	confirmPassword: "",
	secret: "",
	loading: false
} );

const emits = defineEmits<{
	( e: "completed", username: string ): void;
}>();

function createAccount() {
	state.loading = true;
	if ( !state.username || !state.password || !state.secret ) {
		ElNotification( {
			title: "提示信息",
			message: "还有东西没填写呢",
			type: "warning",
			duration: 2500
		} );
		state.loading = false;
		return;
	}
	if ( state.password !== state.confirmPassword ) {
		ElNotification( {
			title: "提示信息",
			message: "两次密码输入不同",
			type: "warning",
			duration: 2500
		} );
		state.loading = false;
		return;
	}
	$http.ROOT_CREATE.post( {
		username: state.username,
		password: Md5.init( state.password ),
		secret: Md5.init( state.secret )
	} ).then( () => {
		state.loading = false;
		app.hasRoot = true;
		emits( "completed", state.username );
		ElNotification( {
			title: "成功",
			message: "创建账号成功",
			type: "success",
			duration: 2500
		} );
	} ).catch( () => {
		state.loading = false;
	} );
}
</script>

<template>
	<div class="register">
		<el-input v-model.number="state.username" placeholder="用户名" maxlength="13" clearable
		          @keyup.enter="createAccount"/>
		<el-input v-model.trim="state.password" placeholder="密码" maxlength="20" clearable
		          show-password @keyup.enter="createAccount"/>
		<el-input v-model.trim="state.confirmPassword" placeholder="确认密码" maxlength="20" clearable
		          show-password @keyup.enter="createAccount"/>
		<el-input v-model.trim="state.secret" style="margin-bottom: 0" placeholder="密钥" maxlength="20" clearable
		          show-password @keyup.enter="createAccount"/>
		<p class="desc">*ps: 即配置文件 webconsole.yml 的 jwtSecret 值</p>
		<el-button type="primary" :loading="state.loading" @click="createAccount" round>创建账号</el-button>
	</div>
</template>

<style scoped lang="scss">
.desc {
	padding: 0.3125rem 1.375rem;
	font-size: 0.75rem;
	color: #aaa;
}
</style>