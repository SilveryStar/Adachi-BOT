<template>
	<div class="table-container message-page">
		<div class="nav-btn-box">
			<el-scrollbar class="horizontal-wrap">
				<nav-search :searchList="searchList" :searchData="listQuery" :showNum="1" :disabled="tableLoading"
				            @change="handleFilter"></nav-search>
			</el-scrollbar>
		</div>
		<div class="table-view">
			<el-table v-loading="tableLoading" :data="messageList" header-row-class-name="table-header"
			          :height="tableHeight" stripe>
				<el-table-column fixed="left" type="selection" width="50" align="center" prop="selection"
				                 label="筛选"></el-table-column>
				<el-table-column prop="user" label="QQ" align="center" width="120px"></el-table-column>
				<el-table-column prop="content" label="内容" align="center" min-width="120px" show-overflow-tooltip>
					<template #default="{row}">{{ formatContent( row.content ) }}</template>
				</el-table-column>
				<el-table-column prop="date" label="日期" align="center" width="180px">
					<template #default="{row}">{{ formatTime( row.date ) }}</template>
				</el-table-column>
				<el-table-column prop="setting" label="操作" align="center" width="100px">
					<template #default="{row}">
						<el-button @click="openMessageModal(row)" link>处理</el-button>
						<el-button @click="ignoreMessage(row)" link>忽略</el-button>
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
		<el-dialog v-model="showMessageModal" class="no-header" @closed="closeMessageModal" draggable>
			<send-message :message-info="selectMessage" @close-dialog="closeMessageModal"
			              @reload-data="getMessageData"></send-message>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import $http from "&/api";
import { reactive, onMounted, computed, ref } from "vue";
import { useAppStore } from "&/store";
import { ElMessageBox } from "element-plus";
import { parseTime } from "&/utils/format";
import NavSearch from "&/components/nav-search/index.vue";
import SendMessage from "./send-message.vue"
import { IMessage } from "@/web-console/backend/routes/message";
import { SearchItem } from "&/components/nav-search/nav-form.vue";


const searchList = ref<SearchItem[]>( [
	{ id: 'userId', name: '用户QQ', type: 'input' }
] );

/* 日期格式化 */
const formatTime = timestamp => parseTime( timestamp );

/* 格式化内容 */
function formatContent( content ) {
	const reg = /\[CQ:image,.*url=(.+?)]/ig
	return content.replace( reg, "[图片]" );
}

const app = useAppStore();

const tableHeight = computed( () => {
	return `${ app.deviceHeight - ( app.device === "mobile" ? 240 : 240 ) - ( app.showTab ? 40 : 0 ) }px`;
} );

const messageList = ref<IMessage[]>( [] );
const tableLoading = ref( false );
const totalMessage = ref( 0 );
const currentPage = ref( 1 );
const pageSize = ref( 15 );

const listQuery = reactive( {
	userId: "",
} );

async function getMessageData() {
	tableLoading.value = true;
	try {
		const resp = await $http.MESSAGE_LIST.get( {
			page: currentPage.value,
			length: pageSize.value,
			sort: "desc",
			...listQuery
		} )
		messageList.value = resp.data;
		totalMessage.value = resp.total || 0;
	} catch {
	}
	tableLoading.value = false;
}

/* 筛选条件变化查询 */
async function handleFilter() {
	currentPage.value = 1;
	await getMessageData();
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
	tableLoading.value = true;
	try {
		await $http.MESSAGE_REMOVE.post( message );
		await getMessageData()
	} catch {
		tableLoading.value = false;
	}
}

onMounted( () => {
	getMessageData();
} )

const showMessageModal = ref( false );
const selectMessage = ref<IMessage | null>( null );

function openMessageModal( row: IMessage ) {
	showMessageModal.value = true;
	selectMessage.value = JSON.parse( JSON.stringify( row ) );
}

function closeMessageModal() {
	showMessageModal.value = false;
	selectMessage.value = null;
}
</script>

<style lang="scss" scoped>
.message-page {
	.el-dialog {
		--dialog-height: 423px;
		width: 600px;
	}
}

@media (max-width: 768px) {
	.message-page {
		.el-dialog {
			width: 90%;
			--dialog-height: 362px;
		}
	}
}
</style>