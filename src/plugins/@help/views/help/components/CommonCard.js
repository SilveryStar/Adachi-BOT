/**
 * 基础卡片组件
 * @author AsukaMari
 * @date 2024-09-17
 * @licence MIT
 */
const template = `<div class="common-card">
	<div class="common-card-header">
		<p>{{ title }}</p>
	</div>
	<div class="common-card-container">
		<slot />
	</div>
</div>`;

import { loadCss } from "../utils/loadAssets.js";
loadCss( "./styles/CommonCard.css" );

export default {
	name: "CommonCard",
	template,
	props: {
		title: {
			type: String,
			default: "小标题"
		}
	},
	setup() {
	
	}
}