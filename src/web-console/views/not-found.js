const template = `<el-button type="primary" size="small" @click="$router.push('/')">回到首页</el-button>`

const { defineComponent } = Vue;

export default defineComponent( {
	name: "NotFound",
	template
} );