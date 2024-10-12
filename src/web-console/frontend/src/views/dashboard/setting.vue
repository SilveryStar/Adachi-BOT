<template>
	<div class="table-container config">
		<el-alert title="该页内容修改完毕后续重启BOT才能生效" type="warning" show-icon/>
		<el-form v-if="setting" :model="setting" class="config-form" @submit.prevent>
			<div class="config-section">
				<section-title title="基本设置"/>
				<form-item label="使用反向ws" desc="默认使用正向ws连接实现端，开启后使用反向ws">
					<el-switch
						v-model="setting.base.reverseClient"
						:disabled="pageLoading"
						@change="updateConfig('base', 'reverseClient')"
					/>
				</form-item>
				<spread-form-item
					v-if="setting.base.reverseClient"
					v-model="setting.base.wsPort"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="ws服务端口"
					type="number"
					desc="待onebot连接的websocket服务所占用的端口"
					@change="updateConfig('base', 'wsPort')"
					@open="activeSpreadItem"
				/>
				<template v-else>
					<spread-form-item
						v-model="setting.base.wsServer"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="Event服务地址"
						placeholder="onebot提供的正向websocket event服务地址"
						@change="updateConfig('base', 'wsServer')"
						@open="activeSpreadItem"
					/>
					<spread-form-item
						v-model="setting.base.wsApiServer"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="Api服务地址"
						placeholder="onebot提供的正向websocket api服务地址（若不填写，则默认等同于Event服务地址）"
						@change="updateConfig('base', 'wsApiServer')"
						@open="activeSpreadItem"
					/>
				</template>
				<spread-form-item
					v-model="setting.base.master"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					type="number"
					label="BOT主人QQ"
					placeholder="请输入BOT主人QQ号"
					@change="updateConfig('base', 'master')"
					@open="activeSpreadItem"
				/>
				<form-item label="邀请入群权限" desc="邀请 BOT 入群时，BOT 自动接受入群邀请的权限等级。">
					<el-radio-group v-model="setting.base.inviteAuth" :disabled="pageLoading"
					                @change="updateConfig('base', 'inviteAuth')">
						<el-radio v-for="a of authList" :key="a.value" :label="a.value">{{ a.label }}</el-radio>
					</el-radio-group>
				</form-item>
				<form-item label="日志输出等级" desc="等级从上往下依次递减，日志输出会过滤掉比所设置等级更高的等级日志">
					<el-select v-model="setting.base.logLevel" placeholder="日志等级"
					           @change="updateConfig('base', 'logLevel')">
						<el-option v-for="(l, lKey) of logLevel" :key="lKey" :label="l" :value="l"/>
					</el-select>
				</form-item>
				<form-item label="at用户" desc="BOT 在响应指令时，是否需要 at 用户。">
					<el-switch v-model="setting.base.atUser" :disabled="pageLoading"
					           @change="updateConfig('base', 'atUser')"/>
				</form-item>
				<form-item label="atBOT" desc="是否需要在使用指令时 @BOT 账号，只在群聊中生效，@BOT 必须在最前面。">
					<el-switch v-model="setting.base.atBOT" :disabled="pageLoading"
					           @change="updateConfig('base', 'atBOT')"/>
				</form-item>
				<form-item label="好友限制"
				           desc="开启后在私聊环境下，未添加好友时 BOT 将不会响应，且被删除好友后自动清除订阅事件。">
					<el-switch v-model="setting.base.addFriend" :disabled="pageLoading"
					           @change="updateConfig('base', 'addFriend')"/>
				</form-item>
				<spread-form-item
					v-model="setting.base.apiTimeout"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="API超时时间"
					type="number"
					desc="请求消息服务API的超时时间"
					@change="updateConfig('base', 'apiTimeout')"
					@open="activeSpreadItem"
				/>
				<spread-form-item
					v-model="setting.base.renderPort"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="BOT服务端口"
					type="number"
					desc="BOT 服务占用端口（网页控制台、公共路由等）"
					@change="updateConfig('base', 'renderPort')"
					@open="activeSpreadItem"
				/>
			</div>
			<div class="config-section">
				<section-title title="指令设置"/>
				<form-item label="指令起始符" desc="例：设置为 # 时，需使用 #help 来触发帮助指令。如果不想在指令前添加特殊符号，请置空">
					<Tags
						v-model="setting.directive.header"
						:disabled="pageLoading"
						@change="updateConfig('directive', 'header')"
					/>
				</form-item>
				<spread-form-item
					v-model="setting.directive.groupIntervalTime"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="群聊指令CD"
					type="number"
					desc="群聊中指令操作冷却时间，单位为毫秒(ms)。"
					@change="updateConfig('directive', 'groupIntervalTime')"
					@open="activeSpreadItem"
				/>
				<spread-form-item
					v-model="setting.directive.privateIntervalTime"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="私聊指令CD"
					type="number"
					desc="私聊中指令操作冷却时间，单位为毫秒(ms)。"
					@change="updateConfig('directive', 'privateIntervalTime')"
					@open="activeSpreadItem"
				/>
				<form-item label="帮助信息样式" desc="指令help响应信息所展示的样式。">
					<el-radio-group v-model="setting.directive.helpMessageStyle" :disabled="pageLoading"
					                @change="updateConfig('directive', 'helpMessageStyle')">
						<el-radio v-for="(h, hKey) of helpStyleList" :key="hKey" :label="h.value">{{
								h.label
							}}
						</el-radio>
					</el-radio-group>
				</form-item>
				<form-item label="模糊匹配"
				           desc="开启后BOT会对中文指令进行模糊匹配，要求必须以header开头且中文指令不得拆开。">
					<el-switch v-model="setting.directive.fuzzyMatch" :disabled="pageLoading"
					           @change="updateConfig('directive', 'fuzzyMatch')"/>
				</form-item>
				<form-item label="参数校验" desc="开启后若指令参数错误，BOT 将会给予提示。">
					<el-switch v-model="setting.directive.matchPrompt" :disabled="pageLoading"
					           @change="updateConfig('directive', 'matchPrompt')"/>
				</form-item>
				<spread-form-item
					v-model="setting.directive.concurrency"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="并发量"
					type="number"
					desc="可同时处理的最大指令数量"
					@change="updateConfig('directive', 'concurrency')"
					@open="activeSpreadItem"
				/>
				<spread-form-item
					v-model="setting.directive.callTimes"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="call次数限制"
					type="number"
					desc="指令[联系bot持有者]每个用户一天内可使用的最大次数。"
					@change="updateConfig('directive', 'callTimes')"
					@open="activeSpreadItem"
				/>
				<spread-form-item
					v-model="setting.directive.countThreshold"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="使用次数阈值"
					type="number"
					desc="如果用户在过去一小时内使用指令的次数超过了该值，BOT将向主人发送私聊提示信息。"
					@change="updateConfig('directive', 'countThreshold')"
					@open="activeSpreadItem"
				/>
				<form-item label="阈值使用限制" desc="开启后当用户使用超过阈值时，本小时内 BOT 将不再响应其指令。">
					<el-switch v-model="setting.directive.ThresholdInterval" :disabled="pageLoading"
					           @change="updateConfig('directive', 'ThresholdInterval')"/>
				</form-item>
				<spread-form-item
					v-model="setting.directive.imageQuality"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="渲染图片质量"
					type="number"
					desc="对渲染的图片进行缩放，1-2能够得到更清晰的图片，0-1则能加快图片指令的响应速度"
					:verifyReg="value => <number>value > 0 && <number>value <= 2"
					verifyMsg="请输入一个 0-2 之间的数字（不包括 0）"
					@change="updateConfig('directive', 'imageQuality')"
					@open="activeSpreadItem"
				/>
			</div>
			<div class="config-section">
				<section-title title="数据库设置"/>
				<spread-form-item
					v-model="setting.db.port"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="数据库端口"
					type="number"
					desc="Docker 启动修改此值时，需将 redis.conf 中的 port 修改为与此处相同的值。"
					@change="updateConfig('db', 'port')"
					@open="activeSpreadItem"
				/>
				<spread-form-item
					v-model="setting.db.password"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="数据库密码"
					type="password"
					placeholder="请输入数据库密码"
					desc="非必填项，看个人需求设置。"
					@change="updateConfig('db', 'password')"
					@open="activeSpreadItem"
				/>
			</div>
			<div class="config-section">
				<section-title title="发件人邮箱配置" desc="用于主动发送邮件相关功能，使用SMTP协议发送邮件"/>
				<spread-form-item
					v-model="setting.mail.host"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="邮箱服务主机"
					desc="要连接的主机名或 IP 地址，例如qq服务为smtp.qq.com。"
					@change="updateConfig('mail', 'host')"
					@open="activeSpreadItem"
				/>
				<spread-form-item
					v-model="setting.mail.port"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="邮箱服务端口"
					type="number"
					desc="安全连接关闭时默认587，反之465。"
					@change="updateConfig('mail', 'port')"
					@open="activeSpreadItem"
				/>
				<spread-form-item
					v-model="setting.mail.user"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="邮箱账号"
					desc="xxx@xx.com"
					@change="updateConfig('mail', 'user')"
					@open="activeSpreadItem"
				/>
				<spread-form-item
					v-model="setting.mail.pass"
					:active-spread="activeSpread"
					:disabled="pageLoading"
					label="邮箱密码"
					type="password"
					desc="各平台互不相同，如qq邮箱为授权码，请参考各自平台进行配置"
					@change="updateConfig('mail', 'pass')"
					@open="activeSpreadItem"
				/>
				<form-item label="开启安全连接" desc="一般情况下开启时port应为为465，反之则为587或25。">
					<el-switch v-model="setting.mail.secure" :disabled="pageLoading"
					           @change="updateConfig('mail', 'secure')"/>
				</form-item>
				<template v-if="setting.mail.secure">
					<spread-form-item
						v-model="setting.mail.servername"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="验证主机名"
						desc="host设置为IP地址时可选的TLS验证主机名"
						@change="updateConfig('mail', 'servername')"
						@open="activeSpreadItem"
					/>
					<form-item label="证书校验" desc="建议关闭，开启可能会存在认证问题">
						<el-switch v-model="setting.mail.rejectUnauthorized" :disabled="pageLoading"
						           @change="updateConfig('mail', 'rejectUnauthorized')"/>
					</form-item>
				</template>
				<form-item label="离线发送邮件" desc="当 BOT 意外掉线时，向 Master QQ邮箱发送邮件提醒">
					<el-switch v-model="setting.mail.logoutSend" :disabled="pageLoading"
					           @change="updateConfig('mail', 'logoutSend')"/>
				</form-item>
				<template v-if="setting.mail.logoutSend">
					<spread-form-item
						v-model="setting.mail.sendDelay"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="离线邮件延迟"
						type="number"
						desc="离线多久后发送邮件（分钟）"
						@change="updateConfig('mail', 'sendDelay')"
						@open="activeSpreadItem"
					/>
					<spread-form-item
						v-model="setting.mail.retry"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="重试次数"
						type="number"
						desc="发送失败时重新尝试发送次数"
						@change="updateConfig('mail', 'retry')"
						@open="activeSpreadItem"
					/>
					<spread-form-item
						v-model="setting.mail.retryWait"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="重试延迟"
						type="number"
						desc="发送失败后延迟多久重新尝试发送（分钟）"
						@change="updateConfig('mail', 'retryWait')"
						@open="activeSpreadItem"
					/>
				</template>
			</div>
			<div class="config-section">
				<section-title title="网页控制台相关"/>
				<form-item label="启用控制台" desc="开启后即可通过公网ip+页面端口访问本系统。">
					<el-switch v-model="setting.webConsole.enable" :disabled="pageLoading"
					           @change="updateConfig('webConsole', 'enable')"/>
				</form-item>
				<template v-if="setting.webConsole.enable">
					<spread-form-item
						v-model="setting.webConsole.tcpLoggerPort"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="日志输出端口"
						type="number"
						@change="updateConfig('webConsole', 'tcpLoggerPort')"
						@open="activeSpreadItem"
					/>
					<spread-form-item
						v-model="setting.webConsole.logHighWaterMark"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="读日志数据量"
						type="number"
						desc="控制日志单次读取的数据量，单位 kb，不填或置 0 时默认 64，越大读取越快，内存占用越高，反之同理。"
						@change="updateConfig('webConsole', 'logHighWaterMark')"
						@open="activeSpreadItem"
					/>
					<spread-form-item
						v-model="setting.webConsole.jwtSecret"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="JWT验证秘钥"
						type="password"
						placeholder="请输入密钥"
						desc="非登陆密码，开启网页控制台时必填且不要泄露， 可以随意输入长度为 6~16 的仅由字母和数字组成的字符串。"
						verifyReg="[0-9a-zA-Z]{6,16}"
						verifyMsg="要求长度为 6~16，仅由字母和数字组成"
						@change="updateConfig('webConsole', 'jwtSecret')"
						@open="activeSpreadItem"
					/>
				</template>
			</div>
			<div class="config-section">
				<section-title title="自动聊天设置"/>
				<form-item label="启用自动聊天"
				           desc="开启后可通过群聊 @BOT 或私聊发送非指令语句来触发智能对话（当开启 atBOT 时，群聊 @ 无效）。">
					<el-switch v-model="setting.autoChat.enable" :disabled="pageLoading"
					           @change="updateConfig('autoChat', 'enable')"/>
				</form-item>
				<template v-if="setting.autoChat.enable">
					<form-item label="使用平台">
						<el-radio-group v-model="setting.autoChat.type" :disabled="pageLoading"
						                @change="updateConfig('autoChat', 'type')">
							<el-radio :label="1">青云客</el-radio>
							<el-radio :label="2">腾讯NLP</el-radio>
							<el-radio :label="3">小爱同学</el-radio>
						</el-radio-group>
					</form-item>
					<form-item v-if="setting.autoChat.type === 3" label="语音发送">
						<el-switch v-model="setting.autoChat.audio" :disabled="pageLoading"
						           @change="updateConfig('autoChat', 'audio')"/>
					</form-item>
					<template v-if="setting.autoChat.type === 2">
						<spread-form-item
							v-model="setting.autoChat.secretId"
							:active-spread="activeSpread"
							:disabled="pageLoading"
							label="secretId"
							type="password"
							placeholder="请输入secretId"
							@change="updateConfig('autoChat', 'secretId')"
							@open="activeSpreadItem"
						/>
						<spread-form-item
							v-model="setting.autoChat.secretKey"
							:active-spread="activeSpread"
							:disabled="pageLoading"
							label="secretKey"
							type="password"
							placeholder="请输入secretKey"
							@change="updateConfig('autoChat', 'secretKey')"
							@open="activeSpreadItem"
						/>
					</template>
				</template>
			</div>
			<div class="config-section">
				<section-title title="白名单配置"/>
				<form-item label="启用白名单" desc="开启后 BOT 仅对白名单内的用户或群组作出响应。">
					<el-switch v-if="setting" v-model="setting.whiteList.enable" :disabled="pageLoading"
					           @change="updateConfig('whiteList', 'enable')"/>
				</form-item>
				<template v-if="setting?.whiteList.enable">
					<form-item label="用户列表" desc="置空则不对该类型进行限制。">
						<Tags v-model="setting.whiteList.user" :disabled="pageLoading" type="number"
						      @change="updateConfig('whiteList', 'user')"/>
					</form-item>
					<form-item label="群组列表" desc="置空则不对该类型进行限制。">
						<Tags v-model="setting.whiteList.group" :disabled="pageLoading" type="number"
						      @change="updateConfig('whiteList', 'group')"/>
					</form-item>
				</template>
			</div>
			<div class="config-section">
				<section-title title="刷屏控制"/>
				<form-item label="开启刷屏控制"
				           desc="开启后群聊内连续间隔小于1s发送消息，触发一定次数将会进行撤回+禁言处理（bot需要为管理员）。">
					<el-switch v-model="setting.banScreenSwipe.enable" :disabled="pageLoading"
					           @change="updateConfig('banScreenSwipe', 'enable')"/>
				</form-item>
				<template v-if="setting.banScreenSwipe.enable">
					<spread-form-item
						v-model="setting.banScreenSwipe.limit"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="次数限制"
						type="number"
						desc="连续发送消息几次后触发封禁"
						@change="updateConfig('banScreenSwipe', 'limit')"
						@open="activeSpreadItem"
					/>
					<spread-form-item
						v-model="setting.banScreenSwipe.duration"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="禁言时长"
						type="number"
						desc="单位为秒"
						@change="updateConfig('banScreenSwipe', 'duration')"
						@open="activeSpreadItem"
					/>
					<form-item label="开启提示消息" desc="开启后触发判定后会给予相关用户提示信息。">
						<el-switch v-model="setting.banScreenSwipe.prompt" :disabled="pageLoading"
						           @change="updateConfig('banScreenSwipe', 'prompt')"/>
					</form-item>
					<spread-form-item
						v-if="setting.banScreenSwipe.prompt"
						v-model="setting.banScreenSwipe.promptMsg"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="消息内容"
						placeholder="请输入指令起始符"
						@change="updateConfig('banScreenSwipe', 'promptMsg')"
						@open="activeSpreadItem"
					/>
				</template>
			</div>
			<div class="config-section">
				<section-title title="过量at限制"/>
				<form-item label="开启过量at限制"
				           desc="开启后群聊内消息包含超过限制数量的at消息时，将会进行撤回+禁言处理（bot需要为管理员）。">
					<el-switch v-model="setting.banHeavyAt.enable" :disabled="pageLoading"
					           @change="updateConfig('banHeavyAt', 'enable')"/>
				</form-item>
				<template v-if="setting.banHeavyAt.enable">
					<spread-form-item
						v-model="setting.banHeavyAt.limit"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="次数限制"
						type="number"
						desc="连续发送消息几次后触发封禁"
						@change="updateConfig('banHeavyAt', 'limit')"
						@open="activeSpreadItem"
					/>
					<spread-form-item
						v-model="setting.banHeavyAt.duration"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="禁言时长"
						type="number"
						desc="单位为秒"
						@change="updateConfig('banHeavyAt', 'duration')"
						@open="activeSpreadItem"
					/>
					<form-item label="开启提示消息" desc="开启后触发判定后会给予相关用户提示信息。">
						<el-switch v-model="setting.banHeavyAt.prompt" :disabled="pageLoading"
						           @change="updateConfig('banHeavyAt', 'prompt')"/>
					</form-item>
					<spread-form-item
						v-if="setting.banHeavyAt.prompt"
						v-model="setting.banHeavyAt.promptMsg"
						:active-spread="activeSpread"
						:disabled="pageLoading"
						label="消息内容"
						placeholder="请输入指令起始符"
						@change="updateConfig('banHeavyAt', 'promptMsg')"
						@open="activeSpreadItem"
					/>
				</template>
			</div>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import $http from "@/api";
