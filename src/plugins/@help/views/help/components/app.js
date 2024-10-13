const template = `<CommonBase v-if="data" class="help" title="Adachi-BOT 指令列表">
	<template #header-suffix>
		<div class="right-header">
			<p class="desc">列表仅展示最多两个指令头</p>
			<p v-if="data.detailCmd" class="desc">使用 {{ data.detailCmd }}+指令序号 查看详细信息</p>
			<p class="desc">[]表示必填，()表示选填，|表示选择</p>
		</div>
	</template>
	<CommonCard
		v-for="(commands, pluginName) in data.commands"
		:key="pluginName"
		class="cmd-list"
		:title="getListTitle( pluginName )"
	>
		<CommonTab v-for="cmd of commands" :key="cmd.id" :index="cmd.id" :mark="getCmdPrefix( cmd )">
			<p class="cmd-header">{{ cmd.header }}</p>
			<p class="cmd-desc">{{ getCmdBody( cmd ) }}</p>
		</CommonTab>
	</CommonCard>
</CommonBase>`;

import { onMounted, ref } from "vue";
import { urlParamsGet } from "../utils/url.js";
import CommonBase from "./CommonBase.js";
import CommonCard from "./CommonCard.js";
import CommonTab from "./CommonTab.js";

export default {
	name: "HelpApp",
	template,
	components: {
		CommonBase,
		CommonCard,
		CommonTab
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		const model = urlParams.model;
		
		const pluginNameMap = {
			"help": "帮助指令",
			"management": "管理指令",
			"tools": "附加工具"
		}
		
		function getCmdPrefix( cmd ) {
			let prefix = "";
			if ( cmd.scope === 1 ) {
				prefix = "仅群聊";
			} else if ( cmd.scope === 2 ) {
				prefix = "仅私聊";
			}
			return prefix;
		}
		
		function getListTitle( pluginName ) {
			return pluginNameMap[pluginName] || `${ pluginName } 插件指令`;
		}
		
		function getCmdBody( cmd ) {
			if ( model === "keys" ) {
				return cmd.cmdKey;
			}
			// 仅展示前两项 header
			const headers = cmd.body.headers.slice( 0, 2 );
			return `${ headers.join( "|" ) } ${ cmd.body.param }`
		}
		
		const getData = async () => {
			data.value = await fetch( "/@help/api/help" ).then( res => {
				return res.json();
			} );
			
		};
		
		onMounted( getData );
		
		return {
			data,
			model,
			getCmdPrefix,
			getListTitle,
			getCmdBody
		};
	}
};