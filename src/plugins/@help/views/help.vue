<template>
	<div id="app" class="help">
		<template v-if="data">
			<header>
				<img src="/assets/@help/resource/top-bg.png" alt="top-bg">
				<div class="left-header">
					<p>Adachi-BOT</p>
					<p>{{ model === "keys" ? "指令key值表" : "使用文档" }}</p>
				</div>
				<div class="right-header">
					<p class="version">ver{{ version }}</p>
					<p class="desc">列表仅展示最多两个指令头</p>
					<p v-if="data.detailCmd" class="desc">使用 {{ data.detailCmd }}+指令序号 查看想想信息</p>
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
	</div>
</template>

<script lang="ts" setup>
import $https from "#/@help/utils/api";
import { onMounted, ref } from "vue";
import { urlParamsGet } from "@/utils/url";
import { HelpCommand, HelpRouterData } from "#/@help/type/help";

const urlParams = urlParamsGet( location.href );
const data = ref<HelpRouterData | null>( null );

const model = urlParams.model;
const version = window.ADACHI_VERSION;

const pluginNameMap = {
	"help": "帮助指令",
	"management": "管理指令",
	"tools": "附加工具"
}

function getCmdPrefix( cmd: HelpCommand ): string {
	let prefix = "";
	if ( cmd.scope === 1 ) {
		prefix = "-";
	} else if ( cmd.scope === 2 ) {
		prefix = "*";
	}
	return prefix;
}

function getListTitle( pluginName: string | number ): string {
	return pluginNameMap[pluginName] || `${ pluginName } 插件指令`;
}

function getCmdBody( cmd: HelpCommand ): string {
	if ( model === "keys" ) {
		return cmd.cmdKey;
	}
	// 仅展示前两项 header
	const headers = cmd.body.headers.slice( 0, 2 );
	return `${ headers.join( "|" ) } ${ cmd.body.param }`
}

const getData = async () => {
	data.value = await $https.HELP.get();

};

onMounted( () => {
	getData();
} );
</script>

<style lang="scss">
* {
	margin: 0;
	padding: 0;
}

img {
	display: block;
}

ul {
	list-style: none;
}

html {
	height: 100%;
	font-family: GenshinUsedFont, monospace;
}

@font-face {
	font-family: GenshinUsedFont;
	src: url("/assets/@help/fonts/HYWenHei-85W.ttf");
}
</style>

<style lang="scss" scoped>
#app {
	width: 750px;
}

.help {
	background-color: #f3f4f7;
	box-shadow: inset 0 0 200px rgba(198, 215, 243, 0.4);

	header {
		position: relative;
		display: flex;
		justify-content: space-between;
		padding: 0 26px;
		height: 178px;
		color: #fff;
		font-weight: 400;
		text-shadow: 1px 1px 4px #000;

		img {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			filter: drop-shadow(0 2px 0 #fff) drop-shadow(0 4px 4px rgba(0, 0, 0, 0.3));
		}

		.left-header,
		.right-header {
			position: relative;
			z-index: 100;
		}

		.left-header {
			margin-top: 38px;

			p {
				&:nth-of-type(1) {
					font-size: 28px;
					line-height: 34px;
				}

				&:nth-of-type(2) {
					margin-top: 5px;
					font-size: 24px;
					line-height: 29px;
				}
			}
		}

		.right-header {
			margin-top: 25px;
			text-align: right;

			.version {
				margin-bottom: 11px;
				font-size: 20px;
				line-height: 24px;
			}

			.desc {
				margin-top: 5px;
				font-size: 14px;
				line-height: 17px;
			}
		}
	}

	main {
		padding: 0 26px;

		section {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-top: 20px;

			&:first-child {
				margin-top: -18px;
			}

			h3 {
				margin-bottom: 10px;
				padding: 5px 20px;
				min-width: 300px;
				height: 30px;
				background-color: #ebeff3;
				box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.25);
				border-radius: 16px;
				font-weight: 400;
				font-size: 16px;
				line-height: 22px;
				text-align: center;
				color: #6A8AC9;
				box-sizing: border-box;
			}

			ul {
				width: 100%;
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
			}
		}

		.cmd-content {
			display: flex;
			align-items: center;
			margin: 5px 0;
			padding: 8px;
			width: 337px;
			min-height: 36px;
			background-color: #F5F8FD;
			box-shadow: 2px 2px 6px rgba(97, 111, 158, 0.25);
			border-radius: 8px;
			box-sizing: border-box;

			.cmd-index {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 18px;
				height: 18px;
				background: #fff;
				box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.25);
				border-radius: 9px;
				flex: 0 0 auto;

				span {
					font-weight: 400;
					font-size: 12px;
					line-height: 15px;
					color: #7B9FF2;
				}
			}

			.cmd-header {
				margin-left: 9px;
				font-weight: 400;
				font-size: 14px;
				line-height: 17px;
				color: #000;
				flex: 0 0 auto;
			}

			.cmd-desc {
				margin-left: 9px;
				font-weight: 400;
				font-size: 12px;
				line-height: 15px;
				color: #3D67BC;
				word-break: break-all;
				flex: 1;
			}
		}
	}

	footer {
		position: relative;
		margin-top: 16px;
		padding: 9px 0;
		height: 38px;
		text-align: center;
		box-sizing: border-box;

		&::before {
			content: "";
			position: absolute;
			top: 0;
			left: 26px;
			right: 26px;
			border: 2px solid #F2F6FC;
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		}

		.sign {
			font-weight: 400;
			font-size: 14px;
			line-height: 20px;
			text-align: center;
			color: #fff;
			text-shadow: 1px 1px 2px #000;
		}
	}
}
</style>