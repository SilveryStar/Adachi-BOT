<template>
	<el-button type="primary" :disabled="disabled || batchMsgTimoutText.length !== 0" round @click="openModal">
		{{ batchMsgTimoutText || "群发消息" }}
	</el-button>
	<el-dialog v-model="showModal" class="send-msg-dialog no-header" @closed="closeModal" draggable>
		<div class="dialog-body send-msg">
			<div class="section-info">
				<p class="title">发送范围</p>
				<el-scrollbar class="group-list-box" wrap-class="scrollbar-wrapper">
					<ul v-if="selectionList.length !== 0" class="group-list">
						<li v-for="(s, sKey) of selectionList" :key="sKey">
							<img :src="s.groupAvatar" alt="AVATAR"/>
							<span>{{ s.groupName }}</span>
						</li>
					</ul>
					<p v-else>全部群聊</p>
				</el-scrollbar>
			</div>
			<div class="section-info">
				<p class="title">群发消息</p>
				<el-input v-model="content" type="textarea" maxlength="120" resize="none" rows="4"
				          show-word-limit></el-input>
				<p class="desc">
					<span>为防止同时群发消息导致风控，消息发送后，将依照以下机制在一定时间后随机推送至各个群聊：</span><br/>
					<span>- 每次间隔随机1-4s后发送;</span><br/>
					<span>- 发送8-12次后，下一次随机6-20s后发送。</span>
				</p>
				<el-button class="save" @click="msgSendBatch" round>发送</el-button>
			</div>
		</div>
	</el-dialog>
</template>

<script lang="ts" setup>
import $http from "&/api";
import { batchMsgSession } from "&/utils/session";
import { onMounted, ref } from "vue";
import { ElNotification, ElMessage, ElMessageBox } from "element-plus";
import { GroupData } from "@/web-console/backend/routes/group";

const emits = defineEmits<{
	( e: "closeDialog" ): void;
}>();

function closeModal() {
	emits( "closeDialog" );
}

function getLimitTime( differ ) {
	differ = Math.floor( differ / 1000 );
	const min = Math.floor( differ / 60 );
	const sec = ( differ % 60 ).toString().padStart( 2, "0" );
	return `${ min }分${ sec }秒`;
}

const batchMsgTimoutText = ref( "" );

/* 设置冷却时间显示 */
function setCdTimeShow( batchMsgTimout ) {
	const nowTime = new Date().getTime();
	if ( batchMsgTimout <= nowTime ) {
		return;
	}
	batchMsgTimoutText.value = getLimitTime( batchMsgTimout - nowTime );
	let timer: any = setInterval( () => {
		const now = new Date().getTime();
		if ( batchMsgTimout > now ) {
			batchMsgTimoutText.value = getLimitTime( batchMsgTimout - now );
		} else {
			batchMsgTimoutText.value = "";
			clearInterval( timer );
			timer = null;
		}
	}, 1000 );
}

onMounted( () => {
	const batchMsgTimout = batchMsgSession.get() || new Date().getTime();
	setCdTimeShow( batchMsgTimout );
} )

const props = withDefaults( defineProps<{
	selectionList: GroupData[];
	disabled?: boolean;
}>(), {
	selectionList: () => [],
	disabled: false
} );

const showModal = ref( false );
const content = ref( "" );

/* 发送消息 */
function msgSendBatch() {
	if ( !content.value ) {
		ElMessage.warning( "请输入要发送的内容" );
		return;
	}
	const groupIds = props.selectionList.map( s => s.groupId );
	$http.GROUP_SEND_BATCH.post( {
		groupIds,
		content: content.value
	} ).then( res => {
		const cdTime = res.data.cdTime;
		batchMsgSession.set( res.data.cdTime );
		setCdTimeShow( cdTime );
		ElNotification( {
			title: "成功",
			message: `发送成功，消息将在${ batchMsgTimoutText.value }内推送给所选群聊。`,
			type: "success",
		} );
		showModal.value = false;
	} ).catch( () => {
	} );
}

async function openModal() {
	if ( props.selectionList.length === 0 ) {
		try {
			await ElMessageBox.confirm( "未选择群聊，将为所有群聊发送消息", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
				center: true
			} );
		} catch ( error ) {
			return;
		}
	}
	showModal.value = true;
}
</script>

<style lang="scss" scoped>
/* 群组列表 */
.send-msg {
	.group-list-box {
		height: 60px;
		.group-list {
			display: flex;
			flex-wrap: wrap;
			row-gap: 10px;
			column-gap: 20px;
			> li {
				display: flex;
				align-items: center;
				line-height: 24px;
				font-size: 15px;
				> img {
					width: 32px;
					height: 32px;
					border-radius: 4px;
				}
				> span {
					width: 60px;
					margin-left: 4px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					font-size: 12px;
				}
			}
		}
	}
}
</style>