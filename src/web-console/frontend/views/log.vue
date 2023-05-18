<template>
	<div class="table-container fix-height logger">
		<el-scrollbar class="horizontal-wrap">
			<div class="picker">
				<div class="picker-left">
					<el-date-picker
						v-model="currentDate"
						type="date"
						placeholder="选择日期"
						format="MM-DD"
						:clearable="false"
						:editable="false"
						:disabled-date="disabledDate"
						@change="dateChange"
					/>
					<div v-if="today" class="log-nav-item">
						<span class="content">自动置底</span>
						<el-switch
							v-model="autoBottom"
							active-color="#20a53a"
							inactive-color="#f1f1f1"
						/>
					</div>
					<div class="log-nav-item">
						<el-select v-model="queryParams.logLevel" placeholder="日志等级" @change="handleFilter"
						           @clear="handleFilter" clearable>
							<el-option v-for="(l, lKey) of logLevel" :key="lKey" :label="l" :value="l"/>
						</el-select>
					</div>
					<div class="log-nav-item">
						<el-select v-model="queryParams.msgType" placeholder="类型" @change="msgTypeChange"
						           @clear="msgTypeChange" clearable>
							<el-option v-for="(t, tKey) of msgType" :key="tKey" :label="t.label" :value="t.value"/>
						</el-select>
					</div>
					<div v-show="queryParams.msgType === 2" class="log-nav-item">
						<el-input v-model="queryParams.groupId" placeholder="请输入群号" @keydown.enter="handleFilter"
						          @clear="handleFilter" clearable></el-input>
					</div>
				</div>
				<div class="picker-right">
					<div class="copy-button" @click="copyAsReportFormat">去隐私复制</div>
				</div>
			</div>
		</el-scrollbar>
		<div class="log-container">
			<p v-if="loading" class="empty-promote">
				正在获取日志记录，请稍后...
			</p>
			<p v-else-if="!list.length" class="empty-promote">
				未找到{{ currentDate.getMonth() + 1 }}月{{ currentDate.getDate() }}日的日志...
			</p>
			<div v-else class="log-window">
				<el-scrollbar ref="scrollbarRef" class="log-scroll-container">
					<p v-for="msg in list" class="content-line">
						<span :style="{ color: msg.color }">[{{ msg.time }}] {{ msg.category }} [{{
								msg.level
							}}] - </span>
						<template v-for="(m, mKey) of msg.message" :key="mKey">
							<span v-if="m.type === 'text'">{{ m.data }}</span>
							<a v-if="m.type === 'link'" :href="m.data" target="_blank">{{ m.data }}</a>
						</template>
					</p>
				</el-scrollbar>
				<el-input
					v-model="cmdValue"
					class="cmd-input"
					:placeholder="cmdPlaceholder"
					@keyup.enter="cmdSubmit"
					:disabled="cmdInputLoading"
				>
					<template #prepend>
						<el-select v-model="cmdType" class="cmd-type-select">
							<el-option label="滑动验证码" :value="1"/>
							<el-option label="短信验证码" :value="2"/>
						</el-select>
					</template>
				</el-input>
				<el-pagination
					v-model:current-page="currentPage"
					:page-size="pageSize"
					:total="totalLog"
					:pager-count="7"
					layout="prev, pager, next"
					@current-change="pageChange"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import $http from "&/api";

import { onMounted, computed, reactive, watch, ref, nextTick } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElNotification, ElScrollbar } from "element-plus";
import { LogMessage } from "@/web-console/types/logger";
import { LogLevel } from "icqq";

interface QueryParams {
	logLevel: Uppercase<LogLevel> | "";
	msgType: 0 | 1 | 2 | null;
	groupId: string;
}

const route = useRoute();