import FormItem from "@/components/form-item/index.vue";
import SpreadFormItem from "@/components/spread-form-item/index.vue";
import SectionTitle from "@/components/section-title/index.vue";
import Tags from "@/components/tags/index.vue";
import { objectGet, objectSet } from "@/utils/utils";
import { ref, onMounted } from "vue";
import { ElNotification } from "element-plus";


const platformList = [ "安卓手机", "aPad", "安卓手表", "MacOS", "iPad", "旧版安卓" ];
const authList = [ {
	label: "master",
	value: 3
}, {
	label: "manager",
	value: 2
}, {
	label: "user",
	value: 1
} ];
const helpStyleList = [ {
	label: "单条文字",
	value: "message"
}, {
	label: "合并消息",
	value: "forward"
}, {
	label: "XML卡片",
	value: "xml"
}, {
	label: "图片",
	value: "card"
} ];

const logLevel = [ "trace", "debug", "info", "warn", "error", "fatal", "mark", "off" ];

const setting = ref<any>( null );
const pageLoading = ref( false );

interface WhitList {
	user: number[];
	group: number[];
}

async function getSettingConfig() {
	pageLoading.value = true;
	try {
		const res = await $http.CONFIG_BASE.get();
		setting.value = res.data;
	} catch {
	}
	pageLoading.value = false;
}

onMounted( () => {
	getSettingConfig();
} );

async function updateConfig( fileName, field ) {
	pageLoading.value = true;
	if ( !setting.value ) return;
	const value = objectGet( setting.value, `${ fileName }.${ field }` );
	const data = {};
	objectSet( data, field, value );
	try {
		await $http.CONFIG_SET.post( { fileName, data } );
		ElNotification( {
			title: "成功",
			message: "更新成功。",
			type: "success",
			duration: 1000
		} );
	} catch {
	}
	pageLoading.value = false;
}

const activeSpread = ref<number | null>( null );

/* 设置当前正在展开的项目 */
function activeSpreadItem( index: number | null ) {
	activeSpread.value = index;
}
</script>

<style lang="scss" scoped>

</style>