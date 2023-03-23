const template = `<div class="table-container config">
	<el-alert title="该页内容修改完毕后续重启BOT或刷新配置才能生效" type="warning" show-icon />
	<el-form class="config-form" @submit.prevent>
		<Whitelist />
		<Cookies :active-spread="activeSpread" @setActiveSpread="activeSpreadItem" />
	</el-form>
</div>`

import Whitelist from "./whitelist.js";
import Cookies from "./cookies.js";
import SpreadFormItem from "../../components/spread-form-item/index.js";
import SectionTitle from "../../components/section-title/index.js";

const { defineComponent, toRefs, reactive } = Vue;

export default defineComponent( {
	name: "ConfigOther",
	template,
	components: {
		Whitelist,
		Cookies,
		SpreadFormItem,
		SectionTitle
	},
	setup() {
		const state = reactive( {
			pageLoading: false,
			activeSpread: ""
		} )
		
		/* 设置当前正在展开的项目 */
		function activeSpreadItem( index ) {
			state.activeSpread = index;
		}
		
		return {
			...toRefs( state ),
			activeSpreadItem
		}
	}
} )