<template>
	<div class="table-container user">
        <div class="nav-btn-box">
            <el-scrollbar class="horizontal-wrap">
                <nav-search :searchList="searchList" :searchData="listQuery" :showNum="1" :disabled="tableLoading" @change="handleFilter">
                    <el-button type="primary" :disabled="selectionList.length === 0" round @click="exitGroupBatch">退出群聊</el-button>
                    <send-msg :disabled="tableLoading" :selection-list="selectionList"></send-msg>
                </nav-search>
            </el-scrollbar>
        </div>
        <div class="table-view">
            <el-table v-loading="tableLoading" :data="groupList" header-row-class-name="table-header" :height="tableHeight" stripe @selection-change="selectionChange">
                <el-table-column fixed="left" type="selection" width="50" align="center" prop="selection" label="筛选"></el-table-column>
                <el-table-column prop="groupId" label="群号" align="center" min-width="110px"></el-table-column>
                <el-table-column prop="avatar" label="用户" align="center" min-width="230px">
                    <template #default="{row}">
                        <div class="user-info">
                            <img class="user-avatar" :src="row.groupAvatar" alt="ERROR" draggable="false" />
                            <span class="user-nickname">{{ row.groupName }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="groupAuth" label="权限" align="center" min-width="100px">
                    <template #default="{row}">
                        <div class="lighter-block" :style="{ 'background-color': authLevel[row.groupAuth - 1].color }">
                            <span>{{ authLevel[row.groupAuth - 1].label }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="groupAuth" label="群身份" align="center" min-width="100px">
                    <template #default="{row}">
                        <div class="lighter-block" :style="{ 'background-color': getRole(row.groupRole).color }">
                            <span>{{ getRole(row.groupRole).label }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="setting" label="操作" align="center" min-width="85px">
                    <template #default="{row}">
                        <el-button type="primary" @click="openGroupModal(row)" link>编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                v-model:current-page="currentPage"
                layout="prev, pager, next"
                :page-size="pageSize"
                :pager-count="7"
                :total="totalGroup"
                @current-change="getGroupData"></el-pagination>
        </div>
        <group-detail
            ref="groupDetailRef"
            :data="selectGroup"
            :cmdKeys="cmdKeys"
            :auth-level-list="authLevel"
            @close-dialog="resetCurrentData"
            @reload-data="getGroupData"
        ></group-detail>
	</div>
</template>

<script lang="ts" setup>
import $http from "&/api";
import { reactive, onMounted, computed, ref } from "vue";
import { ElNotification, ElMessageBox } from "element-plus";
import { formatRole } from "&/utils/format.js";
import NavSearch from "&/components/nav-search/index.vue";
import GroupDetail from "./group-detail.vue";
import SendMsg from "./send-msg.vue";
import { GroupData } from "@/web-console/backend/routes/group";
import { useAppStore } from "&/store";
import { SearchItem } from "&/components/nav-search/nav-form.vue";

export interface AuthLevel {
	label: string;
	color: string;
	value: number;
}

const searchList = ref<SearchItem[]>( [
	{ id: "groupId", name: "群号", type: "input" }
] );

const authLevel: AuthLevel[] = [ {
	label: "禁用",
	color: "#727272",
	value: 1
}, {
	label: "正常",
	color: "#55db2c",
	value: 2
} ];

const app = useAppStore();

const tableHeight = computed( () => {
	return `${ app.deviceHeight - ( app.device === "mobile" ? 240 : 240 ) - ( app.showTab ? 40 : 0 ) }px`;
} );

onMounted( () => {
	getGroupData();
} )

/* 群身份信息 */
function getRole( role ) {
	return formatRole( role ) || {
		label: "未知",
		color: "#999"
	};
}

const tableLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(14);
const groupList = ref<GroupData[]>([]);
const cmdKeys = ref<string[]>([]);
const totalGroup = ref(0);
const listQuery: Record<string, any> = reactive( {
	groupId: ""
} )
async function getGroupData() {
	tableLoading.value = true;
	try {
		const resp = await $http.GROUP_LIST.get( {
			page: currentPage.value,
			length: pageSize.value,
			...listQuery
		} );

		groupList.value = resp.data.groupInfos;
		cmdKeys.value = resp.data.cmdKeys;
		totalGroup.value = resp.total || 0;
	} catch {}
	tableLoading.value = false;
}

/* 筛选条件变化查询 */
async function handleFilter() {
	currentPage.value = 1;
	await getGroupData();
}

async function exitGroup( groupId ) {
	try {
		await ElMessageBox.confirm( "确定退出/解散此群聊？", "提示", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning",
			center: true
		} )
	} catch ( error ) {
		return;
	}
	// try {
	// 	const { value } = await ElMessageBox.prompt( "敏感操作，请输入 BOT 密码验证身份", '验证', {
	// 		confirmButtonText: "确认",
	// 		cancelButtonText: '取消',
	// 		inputType: "password",
	// 		inputPattern: /\w+/,
	// 		inputErrorMessage: "请输入密码",
	// 		center: true
	// 	} )
	// 	try {
	// 		await $http.CHECK_PASSWORD( { pwd: value }, "POST" );
	// 	} catch ( error ) {
	// 		ElNotification( { title: "失败", message: "验证失败：密码错误", type: "error", } );
	// 		return;
	// 	}
	// } catch ( error ) {
	// 	return;
	// }
	tableLoading.value = true;
	try {
		await $http.GROUP_EXIT.post( { groupId } );
		await getGroupData();
	} catch {}
	tableLoading.value = false;
}

const selectionList = ref<GroupData[]>([]);
async function exitGroupBatch() {
	try {
		await ElMessageBox.confirm( "确定退出/解散这些群聊？", "提示", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning",
			center: true
		} )
	} catch ( error ) {
		return;
	}
	tableLoading.value = true;
	try {
		await $http.GROUP_EXIT_BATCH.post( {
			groupIds: selectionList.value.map( s => s.groupId )
		} );
		await getGroupData();
		ElNotification( {
			title: "成功",
			message: "退出群聊成功。",
			type: "success",
			duration: 2000
		} );
	} catch {}
	tableLoading.value = false;
}

function selectionChange( val: GroupData[] ) {
	selectionList.value = val;
}

const selectGroup = ref<GroupData | null>(null);
const groupDetailRef = ref<InstanceType<typeof GroupDetail> | null>( null );
function openGroupModal( row: GroupData ) {
	selectGroup.value = JSON.parse( JSON.stringify( row ) );
	groupDetailRef.value.openModal();
}

function resetCurrentData() {
	selectGroup.value = null;
}
</script>

<style lang="scss" scoped>

</style>