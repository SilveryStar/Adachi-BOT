const template = `<div class="config-section cookies">
	<section-title title="米游社Cookies配置" desc="清空内容并保存来删除某一项">
		<el-button type="primary" link @click="createCookie">新增</el-button>
	</section-title>
	<spread-form-item
		v-for="(c, cKey) of cookies.cookies"
		:key="cKey"
		v-model="c"
		type="textarea"
		:disabled="pageLoading"
		:label="'cookie' + (cKey + 1)"
		placeholder="请输入cookie"
		@change="modifyOldCookie($event, cKey)"
	/>
	<spread-form-item
		v-if="showAddCookie"
		ref="addCookieRef"
		v-model="addCookieItem"
		type="textarea"
		:disabled="pageLoading"
		label="new cookie"
		placeholder="请输入cookie"
		@change="addNewCookie"
		@close="resetAddCookieItem"
	/>
</div>`;

import $http from "../../api/index.js";
import FormItem from "../../components/form-item/index.js";
import SpreadFormItem from "../../components/spread-form-item/index.js";
import SectionTitle from "../../components/section-title/index.js";
import Tags from "../../components/tags/index.js";

const { defineComponent, onMounted, reactive, toRefs, ref, nextTick } = Vue;
const { ElNotification } = ElementPlus;

export default defineComponent( {
	name: "Cookies",
	template,
	components: {
		FormItem,
		SpreadFormItem,
		SectionTitle,
		Tags
	},
	setup() {
		const state = reactive( {
			cookies: {},
			addCookieItem: "",
			showAddCookie: false,
			pageLoading: false
		} );
		
		const addCookieRef = ref( null );
		
		function getCookiesConfig() {
			state.pageLoading = true;
			$http.CONFIG_GET( { fileName: "cookies" }, "GET" ).then( res => {
				state.cookies = res.data;
				state.pageLoading = false;
			} ).catch( () => {
				state.pageLoading = false;
			} )
		}
		
		/* 更新已存在ck */
		async function modifyOldCookie( cookie, key ) {
			state.cookies.cookies[key] = cookie;
			if ( !cookie ) {
				state.cookies.cookies.splice( key, 1 );
			}
			await updateConfig();
		}
		
		/* 新增ck */
		async function addNewCookie( cookie ) {
			if ( !cookie ) {
				return;
			}
			state.cookies.cookies.push( cookie );
			await updateConfig();
		}
		
		async function updateConfig() {
			state.pageLoading = true;
			try {
				await $http.CONFIG_SET( {
					fileName: "cookies",
					data: {
						cookies: state.cookies.cookies
					}
				} );
				ElNotification( {
					title: "成功",
					message: "更新成功。",
					type: "success",
					duration: 1000
				} );
				state.pageLoading = false;
			} catch ( error ) {
				state.pageLoading = false;
			}
		}
		
		function createCookie() {
			state.showAddCookie = true;
			nextTick( () => {
				if ( addCookieRef.value ) {
					addCookieRef.value.spreadItem()
				}
			} )
		}
		
		/* 重置添加ck项状态 */
		function resetAddCookieItem() {
			state.addCookieItem = "";
			state.showAddCookie = false;
		}
		
		
		onMounted( () => {
			getCookiesConfig();
		} );
		
		return {
			...toRefs( state ),
			addCookieRef,
			createCookie,
			addNewCookie,
			modifyOldCookie,
			resetAddCookieItem
		}
	}
} )