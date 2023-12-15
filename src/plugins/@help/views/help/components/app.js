const template = `<div class="help">
	<template v-if="data">
		<header>
			<img src="/@help/assets/resource/top-bg.png" alt="top-bg">
			<div class="left-header">
				<p>Adachi-BOT</p>
				<p>{{ model === "keys" ? "指令key值表" : "使用文档" }}</p>
			</div>
			<div class="right-header">
				<p class="desc">列表仅展示最多两个指令头</p>
				<p v-if="data.detailCmd" class="desc">使用 {{ data.detailCmd }}+指令序号 查看详细信息</p>
				<p class="desc">- 表示仅允许群聊, * 表示仅允许私聊</p>
				<p class="desc">[]表示必填，()表示选填，|表示选择</p>
			</div>
		</header>
		<main>
			<section v-for="(commands, pluginName) in data.commands" :key="pluginName" class="cmd-list">
				<h3>{{ getListTitle( pluginName ) }}</h3>
				<ul>
					<li v-for="cmd of commands" :key="cmd.id" class="cmd-content clearfix">
						<p class="cmd-index">
							<span>{{ cmd.id }}</span>
						</p>
						<p class="cmd-header">{{ getCmdPrefix( cmd ) + cmd.header }}</p>
						<p class="cmd-desc">{{ getCmdBody( cmd ) }}</p>
					</li>
				</ul>
			</section>
		</main>
		<footer>
			<p class="sign">Created by Adachi-BOT v{{ version }}</p>
		</footer>
	</template>
</div>`

import { defineComponent, onMounted, ref } from "vue";

function urlParamsGet( url ) {
	try {
		const searchParams = [ ...new URL( url ).searchParams ].map( ( [ key, value ] ) => {
			return [ key, decodeURIComponent( value ) ];
		} )
		return Object.fromEntries( searchParams );
	} catch {
		return {};
	}
}

export default defineComponent( {
	name: "HelpApp",
	template,
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		
		const model = urlParams.model;
		const version = window.ADACHI_VERSION;
		
		const pluginNameMap = {
			"help": "帮助指令",
			"management": "管理指令",
			"tools": "附加工具"
		}
		
		function getCmdPrefix( cmd ) {
			let prefix = "";
			if ( cmd.scope === 1 ) {
				prefix = "-";
			} else if ( cmd.scope === 2 ) {
				prefix = "*";
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
		
		onMounted( () => {
			getData();
		} );
		
		return {
			data,
			model,
			version,
			getCmdPrefix,
			getListTitle,
			getCmdBody
		};
	}
} )