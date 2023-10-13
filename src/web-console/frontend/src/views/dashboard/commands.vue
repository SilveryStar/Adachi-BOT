<template>
	<div class="table-container config">
		<el-alert title="该页内容修改完毕后续重启BOT或刷新配置才能生效" type="warning" show-icon/>
		<el-form :model="commands" class="config-form" @submit.prevent>
			<div v-for="(c, cKey) in commands" :key="cKey" class="config-section">
				<section-title :title="cKey"/>
				<form-item label="启用">
					<el-switch v-model="c.enable" :disabled="pageLoading" @change="updateConfig(cKey, 'enable')"/>
				</form-item>
				<template v-if="c.enable">
					<form-item label="最低操作权限">
						<el-radio-group v-model="c.auth" :disabled="pageLoading" @change="updateConfig(cKey, 'auth')">
							<el-radio v-for="(a, aKey) of authList" :key="aKey" :label="aKey + 1">{{ a }}</el-radio>
						</el-radio-group>
					</form-item>
					<form-item label="可用范围">
						<el-radio-group v-model="c.scope" :disabled="pageLoading" @change="updateConfig(cKey, 'scope')">
							<el-radio v-for="(s, sKey) of scopeList" :key="sKey" :label="sKey + 1">{{ s }}</el-radio>
						</el-radio-group>
					</form-item>
					<template v-if="c.type === 'order' || c.type === 'enquire'">
						<form-item label="指令头" desc="以 __ 开头来屏蔽 setting 中配置的 header。">
							<Tags v-if="c.headers" v-model="c.headers" :disabled="pageLoading" :limit="1"
							      @change="updateConfig(cKey, 'headers')"/>
						</form-item>
					</template>
					<template v-else-if="c.type === 'switch'">
						<form-item label="指令头模式">
							<el-radio-group v-model="c.mode" :disabled="pageLoading"
							                @change="updateConfig(cKey, 'mode')">
								<el-radio v-for="(m, mKey) of modeList" :key="mKey" :label="m.value">
									{{ m.label }}
								</el-radio>
							</el-radio-group>
						</form-item>
						<spread-form-item
							v-model="c.onKey"
							:active-spread="activeSpread"
							:disabled="pageLoading"
							label="关键词(开)"
							placeholder="请输入关键词"
							verifyReg=".+"
							verifyMsg="该项为必填项"
							@change="updateConfig(cKey, 'onKey')"
							@open="activeSpreadItem"
						/>
						<spread-form-item
							v-model="c.offKey"
							:active-spread="activeSpread"
							:disabled="pageLoading"
							label="关键词(关)"
							placeholder="请输入关键词"
							verifyReg=".+"
							verifyMsg="该项为必填项"
							@change="updateConfig(cKey, 'offKey')"
							@open="activeSpreadItem"
						/>
						<spread-form-item
							v-if="c.mode !== 'divided'"
							:active-spread="activeSpread"
							v-model="c.header"
							:disabled="pageLoading"
							label="指令头"
							placeholder="请输入指令头"
							verifyReg=".+"
							verifyMsg="该项为必填项"
							desc="以 __ 开头来屏蔽 setting 中配置的 header。"
							@change="updateConfig(cKey, 'header')"
							@open="activeSpreadItem"
						/>
					</template>
				</template>
			</div>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import $http from "@/api";
import FormItem from "@/components/form-item/index.vue";
import SpreadFormItem from "@/components/spread-form-item/index.vue";
import SectionTitle from "@/components/section-title/index.vue";
import Tags from "@/components/tags/index.vue";
import { objectGet, objectSet } from "@/utils/utils";
import { ref, onMounted } from "vue";
import { ElNotification } from "element-plus";

const authList = [ "user", "manager", "master" ];
const scopeList = [ "仅群聊", "仅私聊", "无限制" ];
const modeList = [ {
	label: "单指令头",
	value: "single"
}, {
	label: "拆分指令头",
	value: "divided"
} ]


const commands = ref<Record<string, any>>( {} );
const pageLoading = ref( false );

async function getCommandsConfig() {
	pageLoading.value = true;
	try {
		const res = await $http.CONFIG_GET.get( { fileName: "commands" } );
		for ( const dKey in res.data ) {
			const cmd = res.data[dKey];
			if ( Object.prototype.toString.call( cmd ) !== "[object Object]" ) {
				delete res.data[dKey];
			}
		}
		commands.value = res.data;
	} catch {
	}
	pageLoading.value = false;
}

onMounted( () => {
	getCommandsConfig();
} );

async function updateConfig( id, field ) {
	pageLoading.value = true;
	const path = `${ id }.${ field }`;
	/* 略过的"."的数量 */
	const ignore = id.split( "." ).length - 1;
	const value = objectGet( commands.value, path, ignore );
	const data = {};
	objectSet( data, path, value, ignore );
	try {
		await $http.CONFIG_SET.post( { fileName: "commands", data } );
		ElNotification( {
			title: "成功",
			message: "更新成功。",
			type: "success",
			duration: 1000
		} );
	} catch {
	}
	pageLoading.value = false;
}

const activeSpread = ref<number | null>( null );

/* 设置当前正在展开的项目 */
function activeSpreadItem( index: number | null ) {
	activeSpread.value = index;
}
</script>

<style lang="scss" scoped>

</style>