const logLevel: Uppercase<LogLevel>[] = [ "TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "MARK" ];

const msgType = <const>[ {
	label: "系统",
	value: 0
}, {
	label: "私聊",
	value: 1
}, {
	label: "群聊",
	value: 2
} ];

const ws = ref<WebSocket | null>( null );

watch( () => route.path, () => {
	if ( ws.value ) ws.value.close();
} );

const cmdInfoMap: { path: "CONFIG_SET_TICKET" | "CONFIG_SET_CODE"; message: string }[] = [ {
	path: "CONFIG_SET_TICKET",
	message: "提交滑动验证码ticket成功"
}, {
	path: "CONFIG_SET_CODE",
	message: "提交短信验证码成功。"
} ];

const cmdValue = ref( "" );
const cmdInputLoading = ref( false );
const cmdType = ref<1 | 2>( 1 );

/* 发送 ticket 或 code */
async function cmdSubmit() {
	if ( !cmdValue.value ) return;
	cmdInputLoading.value = true;
	const cmdInfo = cmdInfoMap[cmdType.value - 1];
	try {
		await $http[cmdInfo.path].post( { data: cmdValue.value } );
		ElNotification( {
			title: "成功",
			message: cmdInfo.message,
			type: "success",
			duration: 1000
		} );
		cmdValue.value = "";
	} catch {
	}
	cmdInputLoading.value = false;
}

/* 输入框默认内容 */
const cmdPlaceholder = computed( () => {
	return `请输入${ [ "滑动验证码ticket", "短信验证码" ][cmdType.value - 1] }并回车发送`;
} );

const list = ref<LogMessage[]>( [] );
const autoBottom = ref( true );
const pageSize = ref( 750 );
const totalLog = ref( 0 );

/* 获取当前最大分页 */
const pageNum = computed( () => {
	return Math.ceil( totalLog.value / pageSize.value );
} );

/* 向列表添加 ws 通讯所得数据，若出现新一页，跳转最新页 */
async function addMsgToList( msg: LogMessage[] ) {
	const addMsg: LogMessage[] = [];
	// 合并进度条数据后存放
	msg.reduce( ( prev, cur ) => {
		if ( cur.category !== "[progress]" ) {
			addMsg.push( cur );
			if ( prev.category === "[progress]" ) {
				addMsg.push( prev );
			}
		}
		return cur;
	} );

	console.log(addMsg, "???")

	// 此时说明全都为进度条，为其添加最后一条数据
	if ( !addMsg.length ) {
		addMsg.push( msg[msg.length - 1] );
	}

	// 当要添加的第一条数据与数据列表中的最后一条数据都为进度条，清除列表中的最后一条数据
	if ( addMsg[0].category === "[progress]" && list.value[list.value.length - 1].category === "[progress]" ) {
		list.value.splice( -1, 1 );
	}

	const newPage = list.value.length + addMsg.length > pageSize.value;
	if ( newPage && autoBottom.value ) {
		await scrollToBottom();
	} else {
		list.value.push( ...addMsg.map( m => ( {
			...m,
			message: formatMessage( m.message )
		} ) ) );
	}
}

/* 开启 ws 通讯 */
function runWS() {
	let protocol = document.location.protocol === "https:" ? "wss:" : "ws:";
	ws.value = new WebSocket( `${ protocol }//${ document.location.host }/ws/log` );
	ws.value!.onmessage = event => {
		const msg: LogMessage[] = filterWsLogs( JSON.parse( event.data ) );
		if ( msg.length === 0 ) {
			return;
		}
		totalLog.value += msg.length;
		addMsgToList( msg ).then( () => {
			nextTick( () => {
				if ( autoBottom.value ) {
					scrollToBottom();
				}
			} );
		} );
	};
}

const queryParams: QueryParams = reactive( {
	logLevel: "",
	msgType: null,
	groupId: ""
} );

/* 过滤 ws 传递的 logs 数据 */
function filterWsLogs( logs ) {
	const logLevel = queryParams.logLevel;
	const msgType = queryParams.msgType;
	const groupId = queryParams.groupId;
	return logs.filter( el => {
		/* 过滤日志等级 */
		if ( logLevel && el.level !== logLevel.toUpperCase() ) {
			return false;
		}
		/* 过滤消息类型 */
		if ( typeof msgType === "number" ) {
			const reg = /^(?:send to|recv from): \[(Group|Private): .*?(\d+)/;
			const result = reg.exec( el.message );
			if ( result ) {
				const type = result[1];
				if ( msgType !== ( type === 'Group' ? 2 : 1 ) ) {
					return false;
				}
				if ( msgType === 2 && groupId && groupId !== result[2] ) {
					return false;
				}
			} else if ( msgType !== 0 ) {
				return false;
			}
		}
		return true;
	} );
}

const loading = ref( false );
const currentDate = ref<Date>( new Date() );
const currentPage = ref( 1 );

/* 获取日志列表 */
async function getLogsData( date = currentDate.value ) {
	loading.value = true;
	try {
		const resp = await $http.LOG_INFO.get( {
			date: date.getTime(),
			page: currentPage.value,
			length: pageSize.value,
			...queryParams
		} );
		if ( resp.data.length ) {
			list.value = resp.data.map( m => ( {
				...m,
				message: formatMessage( m.message )
			} ) );
			totalLog.value = <number>resp.total;
		}
	} catch {

	}
	loading.value = false;
}

/* 重置数据 */
function resetData() {
	list.value = [];
	currentPage.value = 1;
}

onMounted( () => {
	currentDate.value = getCurrentDate();
	dateChange( currentDate.value );
} )


const today = ref( true );

/* 日期切换 */
function dateChange( date: Date ) {
	resetData();
	queryParams.msgType = null;
	queryParams.logLevel = "";
	queryParams.groupId = "";

	getLogsData( date ).then( () => {
		today.value = isToday( date );
		if ( today.value ) {
			runWS();
			setTimeout( () => scrollToBottom(), 50 );
		} else if ( ws ) {
			ws.value?.close();
		}
	} );
}

/* 消息类型切换 */
async function msgTypeChange() {
	queryParams.groupId = "";
	await handleFilter();
}

/* 筛选条件变化查询 */
async function handleFilter() {
	resetData();
	await getLogsData();
}

const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>( null );

/* 切换分页 */
async function pageChange( page, isBottom ) {
	if ( !isBottom && scrollbarRef.value ) {
		scrollbarRef.value?.setScrollTop( 0 );
	}
	await getLogsData();
}

/* 滚动至底部 */
async function scrollToBottom() {
	// 当前不是最后一页时，切换到最后一页并发起分页请求
	if ( currentPage.value !== pageNum.value ) {
		currentPage.value = pageNum.value;
		await pageChange( null, true );
	}
	setTimeout( () => {
		if ( scrollbarRef.value?.wrapRef ) {
			scrollbarRef.value?.setScrollTop( scrollbarRef.value?.wrapRef.scrollHeight );
		}
	}, 10 );
}

function formatQrcodeMsg( msg ) {
	const msgRegex = /二维码图片已保存到：.+[\\\/]data[\\\/]qrcode\.png$/;
	return msg.replace( msgRegex, `二维码图片链接：${ location.origin }/oicq/data/qrcode.png` );
}

// 解析 message 信息
function formatMessage( msg ) {
	if ( typeof msg !== "string" ) {
		msg = JSON.stringify( msg ) || "";
	}
	msg = formatQrcodeMsg( msg );
	const urlRegex = /(?:(?:ht|f)tps?):\/\/[\w\-]+(?:\.[\w\-]+)+(?:[\w\-.,@?^=%&:/~+*#]*[\w\-@?^=%&/~+#])?/g;
	const match = msg.match( urlRegex );
	// 此时包含链接
	if ( match ) {
		const messageList = msg.split( urlRegex ).map( m => ( {
			type: "text",
			data: m
		} ) );

		let insertIndex = messageList.length - 1;
		match.forEach( m => {
			messageList.splice( -insertIndex, 0, {
				type: "link",
				data: m
			} );
			insertIndex--;
		} );
		return messageList;
	}
	return [ {
		type: "text",
		data: msg
	} ]
}

/* 获取当前 年月日 整日期 */
function getCurrentDate() {
	const date = new Date()
	return new Date( date.getFullYear(), date.getMonth(), date.getDate() )
}

/* 禁选未来时间 */
function disabledDate( time ) {
	return time.getTime() > Date.now() ||
		time.getTime() < new Date( "2021-11-2" ).getTime();
}

/* 是否为当天 */
function isToday( date ) {
	const d = new Date();
	return d.getDate() === date.getDate() &&
		d.getFullYear() === date.getFullYear() &&
		d.getMonth() === date.getMonth();
}

/* 去隐私复制 */
function copyAsReportFormat() {
	const selectContent = getSelection();
	if ( !selectContent ) {
		ElMessage( {
			message: "请先使用鼠标拖选内容",
			duration: 1500
		} );
		return;
	}
	const content = selectContent.toString().split( "\n\n" ).map( el => {
		el = el.replace( /\[(Android|aPad|Watch|iMac|iPad):\d+]/, "[$1:*****]" )
			.replace( / - recv from: \[Private: \d+\((friend|group)\)] (.*)/, " [Recv] [Pri-$1] $2" )
			.replace( / - recv from: \[Group: .*] (.*)/, " [Recv] [Group] $1" )
			.replace( / - send to: \[(Group|Private): .*]/, " [Send] [$1] ---" )
			.replace( /(\[[A-Z]+]) - (.*)/, "$1 [Event] $2" )
			.replace( /&#93;/g, "]" )
			.replace( /&#91;/g, "[" );
		return el;
	} ).join( "\n" );

	navigator.clipboard.writeText( content ).then( () => {
		ElMessage( {
			message: "内容已复制到剪切板",
			type: "success",
			duration: 1500
		} );
	} ).catch( error => {
		ElMessage( {
			message: `复制失败：${ error.message }`,
			type: "error",
			duration: 1500
		} );
	} );
}
</script>

<style lang="scss" scoped>
.logger {
	user-select: none;

	.horizontal-wrap,
	.picker .select-trigger {
		height: 38px;
	}

	.horizontal-wrap {
		background-color: #f1f1f1;
	}

	.picker {
		position: relative;
		display: flex;
		justify-content: space-between;
		height: 38px;

		.picker-left,
		.picker-right {
			display: flex;
			align-items: center;
		}

		:deep(.el-input) {
			position: relative;
			display: inline-flex;
			height: 38px;
			width: 15%;
			max-width: 180px;
			min-width: 108px;
			vertical-align: middle;
		}

		:deep(.el-input__wrapper) {
			position: relative;
			padding: 0;
			box-shadow: none !important;
			border-radius: 0;
			background-color: #424242;
		}

		.el-select {
			.el-input {
				:deep(.el-input__wrapper) {
					box-shadow: none !important;
				}
			}
		}

		.log-nav-item {
			> .el-input {
				:deep(.el-input__inner) {
					&::placeholder {
						color: #999;
					}
				}

				:deep(.el-input__wrapper) {
					&::after {
						content: "";
						position: absolute;
						left: 0;
						right: 0;
						bottom: 6px;
						height: 1px;
						background-color: #fff;
					}
				}
			}
		}

		:deep(.el-input__inner) {
			border-radius: unset;
			height: 38px;
			color: #fff;
			font-size: 14px;

			&::placeholder {
				color: #fff;
			}
		}

		:deep(.el-input--prefix) {
			.el-input__inner {
				padding-left: 38px;
			}
		}

		:deep(.el-input__prefix) {
			position: absolute;
			left: 12px;
			z-index: 1000;
		}

		:deep(.el-input__prefix-inner) {
			i.el-icon {
				color: #10952a;
			}
		}

		.log-nav-item {
			position: relative;
			display: inline-flex;
			width: 25%;
			max-width: 135px;
			min-width: 108px;
			height: 38px;
			color: #ffffff;
			background-color: #424242;
			vertical-align: middle;
		}

		.content {
			height: 38px;
			line-height: 38px;
			background-color: #424242;
			color: #ffffff;
			font-size: 14px;
		}

		.el-switch {
			margin: 3px 8px;
		}

		.copy-button {
			height: 38px;
			line-height: 38px;
			text-align: center;
			color: #424242;
			font-size: 13px;
			width: 95px;
			cursor: pointer;
		}

		.copy-button:hover {
			color: #10952a;
		}
	}
}

.log-container {
	position: relative;
	display: inline-block;
	background-color: #000;
	width: 100%;
	height: calc(100% - 38px);
	user-select: auto;
	font-family: Consolas, "宋体", monospace;

	.empty-promote {
		color: #ffffff;
		margin: 10px 14px;
	}

	:deep(.el-scrollbar__view) {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.content-line {
		user-select: text;
		line-height: 20px;
		font-size: 0.875rem;
		color: #fff;

		&::selection,
		span::selection {
			background-color: #4d4d4d;
		}

		span, a {
			user-select: inherit;
			white-space: pre-wrap;
		}

		a {
			cursor: pointer;
			text-decoration: underline;
		}
	}
}

.log-window {
	position: relative;
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 10px 14px 0;
	box-sizing: border-box;

	.log-scroll-container {
		flex: auto;
	}

	.el-pagination {
		flex: none;
		background-color: #000;
		text-align: center;
	}

	:deep(.cmd-input) {
		margin-top: 10px;
		flex: none;

		> .el-input__wrapper {
			padding: 0 5px;

			.el-input__inner {
				color: #fff;
			}
		}

		> .el-input__wrapper,
		.el-input-group__prepend {
			background-color: transparent;
			border-bottom: 1px solid var(--el-input-border-color);
			border-radius: 0;
			box-shadow: none;
			transition: border-color 0.2s;
		}

		> .el-input__wrapper:hover,
		.el-input-group__prepend:hover {
			border-color: var(--el-input-hover-border-color);
		}

		> .el-input__wrapper.is-focus,
		.el-input-group__prepend.is-focus {
			border-color: var(--el-input-focus-border-color);
		}

		.el-input-group__prepend {
			top: -1px;

			.el-select {
				&.cmd-type-select {
					.el-input {
						.el-input__wrapper {
							padding: 0 5px;
							background-color: transparent;
							box-shadow: none !important;
						}

						.el-input__inner {
							color: #fff;
						}
					}
				}
			}
		}

		.cmd-type-select {
			width: 102px;
		}
	}
}

:deep(.el-pagination) {
	button {
		&.btn-prev,
		&.btn-next {
			background-color: transparent;
			color: #ffffff;
		}

		&.btn-prev {
			padding-right: 3px;
		}

		&.btn-next {
			padding-left: 3px;
		}

		&:disabled {
			background-color: transparent;
			color: #ffffff;
		}

		&:hover {
			color: #20a53a;
		}
	}

	.el-pager {
		> li {
			background: transparent;
			color: #ffffff;
			margin: 0;
			padding: 0;
			width: 25px;
			min-width: 0;

			&.is-active {
				color: #20a53a;
			}
		}
	}
}

@media (max-width: 768px) {
	.logger {
		padding: 0;

		.horizontal-wrap,
		.picker .select-trigger {
			height: 30px;
			line-height: 26px;
		}

		.horizontal-wrap {
			background-color: #e8e8e8;
		}

		.picker {
			height: 30px;

			.log-nav-item {
				> :deep(.el-input) {
					height: 30px;

					.el-input__wrapper {
						padding: 0 5px;

						&::after {
							bottom: 4px;
						}
					}
				}
			}

			:deep(.el-input__inner),
			.content {
				font-size: 13px;
				height: 30px;
				line-height: 30px;
			}

			.log-nav-item {
				height: 30px;
			}

			.el-switch {
				margin: 0 8px;
			}

			.copy-button {
				height: 30px;
				line-height: 30px;
				font-size: 12px;
				width: 90px;
			}
		}

		.log-container {
			height: calc(100% - 30px);
		}

		.log-container .content-line {
			font-size: 0.78125rem;
			line-height: 18px;
		}
	}
}
</style>