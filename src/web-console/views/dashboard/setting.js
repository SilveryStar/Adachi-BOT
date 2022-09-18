const template = `<div class="table-container config">
	<el-alert title="该页内容修改完毕后续重启BOT才能生效" type="warning" show-icon />
	<el-form :model="setting" class="config-form" @submit.prevent>
		<div class="config-section">
			<section-title title="基本设置" />
			<form-item label="登录方式">
				<el-radio-group v-model="setting.qrcode" :disabled="pageLoading" @change="updateConfig('qrcode')" >
					<el-radio :label="false">密码登录</el-radio>
					<el-radio :label="true">扫码登陆</el-radio>
				</el-radio-group>
			</form-item>
			<spread-form-item
				v-model="setting.master"
				:disabled="pageLoading"
				label="BOT主人QQ"
				placeholder="请输入BOT主人QQ号"
				verifyReg=".+"
				verifyMsg="该项为必填项"
				@change="updateConfig('master')"
			/>
			<form-item label="登录平台">
				<el-radio-group v-model="setting.platform" :disabled="pageLoading" @change="updateConfig('platform')" >
					<el-radio v-for="(p, pKey) of platformList" :key="pKey" :label="pKey + 1">{{ p }}</el-radio>
				</el-radio-group>
			</form-item>
			<form-item label="邀请入群权限" desc="邀请 BOT 入群时，BOT 自动接受入群邀请的权限等级。">
				<el-radio-group v-model="setting.inviteAuth" :disabled="pageLoading" @change="updateConfig('inviteAuth')" >
					<el-radio v-for="(a, aKey) of authList" :key="aKey" :label="a">{{ a }}</el-radio>
				</el-radio-group>
			</form-item>
			<form-item label="日志输出等级" desc="等级从上往下依次递减，日志输出会过滤掉比所设置等级更高的等级日志">
				<el-select v-model="setting.logLevel" placeholder="日志等级" @change="updateConfig('logLevel')">
					<el-option v-for="(l, lKey) of logLevel" :key="lKey" :label="l" :value="l"/>
				</el-select>
			</form-item>
			<form-item label="at用户" desc="BOT 在响应指令时，是否需要 at 用户。">
				<el-switch v-model="setting.atUser" :disabled="pageLoading" @change="updateConfig('atUser')" />
			</form-item>
			<form-item label="atBOT" desc="是否需要在使用指令时 @BOT 账号，只在群聊中生效，@BOT 必须在最前面。">
				<el-switch v-model="setting.atBOT" :disabled="pageLoading" @change="updateConfig('atBOT')" />
			</form-item>
			<form-item label="好友限制" desc="开启后在私聊环境下，未添加好友时 BOT 将不会响应，且被删除好友后自动清除订阅事件。">
				<el-switch v-model="setting.addFriend" :disabled="pageLoading" @change="updateConfig('addFriend')" />
			</form-item>
			<spread-form-item
				v-model="setting.countThreshold"
				:disabled="pageLoading"
				label="使用次数阈值"
				type="number"
				desc="如果用户在过去一小时内使用指令的次数超过了该值，BOT将向主人发送私聊提示信息。"
				@change="updateConfig('countThreshold')"
			/>
		</div>
		<div class="config-section">
		<section-title title="指令设置" />
			<form-item label="模糊匹配" desc="开启后BOT会对中文指令以及指令名称进行模糊匹配，要求必须以header开头且中文指令不得拆开。">
				<el-switch v-model="setting.fuzzyMatch" :disabled="pageLoading" @change="updateConfig('fuzzyMatch')" />
			</form-item>
			<form-item label="参数校验" desc="开启后若指令参数错误，BOT 将会给予提示。">
				<el-switch v-model="setting.matchPrompt" :disabled="pageLoading" @change="updateConfig('matchPrompt')" />
			</form-item>
			<spread-form-item
				v-model="setting.header"
				:disabled="pageLoading"
				label="指令起始符"
				placeholder="请输入指令起始符"
				desc='例：设置为 # 时，需使用 #help 来触发帮助指令。如果不想在指令前添加特殊符号，请置空。'
				@change="updateConfig('header')"
			/>
			<spread-form-item
				v-model="setting.groupIntervalTime"
				:disabled="pageLoading"
				label="群聊指令CD"
				type="number"
				desc="群聊中指令操作冷却时间，单位为毫秒(ms)。"
				@change="updateConfig('groupIntervalTime')"
			/>
			<spread-form-item
				v-model="setting.privateIntervalTime"
				:disabled="pageLoading"
				label="私聊指令CD"
				type="number"
				desc="私聊中指令操作冷却时间，单位为毫秒(ms)。"
				@change="updateConfig('privateIntervalTime')"
			/>
			<form-item label="帮助信息样式" desc="指令help响应信息所展示的样式。">
				<el-radio-group v-model="setting.helpMessageStyle" :disabled="pageLoading" @change="updateConfig('helpMessageStyle')" >
					<el-radio v-for="(h, hKey) of helpStyleList" :key="hKey" :label="h.value">{{ h.label }}</el-radio>
				</el-radio-group>
			</form-item>
			<spread-form-item
				v-model="setting.helpPort"
				:disabled="pageLoading"
				label="图片帮助端口"
				type="number"
				desc="帮助信息样式为 card 时有效，除非端口冲突否则不需要改动。"
				@change="updateConfig('helpPort')"
			/>
			<spread-form-item
				v-model="setting.callTimes"
				:disabled="pageLoading"
				label="call次数限制"
				type="number"
				desc="指令 联系bot持有者 每个用户一天内可使用的最大次数。"
				@change="updateConfig('callTimes')"
			/>
		</div>
		<div class="config-section">
			<section-title title="数据库设置" />
			<spread-form-item
				v-model="setting.dbPort"
				:disabled="pageLoading"
				label="数据库端口"
				type="number"
				desc="Docker 启动修改此值时，需将 redis.conf 中的 port 修改为与此处相同的值。"
				@change="updateConfig('dbPort')"
			/>
			<spread-form-item
				v-model="setting.dbPassword"
				:disabled="pageLoading"
				label="数据库密码"
				type="password"
				placeholder="请输入数据库密码"
				desc="非必填项，看个人需求设置。"
				@change="updateConfig('dbPassword')"
			/>
		</div>
		<div class="config-section">
			<section-title title="网页控制台相关" />
			<form-item label="启用控制台" desc="开启后即可通过公网ip+页面端口访问本系统。">
				<el-switch v-model="setting.webConsole.enable" :disabled="pageLoading" @change="updateConfig('webConsole.enable')" />
			</form-item>
			<template v-if="setting.webConsole.enable">
				<spread-form-item
					v-model="setting.webConsole.consolePort"
					:disabled="pageLoading"
					label="网页页面端口"
					type="number"
					desc="Docker启动修改此值时，需将 docker-compose.yml 中的 services.bot.ports 的第二个数字修改为与此处相同的值。"
					@change="updateConfig('webConsole.consolePort')"
				/>
				<spread-form-item
					v-model="setting.webConsole.tcpLoggerPort"
					:disabled="pageLoading"
					label="日志输出端口"
					type="number"
					@change="updateConfig('webConsole.tcpLoggerPort')"
				/>
				<spread-form-item
					v-model="setting.webConsole.logHighWaterMark"
					:disabled="pageLoading"
					label="读日志数据量"
					type="number"
					desc="控制日志单次读取的数据量，单位 kb，不填或置 0 时默认 64，越大读取越快，内存占用越大，反之同理。"
					@change="updateConfig('webConsole.logHighWaterMark')"
				/>
				<spread-form-item
					v-model="setting.webConsole.jwtSecret"
					:disabled="pageLoading"
					label="JWT验证秘钥"
					type="password"
					placeholder="请输入密钥"
					desc="非登陆密码，开启网页控制台时必填且不要泄露， 可以随意输入长度为 6~16 的仅由字母和数字组成的字符串。"
					verifyReg="[0-9a-zA-Z]{6,16}"
					verifyMsg="要求长度为 6~16，仅由字母和数字组成"
					@change="updateConfig('webConsole.jwtSecret')"
				/>
			</template>
		</div>
		<div class="config-section">
			<section-title title="自动聊天设置" />
			<form-item label="启用自动聊天" desc="开启后可通过群聊 @BOT 或私聊发送非指令语句来触发智能对话（当开启 atBOT 时，群聊 @ 无效）。">
				<el-switch v-model="setting.autoChat.enable" :disabled="pageLoading" @change="updateConfig('autoChat.enable')" />
			</form-item>
			<template v-if="setting.autoChat.enable">
				<form-item label="使用平台">
					<el-radio-group v-model="setting.autoChat.type" :disabled="pageLoading" @change="updateConfig('autoChat.type')" >
						<el-radio :label="1">青云客</el-radio>
						<el-radio :label="2">腾讯NLP</el-radio>
					</el-radio-group>
				</form-item>
				<template v-if="setting.autoChat.type === 2">
					<spread-form-item
						v-model="setting.autoChat.secretId"
						:disabled="pageLoading"
						label="secretId"
						type="password"
						placeholder="请输入secretId"
						@change="updateConfig('autoChat.secretId')"
					/>
					<spread-form-item
						v-model="setting.autoChat.secretKey"
						:disabled="pageLoading"
						label="secretKey"
						type="password"
						placeholder="请输入secretKey"
						@change="updateConfig('autoChat.secretKey')"
					/>
				</template>
			</template>
		</div>
	</el-form>
</div>`;

