/**
 * 基础容器组件
 * @author AsukaMari
 * @date 2024-09-17
 * @licence MIT
 */
const template = `<div class="common-base">
	<header>
		<slot name="header-prefix">
			<div class="common-header-prefix"></div>
		</slot>
		<h1 class="common-base-header">{{ title }}</h1>
		<slot name="header-suffix">
			<div class="common-header-suffix"></div>
		</slot>
	</header>
	<main>
		<slot />
	</main>
	<footer>
		<slot name="header">
			<p class="common-base-footer">Created by Adachi-BOT v{{ version }}</p>
		</slot>
	</footer>
</div>`;

import { loadCss } from "../utils/loadAssets.js";
loadCss( "./styles/CommonBase.css" );

export default {
	name: "CommonBase",
	template,
	props: {
		title: {
			type: String,
			default: "标题"
		}
	},
	setup() {
		return {
			version: window.ADACHI_VERSION
		}
	}
}