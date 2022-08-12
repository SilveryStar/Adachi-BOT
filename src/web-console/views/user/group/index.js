const template = `<div class="table-container user group-page">
	<div class="nav-btn-box">
    	<el-scrollbar class="horizontal-wrap">
			<nav-search :searchList="searchList" :searchData="listQuery" :showNum="1" :disabled="tableLoading" @change="getGroupData">
				<send-msg ref="sendMsgRef" :disabled="tableLoading" :selection-list="selectionList"></send-msg>
			</nav-search>
    	</el-scrollbar>
	</div>
    <div class="table-view">
		<el-table v-loading="tableLoading" :data="groupList" header-row-class-name="table-header" :height="tableHeight" stripe border @selection-change="selectionChange">
        	<el-table-column fixed="left" type="selection" width="50" align="center" prop="selection" label="筛选"></el-table-column>
			<el-table-column prop="index" type="index" :index="setRowIndex" align="center" min-width="50px"></el-table-column>
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
    	      		<el-button type="text" @click="openGroupModal(row)">编辑</el-button>
    	      		<el-button type="text" @click="exitGroup(row.groupId)">退群</el-button>
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
		:group-info="selectGroup"
		:cmdKeys="cmdKeys"
		:auth-level="authLevel"
		@close-dialog="resetCurrentData"
		@reload-data="getGroupData"
	></group-detail>
</div>`;

import $http from "../../../api/index.js";
import { formatRole } from "../../../utils/format.js";
import NavSearch from "../../../components/nav-search/index.js";
import GroupDetail from "./group-detail.js";
import SendMsg from "./send-msg.js";

const { defineComponent, reactive, onMounted, computed, ref, toRefs, inject } = Vue;
const { ElNotification, ElMessageBox } = ElementPlus;

export default defineComponent( {
	name: "Group",
	template,
	components: {
		NavSearch,
		GroupDetail,
		SendMsg
	},
	setup() {
		const state = reactive( {
			groupList: [],
			cmdKeys: [],
			currentPage: 1,
			pageSize: 10,
			totalGroup: 0,
			tableLoading: false,
			showGroupModal: false,
			selectGroup: {},
			// 所选列表数组
			selectionList: []
		} );
		
		const groupDetailRef = ref( null );
		const sendMsgRef = ref( null );
		
		const { device, deviceWidth, deviceHeight, showTab } = inject( "app" );
		
		const searchList = ref( [
			{ id: "groupId", name: "群号", type: "input" }
		] );
		
		const listQuery = reactive( {
			groupId: ""
		} )
		
		const authLevel = [ {
			label: "禁用",
			color: "#727272",
			value: 1
		}, {
			label: "正常",
			color: "#55db2c",
			value: 2
		} ];
		
		const tableHeight = computed( () => {
			return `${ deviceHeight.value - ( device.value === "mobile" ? 236 : 278 ) - ( showTab.value ? 40 : 0 ) }px`;
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
		
		function getGroupData() {
			state.tableLoading = true;
			$http.GROUP_LIST( {
				page: state.currentPage,
				length: state.pageSize,
				...listQuery
			}, "GET" ).then( resp => {
				state.groupList = resp.data.groupInfos;
				state.cmdKeys = resp.data.cmdKeys;
				state.totalGroup = resp.total;
				state.tableLoading = false;
			} ).catch( error => {
				state.tableLoading = false;
			} );
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
			try {
				const { value } = await ElMessageBox.prompt( "敏感操作，请输入 BOT 密码验证身份", '验证', {
					confirmButtonText: "确认",
					cancelButtonText: '取消',
					inputType: "password",
					inputPattern: /\w+/,
					inputErrorMessage: "请输入密码",
					center: true
				} )
				try {
					await $http.CHECK_PASSWORD( { pwd: value }, "POST" );
				} catch ( error ) {
					ElNotification( { title: "失败", message: "验证失败：密码错误", type: "error", } );
					return;
				}
			} catch ( error ) {
				return;
			}
			state.tableLoading = true;
			$http.GROUP_EXIT( { groupId }, "DELETE" ).then( resp => {
				getGroupData()
			} ).catch( () => {
				state.tableLoading = false;
			} );
		}
		
		function selectionChange( val ) {
			state.selectionList = val
		}
		
		function openGroupModal( row ) {
			state.selectGroup = JSON.parse( JSON.stringify( row ) );
			groupDetailRef.value.openModal();
		}
		
		function resetCurrentData() {
			state.selectGroup = {};
		}
		
		/* 设置行首index */
		function setRowIndex( index ) {
			return index + ( state.currentPage - 1 ) * state.pageSize + 1
		}
		
		return {
			...toRefs( state ),
			groupDetailRef,
			tableHeight,
			deviceWidth,
			deviceHeight,
			searchList,
			listQuery,
			authLevel,
			getRole,
			getGroupData,
			setRowIndex,
			exitGroup,
			selectionChange,
			openGroupModal,
			resetCurrentData
		};
	}
} );