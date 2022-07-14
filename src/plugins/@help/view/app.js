const template = `<div class="help">
	<header>
		<img src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/help/top-bg.png" alt="top-bg">
		<div class="left-header">
			<p>Adachi-BOT</p>
			<p>{{ model === "keys" ? "指令key值表" : "使用文档" }}</p>
		</div>
		<div class="right-header">
			<p class="version">ver{{ data.version }}</p>
			<p v-if="data.detailCmd" class="desc">使用 {{ data.detailCmd }}+指令序号 查看更多信息</p>
			<p class="desc">[]表示必填，()表示选填，|表示选择</p>
		</div>
	</header>
	<main>
		<section v-for="(commands, pluginName) in data.commands" :key="pluginName" class="cmd-list">
			<h3>{{ getListTitle(pluginName) }}</h3>
			<ul>
				<li v-for="cmd of commands" :key="cmd.id" class="cmd-content clearfix">
					<p class="cmd-index">
						<span>{{ cmd.id }}</span>
					</p>
					<p class="cmd-header">{{ cmd.header }}</p>
					<p class="cmd-desc">{{ model === "keys" ? cmd.cmdKey : cmd.body }}</p>
				</li>
			</ul>
		</section>
	</main>
	<footer>
		<p class="sign">Created by Adachi-BOT</p>
	</footer>
</div>`

import { request, parseURL } from "../../public/js/src.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "HelpApp",
	template,
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/help` );
		
		const model = urlParams.model;
		
		const pluginNameMap = {
			"@help": "帮助指令",
			"@management": "管理指令",
			"tools": "附加工具"
		}
		
		const getListTitle = pluginName => pluginNameMap[pluginName] || `${ pluginName } 插件指令`;
		
		return {
			data,
			model,
			getListTitle
		};
	}
} )