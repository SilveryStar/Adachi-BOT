<template>
	<div class="table-container config">
		<el-alert title="该页内容修改完毕后续重启BOT或刷新配置才能生效" type="warning" show-icon />
		<el-form class="config-form" @submit.prevent>
			<div v-for="(p, pKey) of plugins" :key="pKey" class="config-section">
				<section-title :title="p.name" />
				<spread-form-item
					:active-spread="activeSpread"
					v-model="plugins[pKey].data"
					type="textarea"
					:disabled="pageLoading"
					label="配置文件"
					placeholder="请输入配置项内容"
					:rows="12"
					:verifyReg="verifyFunction"
					verifyMsg="请检查输入内容是否符合 JSON 格式规范"
					@change="updateConfig(p.data, p.name)"
					@open="activeSpreadItem"
					hideContent
				/>
			</div>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import $http from "&/api";
import SpreadFormItem from "&/components/spread-form-item/index.vue";
import SectionTitle from "&/components/section-title/index.vue";
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import { isJsonString } from "@/utils/verify";

const plugins = ref<any[]>([]);
const pageLoading = ref(false);

const getPluginsConfigs = async () => {
	pageLoading.value = true;
	try {
		const res = await $http.CONFIG_PLUGINS.get();
		plugins.value = res.data.map( d => {
			return {
				...d,
				data: JSON.stringify( d.data, null, 4 )
			}
		} );
	} catch {}
	pageLoading.value = false;
}

async function updateConfig( data, fileName ) {
	pageLoading.value = true;
	try {
		await $http.CONFIG_SET.post( { fileName, data: JSON.parse( data ), force: true } );
		ElNotification( {
			title: "成功",
			message: "更新成功。",
			type: "success",
			duration: 1000
		} );
	} catch {}
	pageLoading.value = false;
}

const activeSpread = ref<number | null>(null);
/* 设置当前正在展开的项目 */
function activeSpreadItem( index ) {
	activeSpread.value = index;
}

/* 校验内容是否符合JSON规范 */
function verifyFunction( value ) {
	return isJsonString( value );
}


onMounted( () => {
	getPluginsConfigs();
} );
</script>

<style lang="scss" scoped>

</style>