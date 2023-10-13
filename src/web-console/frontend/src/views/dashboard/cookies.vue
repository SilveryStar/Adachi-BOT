<template>
	<div class="config-section cookies">
		<section-title title="米游社Cookies" desc="清空并保存以删除某项">
			<el-button type="primary" link @click="createCookie">新增</el-button>
		</section-title>
		<spread-form-item
			v-for="(c, cKey) of cookies"
			:key="cKey"
			:active-spread="activeSpread"
			v-model="cookies[cKey]"
			type="textarea"
			:disabled="pageLoading"
			:label="'cookie' + (cKey + 1)"
			placeholder="请输入cookie"
			@change="modifyOldCookie($event, cKey)"
			@open="activeSpreadItem"
		/>
		<spread-form-item
			v-if="showAddCookie"
			ref="addCookieRef"
			:active-spread="activeSpread"
			v-model="addCookieItem"
			type="textarea"
			:disabled="pageLoading"
			label="new cookie"
			placeholder="请输入cookie"
			@change="addNewCookie"
			@open="activeSpreadItem"
			@close="resetAddCookieItem"
		/>
	</div>
</template>

<script lang="ts" setup>
import $http from "@/api";
import SpreadFormItem from "@/components/spread-form-item/index.vue";
import SectionTitle from "@/components/section-title/index.vue";
import { onMounted, ref, nextTick } from "vue";
import { ElNotification } from "element-plus";

defineProps<{
	activeSpread: number | null;
}>();

const emits = defineEmits<{
	(e: "setActiveSpread", value: number | null)
}>();

/* 设置当前正在展开的项目 */
function activeSpreadItem( index ) {
	emits( "setActiveSpread", index );
}

const cookies = ref<string[]>([]);

/* 更新已存在ck */
async function modifyOldCookie( cookie, key ) {
	cookies.value[key] = cookie;
	if ( !cookie ) {
		cookies.value.splice( key, 1 );
	}
	await updateConfig();
}

/* 新增ck */
async function addNewCookie( cookie ) {
	if ( !cookie ) {
		return;
	}
	cookies.value.push( cookie );
	await updateConfig();
}


const pageLoading = ref(false);
async function getCookiesConfig() {
	pageLoading.value = true;
	try {
		const res = await $http.CONFIG_GET.get( { fileName: "cookies" } );
		cookies.value = res.data.cookies || [];
	} catch {}
	pageLoading.value = false;
}

onMounted( () => {
	getCookiesConfig();
} );

async function updateConfig() {
	pageLoading.value = true;
	try {
		await $http.CONFIG_SET.post( {
			fileName: "cookies",
			data: {
				cookies: cookies.value
			}
		} );
		ElNotification( {
			title: "成功",
			message: "更新成功。",
			type: "success",
			duration: 1000
		} );
	} catch {}
	pageLoading.value = false;
}

const showAddCookie = ref(false);
const addCookieRef = ref<InstanceType<typeof SpreadFormItem> | null>( null );
function createCookie() {
	showAddCookie.value = true;
	nextTick( () => {
		if ( addCookieRef.value ) {
			addCookieRef.value.spreadItem()
		}
	} )
}

const addCookieItem = ref("");
/* 重置添加ck项状态 */
function resetAddCookieItem() {
	addCookieItem.value = "";
	showAddCookie.value = false;
}
</script>

<style lang="scss" scoped>

</style>