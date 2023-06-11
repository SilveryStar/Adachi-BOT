<template>
	<div class="config-section whitelist">
		<section-title title="白名单配置"/>
		<form-item label="启用白名单" desc="开启后 BOT 仅对白名单内的用户或群组作出响应。">
			<el-switch v-if="setting" v-model="setting.useWhitelist" :disabled="pageLoading"
			           @change="updateConfig('useWhitelist', 'setting')"/>
		</form-item>
		<template v-if="setting && setting.useWhitelist">
			<form-item label="用户列表" desc="置空则不对该类型进行限制。">
				<Tags v-if="whitelist" v-model="whitelist.user" :disabled="pageLoading" type="number" @change="updateConfig('user')"/>
			</form-item>
			<form-item label="群组列表" desc="置空则不对该类型进行限制。">
				<Tags v-if="whitelist" v-model="whitelist.group" :disabled="pageLoading" type="number" @change="updateConfig('group')"/>
			</form-item>
		</template>
	</div>
</template>

<script lang="ts" setup>
import $http from "&/api";
import FormItem from "&/components/form-item/index.vue";
import SectionTitle from "&/components/section-title/index.vue";
import Tags from "&/components/tags/index.vue";
import { objectGet, objectSet } from "&/utils/utils";
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";

interface WhitList {
	user: number[];
	group: number[];
}

const setting = ref<{ useWhitelist: boolean } | null>( null );
async function getSettingConfig() {
	const res = await $http.CONFIG_GET.get( { fileName: "setting" } );
	setting.value = res.data;
}

const whitelist = ref<WhitList | null>( null );
const pageLoading = ref(false);
async function updateConfig( field, fileName = "whitelist" ) {
	pageLoading.value = true;
	const object = fileName === "whitelist" ? whitelist.value : setting.value;
	if ( !object ) return;
	const value = objectGet( object, field );
	const data = {};
	objectSet( data, field, value );
	try {
		await $http.CONFIG_SET.post( { fileName, data } );
		ElNotification( {
			title: "成功",
			message: "更新成功。",
			type: "success",
			duration: 1000
		} );
	} catch {}
	pageLoading.value = false;
}

async function getWhitelistConfig() {
	const res = await $http.CONFIG_GET.get( { fileName: "whitelist" } );
	const data = res.data;
	data.user = data.user.filter( u => typeof u === "number" );
	data.group = data.group.filter( g => typeof g === "number" );
	whitelist.value = data;
}


onMounted( () => {
	pageLoading.value = true;
	Promise.all( [ getSettingConfig(), getWhitelistConfig() ] ).then( () => {
		pageLoading .value= false;
	} ).catch( () => {
		pageLoading .value= false;
	} )
} );
</script>

<style lang="scss" scoped>

</style>