import $http from "../../api/index.js";
import FormItem from "../../components/form-item/index.js";
import SpreadFormItem from "../../components/spread-form-item/index.js";
import SectionTitle from "../../components/section-title/index.js";
import { objectGet, objectSet } from "../../utils/utils.js";

const { defineComponent, onMounted, reactive, toRefs } = Vue;
const { ElNotification } = ElementPlus;

export default defineComponent( {
	name: "Setting",
	template,
	components: {
		FormItem,
		SectionTitle,
		SpreadFormItem
	},
	setup() {
		const state = reactive( {
			setting: {
				webConsole: {},
				autoChat: {}
			},
			pageLoading: false
		} );
		
		const platformList = [ "安卓手机", "aPad", "安卓手表", "MacOS", "iPad" ];
		const authList = [ "master", "manager", "user" ];
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
		
		function getSettingConfig() {
			state.pageLoading = true;
			$http.CONFIG_GET( { fileName: "setting" }, "GET" ).then( res => {
				state.setting = res.data;
				state.pageLoading = false;
			} ).catch( () => {
				state.pageLoading = false;
			} )
		}
		
		async function updateConfig( field ) {
			state.pageLoading = true;
			const value = objectGet( state.setting, field );
			const data = {};
			objectSet( data, field, value );
			try {
				await $http.CONFIG_SET( { fileName: "setting", data } );
				ElNotification( {
					title: "成功",
					message: "更新成功。",
					type: "success",
					duration: 1000
				} );
				state.pageLoading = false;
			} catch ( error ) {
				state.pageLoading = false;
			}
		}
		
		
		onMounted( () => {
			getSettingConfig();
		} );
		
		return {
			...toRefs( state ),
			platformList,
			authList,
			helpStyleList,
			logLevel,
			updateConfig
		}
	}
} )