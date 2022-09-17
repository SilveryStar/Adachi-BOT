const template = `<div class="table-container config">
	<el-alert title="该页内容修改完毕后续重启BOT或刷新配置才能生效" type="warning" show-icon />
	<el-form class="config-form" @submit.prevent>
		<Whitelist />
		<Cookies />
	</el-form>
</div>`

import Whitelist from "./whitelist.js";
import Cookies from "./cookies.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "ConfigOther",
	template,
	components: {
		Whitelist,
		Cookies
	},
	setup() {
	}
})