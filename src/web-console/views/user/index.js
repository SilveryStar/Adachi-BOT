const template = `<div class="user-page">
    <div class="nav-btn-box">
      	<el-input v-model="listQuery.userId" placeholder="请输入qq号" @clear="getUserData" @keyup.enter="getUserData" clearable />
    </div>
    <div class="table-view">
		<el-table v-loading="tableLoading" :data="userList" header-row-class-name="users-table-header" :height="tableHeight" stripe border>
			<el-table-column v-if="deviceWidth > 475"  prop="index" type="index" :index="setRowIndex" align="center" min-width="50px"></el-table-column>
			<el-table-column v-if="deviceWidth > 420" prop="userID" label="QQ" align="center" min-width="110px"></el-table-column>
			<el-table-column prop="avatar" label="用户" align="center" min-width="220px">
				<template #default="{row}">
					<div class="user-info">
						<img class="user-avatar" :src="row.avatar" alt="ERROR" draggable="false" />
						<span class="user-nickname">{{ row.nickname }}</span>
					</div>
				</template>
			</el-table-column>
			<el-table-column v-if="deviceWidth > 980" prop="botAuth" label="权限" align="center" min-width="140px">
				<template #default="{row}">
					<div class="user-auth" :style="{ 'background-color': authLevel[row.botAuth].color }">
						<span>{{ authLevel[row.botAuth].label }}</span>
					</div>
				</template>
			</el-table-column>
			<el-table-column v-if="deviceWidth > 840" prop="isFriend" label="好友" align="center" min-width="60px">
				<template #default="{row}">
					<span :style="{ color: row.isFriend ? '#55db2c' : '#ff0000' }">{{ row.isFriend ? "是" : "否" }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="setting" label="操作" align="center" min-width="60px">
				<template #default="{row}">
    	      		<el-button type="text" @click="editUser(row)">编辑</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			v-model:current-page="currentPage"
			layout="prev, pager, next"
			:page-size="pageSize"
			:pager-count="7"
			:total="totalUser"
			@current-change="pageChange"></el-pagination>
	</div>
</div>`;

import $http from "../../api/index.js";

const { defineComponent, reactive, onMounted, computed, toRefs, inject } = Vue;
const { ElMessage } = ElementPlus;

export default defineComponent( {
	name: "User",
	template,
	setup() {
		const state = reactive( {
			userList: [],
			currentPage: 1,
			pageSize: 10,
			totalUser: 0,
			tableLoading: false
		} );
		
		const { device, deviceWidth, deviceHeight } = inject( "app" );
		
		const listQuery = reactive( {
			userId: ""
		} )
		
		const authLevel = [ {
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
		}, ];
		
		const tableHeight = computed( () => {
			return `${ deviceHeight.value - ( device.value === "mobile" ? 234 : 276 ) }px`;
		} );
		
		onMounted( () => {
			getUserData();
		} )
		
		function getUserData() {
			state.tableLoading = true;
			$http.USER_LIST( {
				page: state.currentPage,
				length: state.pageSize,
				...listQuery
			}, "GET" ).then( resp => {
				state.userList = resp.data.userInfos;
				state.cmdKeys = resp.data.cmdKeys;
				state.totalUser = resp.total;
				state.tableLoading = false;
			} ).catch( error => {
				ElMessage.error( error.message );
				state.tableLoading = false;
			} );
		}
		
		function editUser( row ) {
			console.log( row );
		}
		
		/* 分页 */
		function pageChange() {
			getUserData();
		}
		
		/* 设置行首index */
		function setRowIndex( index ) {
			return index + ( state.currentPage - 1 ) * state.pageSize + 1
		}
		
		return {
			...toRefs( state ),
			tableHeight,
			deviceWidth,
			deviceHeight,
			listQuery,
			authLevel,
			pageChange,
			getUserData,
			setRowIndex,
			editUser
		};
	}
} );