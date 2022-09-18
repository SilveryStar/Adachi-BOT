const template = `
<el-button type="primary" :disabled="disabled || batchMsgTimoutText.length !== 0" round @click="openModal">{{ batchMsgTimoutText || "群发消息" }}</el-button>
<el-dialog v-model="showModal" custom-class="send-msg-dialog no-header" @closed="closeModal" draggable>
	<div class="dialog-body send-msg">
		<div class="section-info">
			<p class="title">发送范围</p>
			<el-scrollbar class="group-list-box" wrap-class="scrollbar-wrapper">
				<ul v-if="selectionList.length !== 0" class="group-list">
					<li v-for="(s, sKey) of selectionList" :key="sKey">
						<img :src="s.groupAvatar" alt="AVATAR" />
						<span>{{ s.groupName }}</span>
					</li>
				</ul>
				<p v-else>全部群聊</p>
			</el-scrollbar>
		</div>
		<div class="section-info">
			<p class="title">群发消息</p>
			<el-input v-model="content" type="textarea" maxlength="120" resize="none" rows="4" show-word-limit></el-input>
			<p class="desc">
				<span>为防止同时群发消息导致风控，消息发送后，将依照以下机制在一定时间后随机推送至各个群聊：</span><br />
				<span>- 每次间隔随机1-4s后发送;</span><br />
				<span>- 发送8-12次后，下一次随机6-20s后发送。</span>
			</p>
			<el-button class="save" @click="msgSendBatch" round>发送</el-button>
		</div>
	</div>
</el-dialog>`

import $http from "../../../api/index.js";
import { batchMsgSession } from "../../../utils/session.js";

const { ElNotification, ElMessage, ElMessageBox } = ElementPlus;

const { defineComponent, toRefs, reactive, onMounted } = Vue;

export default defineComponent( {
	name: "SendMsg",
	template,
	emits: [ "closeDialog" ],
	props: {
		selectionList: {
			type: Array,
			default: () => []
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	setup( props, { emit } ) {
		const state = reactive( {
			showModal: false,
			content: "",
			batchMsgTimoutText: ""
		} )
		
		onMounted( () => {
			const batchMsgTimout = batchMsgSession.get() || new Date().getTime();
			setCdTimeShow( batchMsgTimout );
		} )
		
		function getLimitTime( differ ) {
			differ = Math.floor( differ / 1000 );
			const min = Math.floor( differ / 60 );
			const sec = ( differ % 60 ).toString().padStart( 2, "0" );
			return `${ min }分${ sec }秒`;
		}
		
		/* 设置冷却时间显示 */
		function setCdTimeShow( batchMsgTimout ) {
			const nowTime = new Date().getTime();
			if ( batchMsgTimout <= nowTime ) {
				return;
			}
			state.batchMsgTimoutText = getLimitTime( batchMsgTimout - nowTime );
			let timer = setInterval( () => {
				const now = new Date().getTime();
				if ( batchMsgTimout > now ) {
					state.batchMsgTimoutText = getLimitTime( batchMsgTimout - now );
				} else {
					state.batchMsgTimoutText = "";
					clearInterval( timer );
					timer = null;
				}
			}, 1000 )
		}
		
		/* 发送消息 */
		function msgSendBatch() {
			if ( !state.content ) {
				ElMessage.warning( "请输入要发送的内容" );
				return;
			}
			const groupIds = props.selectionList.map( s => s.groupId );
			$http.GROUP_BATCH_SEND( {
				groupIds,
				content: state.content
			}, "POST" ).then( res => {
				const cdTime = res.data.cdTime;
				batchMsgSession.set( res.data.cdTime );
				setCdTimeShow( cdTime );
				ElNotification( {
					title: "成功",
					message: `发送成功，消息将在${ state.batchMsgTimoutText }内推送给所选群聊。`,
					type: "success",
				} );
				state.showModal = false;
			} ).catch( error => {
				ElNotification( {
					title: "失败",
					message: error.message || "发送失败",
					type: "error",
				} );
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
			state.showModal = true;
		}
		
		function closeModal() {
			emit( "closeDialog" );
		}
		
		return {
			...toRefs( state ),
			msgSendBatch,
			openModal,
			closeModal
		}
	}
} )