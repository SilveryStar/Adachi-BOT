<template>
	<div class="dialog-body send-message">
		<div class="section-info">
			<p class="title">消息内容</p>
			<el-scrollbar class="message-box" wrap-class="scrollbar-wrapper">
				<p class="user-content">
					<span style="color: #be750c">来自用户「{{ messageInfo && messageInfo.user }}」：</span>
					<template v-for="(m, mKey) of content" :key="mKey">
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
			<el-input v-model="message" type="textarea" maxlength="120" resize="none" rows="4"
			          show-word-limit></el-input>
			<el-button class="save" @click="send" round>回复</el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import $http from "@/api";
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { isValidUrl } from "@/utils/verify";

export interface IMessage {
	user: number;
	content: string;
	date: number;
}

interface IProps {
	messageInfo: IMessage | null
}

const props = withDefaults( defineProps<IProps>(), {
	messageInfo: null
} );

const emits = defineEmits<{
	( e: "reloadData" ): void;
	( e: "closeDialog" ): void;
}>();

const content = computed( () => {
	const msg = props.messageInfo?.content;
	if ( !msg ) return [];

	const reg = /\[CQ:image,.*?url=((?:(?:ht|f)tps?):\/\/[\w\-]+(?:\.[\w\-]+)+(?:[\w\-.@?^=%&:/~+*#]*[\w\-@?^=%&/~+#])?).*?]/ig;

	const imgList: string[] = [];

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
} )


const message = ref( "" );

async function send() {
	await $http.MESSAGE_SEND.post( {
		...props.messageInfo,
		message: message.value
	} )
	emits( "reloadData" );
	emits( "closeDialog" );
	ElMessage.success( "发送消息成功" );
}
</script>

<style lang="scss" scoped>
.send-message {
	.message-box {
		height: 100px;

		.user-content {
			a {
				color: var(--el-color-primary);
			}

			.el-image,
			img {
				max-height: 100px;
			}
		}
	}
}
</style>