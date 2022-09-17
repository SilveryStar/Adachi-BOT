const template = `<div class="config-section whitelist">
	<section-title title="白名单配置" />
	<form-item label="启用白名单" desc="开启后 BOT 仅对白名单内的用户或群组作出响应。">
		<el-switch v-model="setting.useWhitelist" :disabled="pageLoading" @change="updateConfig('useWhitelist', 'setting')" />
	</form-item>
	<template v-if="setting.useWhitelist">
		<form-item label="用户列表" desc="置空则不对该类型进行限制。">
			<Tags v-model="whitelist.user" :disabled="pageLoading" type="number" @change="updateConfig('user')" />
		</form-item>
		<form-item label="群组列表" desc="置空则不对该类型进行限制。">
			<Tags v-model="whitelist.group" :disabled="pageLoading" type="number" @change="updateConfig('group')" />
		</form-item>
	</template>
</div>`;

import $http from "../../api/index.js";
import FormItem from "../../components/form-item/index.js";
import SectionTitle from "../../components/section-title/index.js";
import Tags from "../../components/tags/index.js";
import { objectGet, objectSet } from "../../utils/utils.js";

const { defineComponent, onMounted, reactive, toRefs } = Vue;
const { ElNotification } = ElementPlus;

export default defineComponent( {
	name: "Whitelist",
	template,
	components: {
		FormItem,
		SectionTitle,
		Tags
	},
	setup() {
		const state = reactive( {
			setting: {},
			whitelist: {},
			pageLoading: false
		} );
		
		async function getSettingConfig() {
			const res = await $http.CONFIG_GET( { fileName: "setting" }, "GET" );
			state.setting = res.data;
		}
		
		async function getWhitelistConfig() {
			const res = await $http.CONFIG_GET( { fileName: "whitelist" }, "GET" );
			const data = res.data;
			data.user = data.user.filter( u => typeof u === "number" );
			data.group = data.group.filter( g => typeof g === "number" );
			state.whitelist = data;
		}
		
		async function updateConfig( field, fileName = "whitelist" ) {
			state.pageLoading = true;
			const object = fileName === "whitelist" ? state.whitelist : state.setting;
			const value = objectGet( object, field );
			const data = {};
			objectSet( data, field, value );
			try {
				await $http.CONFIG_SET( { fileName, data } );
				ElNotification( {
					title: "成功",
					message: "更新成功。",
					type: "success",
					duration: 1000
				} );
				state.pageLoading = false;
			} catch ( error ) {
				state.pageLoading = false;
			}
		}
		
		
		onMounted( () => {
			state.pageLoading = true;
			Promise.all( [ getSettingConfig(), getWhitelistConfig() ] ).then( () => {
				state.pageLoading = false;
			} ).catch( () => {
				state.pageLoading = false;
			} )
		} );
		
		return {
			...toRefs( state ),
			updateConfig
		}
	}
} )