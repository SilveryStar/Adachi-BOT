const template = `<div class="table-container config">
	<el-alert title="该页内容修改完毕后续重启BOT或刷新配置才能生效" type="warning" show-icon />
	<el-form class="config-form" @submit.prevent>
		<Whitelist />
		<Cookies :active-spread="activeSpread" @setActiveSpread="activeSpreadItem" />
		<div class="config-section">
			<section-title title="短信验证码Code" />
			<spread-form-item
				v-model="code"
				:active-spread="activeSpread"
				:disabled="pageLoading"
				label="code"
				placeholder="请输入短信验证码"
				@change="updateCode"
				@open="activeSpreadItem"
			/>
		</div>
		<div class="config-section">
			<section-title title="滑动验证码Ticket" />
			<spread-form-item
				v-model="ticket"
				:active-spread="activeSpread"
				type="textarea"
				:disabled="pageLoading"
				label="ticket"
				placeholder="请输入ticket"
				:rows="4"
				@change="updateTicket"
				@open="activeSpreadItem"
				hideContent
			/>
		</div>
	</el-form>
</div>`

import $http from "../../api/index.js";
import Whitelist from "./whitelist.js";
import Cookies from "./cookies.js";
import SpreadFormItem from "../../components/spread-form-item/index.js";
import SectionTitle from "../../components/section-title/index.js";

const { defineComponent, toRefs, reactive } = Vue;
const { ElNotification } = ElementPlus;

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
			activeSpread: "",
			ticket: "",
			code: ""
		} )
		
		async function updateCode() {
			state.pageLoading = true;
			try {
				await $http.CONFIG_SET_CODE( { data: state.code } );
				ElNotification( {
					title: "成功",
					message: "填写code成功。",
					type: "success",
					duration: 1000
				} );
				state.code = "";
				state.pageLoading = false;
			} catch ( error ) {
				state.pageLoading = false;
			}
		}
		
		async function updateTicket() {
			state.pageLoading = true;
			try {
				await $http.CONFIG_SET_TICKET( { data: state.ticket } );
				ElNotification( {
					title: "成功",
					message: "填写Ticket成功。",
					type: "success",
					duration: 1000
				} );
				state.ticket = "";
				state.pageLoading = false;
			} catch ( error ) {
				state.pageLoading = false;
			}
		}
		
		/* 设置当前正在展开的项目 */
		function activeSpreadItem( index ) {
			state.activeSpread = index;
		}
		
		return {
			...toRefs( state ),
			updateCode,
			updateTicket,
			activeSpreadItem
		}
	}
} )