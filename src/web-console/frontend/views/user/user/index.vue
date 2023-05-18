<template>
    <div class="table-container user">
        <div class="nav-btn-box">
            <el-scrollbar class="horizontal-wrap">
                <nav-search :searchList="searchList" :searchData="listQuery" :showNum="1" :disabled="tableLoading" @change="handleFilter">
                    <el-button type="primary" :disabled="selectionList.length === 0" round @click="removeUserBatch">删除用户</el-button>
                </nav-search>
            </el-scrollbar>
        </div>
        <div class="table-view">
            <el-table v-loading="tableLoading" :data="userList" header-row-class-name="table-header" :height="tableHeight" stripe @selection-change="selectionChange">
                <el-table-column fixed="left" type="selection" width="50" align="center" prop="selection" label="筛选"></el-table-column>
                <el-table-column prop="userID" label="QQ" align="center" min-width="110px"></el-table-column>
                <el-table-column prop="avatar" label="用户" align="center" min-width="230px">
                    <template #default="{row}">
                        <div class="user-info">
                            <img class="user-avatar" :src="row.avatar" alt="ERROR" draggable="false" />
                            <span class="user-nickname">{{ row.nickname }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="botAuth" label="权限" align="center" min-width="100px">
                    <template #default="{row}">
                        <div class="lighter-block" :style="{ 'background-color': authLevel[row.botAuth].color }">
                            <span>{{ authLevel[row.botAuth].label }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="subInfo" label="订阅数" align="center" min-width="65px">
                    <template #default="{row}">
                        <span>{{ row.subInfo.length }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="isFriend" label="好友" align="center" min-width="60px">
                    <template #default="{row}">
                        <span :style="{ color: row.isFriend ? '#55db2c' : '#ff0000' }">{{ row.isFriend ? "是" : "否" }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="setting" label="操作" align="center" min-width="110px">
                    <template #default="{row}">
                        <el-button type="primary" v-if="row.subInfo.length" @click="removeSub(row.userID)" link>取消订阅</el-button>
                        <el-button type="primary" @click="openUserModal(row)" link>编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                v-model:current-page="currentPage"
                layout="prev, pager, next"
                :page-size="pageSize"
                :pager-count="7"
                :total="totalUser"
                @current-change="getUserData"></el-pagination>
        </div>
        <user-detail
            ref="userDetailRef"
            :data="selectUser"
            :cmdKeys="cmdKeys"
            :auth-level-list="authLevel"
            @close-dialog="resetCurrentData"
            @reload-data="getUserData"
        ></user-detail>
    </div>
</template>

<script lang="ts" setup>
import $http from "&/api";
import { reactive, onMounted, computed, ref } from "vue";
import { ElNotification, ElMessageBox } from "element-plus";
import NavSearch from "&/components/nav-search/index.vue";
import UserDetail from "./user-detail.vue";
import { useAppStore } from "&/store";
import { SearchItem } from "&/components/nav-search/nav-form.vue";
import { AuthLevel } from "&/views/user/group/index.vue";
import { UserInfo } from "@/web-console/types/user";

const subOptions = [
	{ label: "已订阅", value: 1 },
	{ label: "未订阅", value: 2 },
];

const searchList = ref<SearchItem[]>( [
	{ id: 'userId', name: 'QQ', type: 'input', placeholder: 'qq号' },
	{
		id: 'sub',
		name: '订阅',
		type: 'select',
		itemList: subOptions,
		placeholder: "是否存在订阅"
	}
] );

const authLevel: AuthLevel[] = [ {
	label: "Banned",
	color: "#727272",
	value: 0
}, {
	label: "User",
	color: "#55db2c",
	value: 1
}, {
	label: "Manager",
	color: "#31c0c2",
	value: 2
}, {
	label: "Master",
	color: "#ff0000",
	value: 3
} ];

const app = useAppStore();
const tableHeight = computed( () => {
	return `${ app.deviceHeight - ( app.device === "mobile" ? 240 : 240 ) - ( app.showTab ? 40 : 0 ) }px`;
} );

onMounted( () => {
	getUserData();
} )

const userList = ref<UserInfo[]>([]);
const cmdKeys = ref<string[]>([]);
const currentPage = ref(1);
const pageSize = ref(14);
const totalUser = ref(0);
const tableLoading = ref(false);

const listQuery = reactive<Record<string, any>>( {
	userId: "",
	sub: ""
} );

async function getUserData() {
	tableLoading.value = true;
	try {
		const resp = await $http.USER_LIST.get( {
			page: currentPage.value,
			length: pageSize.value,
			...listQuery
		} );
		userList.value = resp.data.userInfos;
		cmdKeys.value = resp.data.cmdKeys;
		totalUser.value = resp.total || 0;
	} catch {}
	tableLoading.value = false;
}

/* 筛选条件变化查询 */
async function handleFilter() {
	currentPage.value = 1;
	await getUserData();
}

async function removeSub( userId ) {
	try {
		await ElMessageBox.confirm( "确定移除该用户所有订阅服务？", '提示', {
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
		await $http.USER_SUB_REMOVE.post( { userId } );
		await getUserData()
		ElNotification( {
			title: "成功",
			message: "取消该用户订阅服务成功。",
			type: "success",
			duration: 2000
		} );
	} catch {}
	tableLoading.value = false;
}

// 所选列表数组
const selectionList = ref<UserInfo[]>([]);
async function removeUserBatch() {
	try {
		await ElMessageBox.confirm( "删除用户将会清空其订阅并解除好友关系，是否继续？", "提示", {
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
		await $http.USER_REMOVE_BATCH.post( {
			userIds: selectionList.value.map(s => s.userID)
		} );
		await getUserData();
		ElNotification( {
			title: "成功",
			message: "删除用户成功。",
			type: "success",
			duration: 2000
		} );
	} catch {}
	tableLoading.value = false;
}

function selectionChange( val: UserInfo[] ) {
	selectionList.value = val
}

const selectUser = ref<UserInfo | null>(null);
const userDetailRef = ref<InstanceType<typeof UserDetail> | null>( null );
function openUserModal( row: UserInfo ) {
	selectUser.value = JSON.parse( JSON.stringify( row ) );
	userDetailRef.value.openModal();
}

function resetCurrentData() {
	selectUser.value = null;
}
</script>

<style lang="scss" scoped>

</style>