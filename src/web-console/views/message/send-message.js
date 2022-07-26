const template = `<div class="dialog-body send-message">
	<div class="section-info">
		<p class="title">消息内容</p>
		<el-scrollbar class="message-box" wrap-class="scrollbar-wrapper">
			<p v-html="content"></p>
		</el-scrollbar>
	</div>
	<div class="section-info">
		<p class="title">发送消息</p>
		<el-input v-model="message" type="textarea" maxlength="120" resize="none" rows="4" show-word-limit></el-input>
		<el-button class="save" @click="send" round>回复</el-button>
	</div>
</div>`;

import $http from "../../api/index.js"

const { defineComponent, computed, ref } = Vue;
const { ElMessage } = ElementPlus;

export default defineComponent( {
	name: "SendMessage",
	template,
	emits: [ "reloadData", "closeDialog" ],
	props: {
		messageInfo: {
			type: Object,
			default: () => ( {} )
		}
	},
	setup( props, { emit } ) {
		
		const message = ref( "" );
		
		const content = computed( () => {
			const messageInfo = props.messageInfo;
			if ( messageInfo.content ) {
				const reg = /\[CQ:image,.*url=(.+?)]/ig;
				const header = `<span style="color: #be750c">来自用户「${ props.messageInfo.user }」：</span>`;
				return header + messageInfo.content.replace( reg, '<a href="$1" target="_blank">[点击查看图片]</a>' )
			}
		} )
		
		function send() {
			$http.MESSAGE_SEND( {
				...props.messageInfo,
				message: message.value
			}, "POST" ).then( () => {
				ElMessage.success( "发送消息成功" );
				emit( "reloadData" );
				emit( "closeDialog" );
			} ).catch( () => {
				ElMessage.error( "发送消息失败" );
			} );
		}
		
		return {
			message,
			content,
			send
		};
	}
} );