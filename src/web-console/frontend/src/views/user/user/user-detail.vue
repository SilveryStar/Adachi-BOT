<template>
	<el-dialog v-model="showModal" class="user-detail-dialog no-header" @closed="closeModal" draggable>
		<div class="dialog-body user-detail" v-if="data">
			<div class="section-info">
				<p class="title">信息面板</p>
				<div class="user-base-info">
					<img class="avatar" :src="data.avatar" alt="ERROR" draggable="false"/>
					<div class="public-info">
						<p class="user-id">
							<span class="label">用户账号</span>
							<span>{{ data.userID }}</span>
						</p>
						<p class="nickname">
							<span class="label">用户昵称</span>
							<span>{{ data.nickname }}</span>
						</p>
						<p class="friend">
							<span class="label">已加好友</span>
							<span>{{ data.isFriend ? "是" : "否" }}</span>
						</p>
						<p class="nickname">
							<span class="label">权限等级</span>
							<span>{{ authLevelList[data.botAuth] && authLevelList[data.botAuth].label }}</span>
						</p>
					</div>
				</div>
			</div>
			<div class="section-info">
				<p class="title">指令使用分布</p>
				<el-scrollbar class="group-info" wrap-class="scrollbar-wrapper">
					<p v-for="(el, elKey) in data.groupInfoList" :key="elKey">{{ getUsedInfo( el ) }}</p>
				</el-scrollbar>
			</div>
			<div class="section-info">
				<p class="title">禁用指令列表</p>
				<el-scrollbar class="limit-info" wrap-class="scrollbar-wrapper">
					<ul class="limit-list">
						<template v-if="management.limits?.length">
							<li v-for="(l, lKey) of management.limits" :key="lKey" @click="changeCurrentKey(l)">{{ l }}
							</li>
						</template>
						<li class="limit-empty" v-else>该用户可以使用全部指令</li>
					</ul>
				</el-scrollbar>
			</div>
			<div class="section-info">
				<p class="title">订阅列表</p>
				<el-scrollbar class="sub-info" wrap-class="scrollbar-wrapper">
					<ul class="sub-list">
						<template v-if="data.subInfo && data.subInfo.length">
							<li v-for="(s, sKey) of data.subInfo" :key="sKey">{{ s }}</li>
						</template>
						<li class="sub-empty" v-else>该用户暂未使用订阅服务</li>
					</ul>
				</el-scrollbar>
			</div>
			<div class="section-info">
				<p class="title">管理面板</p>
				<ul class="management-info">
					<li class="auth-management article-item">
						<p class="label">权限设置</p>
						<div class="content">
							<el-radio-group v-model="management.auth" :disabled="data?.botAuth === 3">
								<el-radio-button
									v-for="a of authLevelList"
									:key="a.value"
									:style="{ 'background-color': a.color }"
									:label="a.value"
									:disabled="a.value === 3"
								>{{ a.label }}
								</el-radio-button>
							</el-radio-group>
						</div>
					</li>
					<li class="int-management article-item">
						<p class="label">操作冷却</p>
						<div class="content">
							<el-input v-model.number="management.int">
								<template #suffix>
									<span>ms</span>
								</template>
							</el-input>
						</div>
					</li>
					<li class="limit-management article-item">
						<p class="label">指令权限</p>
						<div class="content">
							<el-select v-model="currentKey" placeholder="选择指令Key" :disabled="management.auth === 3"
							           @change="changeCurrentKey">
								<el-option class="limit-key-dropdown-item" v-for="(c, cKey) of cmdKeys" :key="cKey"
								           :value="c"/>
							</el-select>
							<el-radio-group v-model="keyStatus" :disabled="!currentKey || management.auth === 3"
							                @change="changeKeyStatus">
								<el-radio-button :label="1">ON</el-radio-button>
								<el-radio-button :label="2">OFF</el-radio-button>
							</el-radio-group>
						</div>
					</li>
				</ul>
				<el-button class="save" @click="postChange" round>保存设置</el-button>
			</div>
		</div>
	</el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import $http from "@/api/index.js";
import { formatRole } from "@/utils/format";
import { AuthLevel } from "@/views/user/group/index.vue";

export interface UserInfo {
	userID: number;
	avatar: string;
	nickname: string;
	isFriend: boolean;
	botAuth: number;
	interval: number;
	limits: string[];
	groupInfoList: any[];
	subInfo?: string[]
}

const emits = defineEmits<{
	( e: "reloadData" ): void;
	( e: "closeDialog" ): void;
}>();

const props = withDefaults( defineProps<{
	data: UserInfo | null;
	authLevelList: AuthLevel[];
	cmdKeys: string[];
}>(), {
	data: null,
	authLevelList: () => [],
	cmdKeys: () => []
} );

const management = ref<{
	auth: number;
	int: number;
	limits: string[]
}>( {
	auth: 0,
	int: 0,
	limits: []
} );

const keyStatus = ref( 0 );
const currentKey = ref( "" );
const showModal = ref( false );

/* 填充管理字段对象 */
watch( () => props.data, ( val: UserInfo | null ) => {
	if ( !val ) return;
	if ( Object.keys( val ).length !== 0 ) {
		currentKey.value = "";
		keyStatus.value = 0;
		management.value.auth = val.botAuth;
		management.value.int = val.interval;
		management.value.limits = val.limits ? JSON.parse( JSON.stringify( val.limits ) ) : [];
	}
}, { immediate: true, deep: true } )

/* 获得地区分布展示内容 */
function getUsedInfo( el ) {
	if ( typeof el === "string" ) {
		return el;
	}
	return `群 ${ el.group_id } - [${ formatRole( el.role )?.label }]${ el.card || el.nickname }`;
}

/* 根据切换到的 key 更改按钮状态 */
function changeCurrentKey( key ) {
	currentKey.value = key;
	keyStatus.value = key
		? management.value.limits.includes( key )
			? 2
			: 1
		: 0;
}

function changeKeyStatus( status: number ) {
	/* 当切换为 on 并 limit 数组中存在该key时，移除 */
	if ( status === 1 && management.value.limits.includes( currentKey.value ) ) {
		management.value.limits.splice( management.value.limits.findIndex( el => el === currentKey.value ), 1 );
	}
	/* 当切换为 off 并 limit 数组中不存在该key时，添加 */
	if ( status === 2 && !management.value.limits.includes( currentKey.value ) ) {
		management.value.limits.push( currentKey.value );
	}
}

async function postChange() {
	if ( !props.data ) return;
	try {
		await $http.USER_SET.post( {
			target: props.data.userID,
			auth: management.value.auth,
			int: management.value.int,
			limits: JSON.stringify( management.value.limits )
		} );
		ElMessage.success( "设置保存成功" );
		showModal.value = false;
		emits( "reloadData" );
	} catch {
	}
}

function openModal() {
	showModal.value = true;
}

function closeModal() {
	emits( "closeDialog" );
}

defineExpose( {
	openModal,
	closeModal
} );
</script>

<style lang="scss" src="../../../assets/styles/user-detail.scss" scoped>
</style>