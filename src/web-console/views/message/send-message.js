const template = `<div class="dialog-body send-message">
	<div class="section-info">
		<p class="title">消息内容</p>
		<el-scrollbar class="message-box" wrap-class="scrollbar-wrapper">
			<p class="user-content">
				<span style="color: #be750c">来自用户「{{ messageInfo.user }}」：</span>
				<template v-for="(m, mKey) of content" :key="m">
					<span v-if="m.type === 'text'">{{ m.message }}</span>
					<el-image
						v-else-if="m.type === 'image'"
						:src="m.src"
						:preview-src-list="m.imgList"
						:initial-index="m.index"
						referrerPolicy="no-referrer"
						fit="contain"
						alt="ERROR"
					></el-image>
				</template>
			</p>
		</el-scrollbar>
	</div>
	<div class="section-info">
		<p class="title">发送消息</p>
		<el-input v-model="message" type="textarea" maxlength="120" resize="none" rows="4" show-word-limit></el-input>
		<el-button class="save" @click="send" round>回复</el-button>
	</div>
</div>`;

import $http from "../../api/index.js"
import { isValidUrl } from "../../utils/url.js";

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
			const { content: msg } = props.messageInfo;
			if ( msg ) {
				const reg = /\[CQ:image,.*?url=((?:(?:ht|f)tps?):\/\/[\w\-]+(?:\.[\w\-]+)+(?:[\w\-.@?^=%&:/~+*#]*[\w\-@?^=%&/~+#])?).*?]/ig;
				
				const imgList = [];
				
				return msg.split( reg ).map( m => {
					if ( isValidUrl( m ) ) {
						imgList.push( m );
						return {
							type: "image",
							src: m,
							index: imgList.length - 1,
							imgList
						};
					} else {
						return {
							type: "text",
							message: m
						}
					}
				} );
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