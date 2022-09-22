const template = `<div class="table-container config">
	<el-alert title="该页内容修改完毕后续重启BOT或刷新配置才能生效" type="warning" show-icon />
	<el-form :model="setting" class="config-form" @submit.prevent>
		<div v-for="(p, pKey) of plugins" :key="pKey" class="config-section">
			<section-title :title="p.name" />
			<spread-form-item
				:active-spread="activeSpread"
				v-model="p.data"
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
</div>`;

import $http from "../../api/index.js";
import FormItem from "../../components/form-item/index.js";
import SpreadFormItem from "../../components/spread-form-item/index.js";
import SectionTitle from "../../components/section-title/index.js";
import { isJsonString } from "../../utils/validate.js";

const { defineComponent, onMounted, reactive, toRefs } = Vue;
const { ElNotification } = ElementPlus;

export default defineComponent( {
	name: "PluginsConfig",
	template,
	components: {
		FormItem,
		SectionTitle,
		SpreadFormItem
	},
	setup() {
		const state = reactive( {
			plugins: [],
			pageLoading: false,
			activeSpread: ""
		} );
		
		function getPluginsConfigs() {
			state.pageLoading = true;
			$http.CONFIG_PLUGINS( {}, "GET" ).then( res => {
				state.plugins = res.data.map( d => {
					return {
						...d,
						data: JSON.stringify( d.data, null, 4 )
					}
				} );
				state.pageLoading = false;
			} ).catch( () => {
				state.pageLoading = false;
			} )
		}
		
		async function updateConfig( data, fileName ) {
			state.pageLoading = true;
			try {
				await $http.CONFIG_SET( { fileName, data: JSON.parse( data ), force: true } );
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
		
		/* 设置当前正在展开的项目 */
		function activeSpreadItem( index ) {
			state.activeSpread = index;
		}
		
		/* 校验内容是否符合JSON规范 */
		function verifyFunction( value ) {
			return isJsonString( value );
		}
		
		
		onMounted( () => {
			getPluginsConfigs();
		} );
		
		return {
			...toRefs( state ),
			verifyFunction,
			updateConfig,
			activeSpreadItem
		}
	}
} )