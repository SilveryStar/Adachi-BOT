const template = `<div class="table-container message-page">
	<div class="nav-btn-box">
    	<el-scrollbar class="horizontal-wrap">
			<nav-search :searchList="searchList" :searchData="listQuery" :showNum="1" :disabled="tableLoading" @change="getMessageData"></nav-search>
    	</el-scrollbar>
	</div>
    <div class="table-view">
		<el-table v-loading="tableLoading" :data="messageList" header-row-class-name="table-header" :height="tableHeight" stripe border>
			<el-table-column prop="index" type="index" :index="setRowIndex" align="center" width="50px"></el-table-column>
			<el-table-column prop="user" label="QQ" align="center" width="120px"></el-table-column>
			<el-table-column prop="content" label="内容" align="center" min-width="120px" show-overflow-tooltip>
				<template #default="{row}">{{ formatContent(row.content) }}</template>
			</el-table-column>
			<el-table-column prop="date" label="日期" align="center" width="180px">
				<template #default="{row}">{{ formatTime(row.date) }}</template>
			</el-table-column>
			<el-table-column prop="setting" label="操作" align="center" width="100px">
				<template #default="{row}">
    	      		<el-button type="text" @click="openMessageModal(row)">处理</el-button>
    	      		<el-button type="text" @click="ignoreMessage(row)">忽略</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			v-model:current-page="currentPage"
			layout="prev, pager, next"
			:page-size="pageSize"
			:pager-count="7"
			:total="totalMessage"
			@current-change="getMessageData"></el-pagination>
	</div>
    <el-dialog v-model="showMessageModal" custom-class="no-header" @closed="closeMessageModal" draggable>
    	<send-message :message-info="selectMessage" @close-dialog="closeMessageModal" @reload-data="getMessageData"></send-message>
    </el-dialog>
</div>`;

import $http from "../../api/index.js";
import { parseTime } from "../../utils/format.js";
import NavSearch from "../../components/nav-search/index.js";
import SendMessage from "./send-message.js"

const { defineComponent, reactive, onMounted, computed, ref, toRefs, inject } = Vue;
const { ElMessageBox } = ElementPlus;

export default defineComponent( {
	name: "Message",
	template,
	components: {
		NavSearch,
		SendMessage
	},
	setup() {
		const state = reactive( {
			messageList: [],
			currentPage: 1,
			pageSize: 10,
			totalMessage: 0,
			tableLoading: false,
			showMessageModal: false,
			selectMessage: {}
		} );
		
		const { device, deviceWidth, deviceHeight, showTab } = inject( "app" );
		
		const searchList = ref( [
			{ id: 'userId', name: '用户QQ', type: 'input' }
		] );
		
		const listQuery = reactive( {
			userId: "",
		} )
		
		const tableHeight = computed( () => {
			return `${ deviceHeight.value - ( device.value === "mobile" ? 236 : 278 ) - ( showTab.value ? 40 : 0 ) }px`;
		} );
		
		/* 日期格式化 */
		const formatTime = timestamp => parseTime( timestamp );
		
		/* 格式化内容 */
		function formatContent( content ) {
			const reg = /\[CQ:image,.*url=(.+?)]/ig
			return content.replace( reg, "[图片]" );
		}
		
		function getMessageData() {
			state.tableLoading = true;
			$http.MESSAGE_LIST( {
				page: state.currentPage,
				length: state.pageSize,
				sort: "desc",
				...listQuery
			}, "GET" ).then( resp => {
				state.messageList = resp.data;
				state.totalMessage = resp.total;
				state.tableLoading = false;
			} ).catch( error => {
				state.tableLoading = false;
			} );
		}
		
		async function ignoreMessage( message ) {
			try {
				await ElMessageBox.confirm( "忽略后此消息将不再可见，是否继续？", '提示', {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning",
					center: true
				} )
			} catch ( error ) {
				return;
			}
			state.tableLoading = true;
			$http.MESSAGE_REMOVE( message, "DELETE" ).then( async () => {
				getMessageData()
			} ).catch( () => {
				state.tableLoading = false;
			} )
		}
		
		function openMessageModal( row ) {
			state.showMessageModal = true;
			state.selectMessage = JSON.parse( JSON.stringify( row ) );
		}
		
		function closeMessageModal() {
			state.showMessageModal = false;
			state.selectMessage = {};
		}
		
		/* 设置行首index */
		function setRowIndex( index ) {
			return index + ( state.currentPage - 1 ) * state.pageSize + 1
		}
		
		onMounted( () => {
			getMessageData();
		} )
		
		return {
			...toRefs( state ),
			tableHeight,
			deviceWidth,
			deviceHeight,
			searchList,
			listQuery,
			formatTime,
			formatContent,
			getMessageData,
			ignoreMessage,
			setRowIndex,
			openMessageModal,
			closeMessageModal
		};
	}
} );