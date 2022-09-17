const template = `<div class="table-container config">
	<el-alert title="该页内容修改完毕后续重启BOT或刷新配置才能生效" type="warning" show-icon />
	<el-form :model="commands" class="config-form" @submit.prevent>
		<div v-for="cKey of Object.keys(commands)" :key="cKey" class="config-section">
			<section-title :title="cKey" />
			<form-item label="启用">
				<el-switch v-model="commands[cKey].enable" :disabled="pageLoading" @change="updateConfig(cKey, 'enable')" />
			</form-item>
			<template v-if="commands[cKey].enable"">
				<form-item label="最低操作权限">
					<el-radio-group v-model="commands[cKey].auth" :disabled="pageLoading" @change="updateConfig(cKey, 'auth')" >
						<el-radio v-for="(a, aKey) of authList" :key="aKey" :label="aKey + 1">{{ a }}</el-radio>
					</el-radio-group>
				</form-item>
				<form-item label="可用范围">
					<el-radio-group v-model="commands[cKey].scope" :disabled="pageLoading" @change="updateConfig(cKey, 'scope')" >
						<el-radio v-for="(s, sKey) of scopeList" :key="sKey" :label="sKey + 1">{{ s }}</el-radio>
					</el-radio-group>
				</form-item>
				<template v-if="commands[cKey].type === 'order'">
					<form-item label="指令头" desc="以 __ 开头来屏蔽 setting 中配置的 header。">
						<Tags v-model="commands[cKey].headers" :disabled="pageLoading" :limit="1" @change="updateConfig(cKey, 'headers')" />
					</form-item>
				</template>
				<template v-else-if="commands[cKey].type === 'switch'">
					<form-item label="指令头模式">
						<el-radio-group v-model="commands[cKey].mode" :disabled="pageLoading" @change="updateConfig(cKey, 'mode')" >
							<el-radio v-for="(m, mKey) of modeList" :key="mKey" :label="m.value">{{ m.label }}</el-radio>
						</el-radio-group>
					</form-item>
					<spread-form-item
						v-model="commands[cKey].onKey"
						:disabled="pageLoading"
						label="关键词(开)"
						placeholder="请输入关键词"
						verifyReg=".+"
						verifyMsg="该项为必填项"
						@change="updateConfig(cKey, 'onKey')"
					/>
					<spread-form-item
						v-model="commands[cKey].offKey"
						:disabled="pageLoading"
						label="关键词(关)"
						placeholder="请输入关键词"
						verifyReg=".+"
						verifyMsg="该项为必填项"
						@change="updateConfig(cKey, 'offKey')"
					/>
					<spread-form-item
						v-if="commands[cKey].mode !== 'divided'"
						v-model="commands[cKey].header"
						:disabled="pageLoading"
						label="指令头"
						placeholder="请输入指令头"
						verifyReg=".+"
						verifyMsg="该项为必填项"
						desc="以 __ 开头来屏蔽 setting 中配置的 header。"
						@change="updateConfig(cKey, 'header')"
					/>
				</template>
			</template>
		</div>
	</el-form>
</div>`;

import $http from "../../api/index.js";
import FormItem from "../../components/form-item/index.js";
import SpreadFormItem from "../../components/spread-form-item/index.js";
import SectionTitle from "../../components/section-title/index.js";
import Tags from "../../components/tags/index.js";
import { objectGet, objectSet } from "../../utils/utils.js";

const { defineComponent, onMounted, reactive, toRefs } = Vue;
const { ElNotification } = ElementPlus;

export default defineComponent( {
	name: "Commands",
	template,
	components: {
		FormItem,
		SpreadFormItem,
		SectionTitle,
		Tags
	},
	setup() {
		const state = reactive( {
			commands: {},
			pageLoading: false
		} );
		
		const authList = [ "user", "manager", "master" ];
		const scopeList = [ "仅群聊", "仅私聊", "无限制" ];
		const modeList = [ {
			label: "单指令头",
			value: "single"
		}, {
			label: "拆分指令头",
			value: "divided"
		} ]
		
		function getCommandsConfig() {
			state.pageLoading = true;
			$http.CONFIG_GET( { fileName: "commands" }, "GET" ).then( res => {
				for ( const dKey in res.data ) {
					const cmd = res.data[dKey];
					if ( Object.prototype.toString.call( cmd ) !== "[object Object]" ) {
						delete res.data[dKey];
					}
				}
				state.commands = res.data;
				state.pageLoading = false;
			} ).catch( () => {
				state.pageLoading = false;
			} )
		}
		
		async function updateConfig( id, field ) {
			state.pageLoading = true;
			const path = `${ id }.${ field }`;
			const value = objectGet( state.commands, path, 1 );
			const data = {};
			objectSet( data, path, value, 1 );
			try {
				await $http.CONFIG_SET( { fileName: "commands", data } );
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
			getCommandsConfig();
		} );
		
		return {
			...toRefs( state ),
			authList,
			scopeList,
			modeList,
			updateConfig
		}
	}
} )