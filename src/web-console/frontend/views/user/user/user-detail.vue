<template>
	<el-dialog v-model="showModal" class="user-detail-dialog no-header" @closed="closeModal" draggable>
		<div class="dialog-body user-detail">
			<div class="section-info">
				<p class="title">信息面板</p>
				<div v-if="data" class="user-base-info">
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
				<el-scrollbar v-if="data" class="group-info" wrap-class="scrollbar-wrapper">
					<p v-for="(el, elKey) in data.groupInfoList" :key="elKey">{{ getUsedInfo( el ) }}</p>
				</el-scrollbar>
			</div>
			<div class="section-info">
				<p class="title">禁用指令列表</p>
				<el-scrollbar class="limit-info" wrap-class="scrollbar-wrapper">
					<ul class="limit-list">
						<template v-if="management.limits?.length">
							<li v-for="(l, lKey) of management.limits" :key="lKey" @click="changeCurrentKey(l)">{{
									l
								}}
							</li>
						</template>
						<li class="limit-empty" v-else>该用户可以使用全部指令</li>
					</ul>
				</el-scrollbar>
			</div>
			<div class="section-info">
				<p class="title">订阅列表</p>
				<el-scrollbar class="sub-info" wrap-class="scrollbar-wrapper">
					<ul class="sub-list" v-if="data">
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
							<el-radio-group v-model="management.auth" :disabled="data.botAuth === 3">
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
import $http from "&/api/index.js";
import { formatRole } from "&/utils/format";
import { UserInfo } from "@/web-console/backend/routes/user";
import { AuthLevel } from "&/views/user/group/index.vue";

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

<style lang="scss" scoped>
.user-detail {
	.user-base-info {
		display: flex;

		> .avatar {
			flex-shrink: 0;
			width: 108px;
			height: 108px;
			border-radius: 4px;
		}

		> .public-info {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			flex: 1;
			position: relative;
			margin-left: 28px;

			.label {
				margin-right: 16px;
				font-weight: 700;
				color: #333;
			}
		}
	}

	/* 使用分布 */
	.group-info {
		height: 60px;

		p {
			line-height: 24px;
			font-size: 15px;
			padding-left: 20px;
		}
	}

	/* 禁用指令列表 */
	.limit-info {
		height: 60px;

		.limit-list {
			display: flex;
			flex-wrap: wrap;
			padding: 0 20px;

			> li {
				width: 50%;
				line-height: 24px;
				font-size: 15px;

				&:not(.limit-empty) {
					cursor: pointer;

					&:hover {
						color: var(--el-color-primary);
					}
				}
			}
		}
	}

	/* 订阅列表 */
	.sub-info {
		height: 60px;

		.sub-list {
			display: flex;
			flex-wrap: wrap;
			padding: 0 20px;

			> li {
				width: 50%;
				line-height: 24px;
				font-size: 15px;
			}
		}
	}

	/* 管理面板 */
	.management-info {
		> .article-item {
			display: flex;
			align-items: center;
			margin: 6px;
			height: 36px;

			> .label {
				font-size: 16px;
				height: 36px;
				line-height: 36px;
				font-weight: 700;
				margin-right: 20px;
				color: #333;
				flex-shrink: 0;
			}

			> .content {
				display: flex;
				align-items: center;
				flex: 1;
			}
		}

		/* 权限设置 */
		> .auth-management {
			.el-radio-group {
				.el-radio-button {
					opacity: .3;
					transition: opacity .2s;

					&:first-child {
						border-radius: 4px 0 0 4px;
					}

					&:last-child {
						border-radius: 0 4px 4px 0;
					}

					&.is-active {
						opacity: 1;
					}

					:deep(.el-radio-button__inner) {
						padding: 7px 14px;
						background-color: transparent;
						border: none;
						box-sizing: border-box;
						color: #ffffff;
						font-size: 16px;
						box-shadow: none !important;
					}
				}
			}
		}

		/* 操作冷却 */
		> .int-management {
			.el-input {
				position: relative;
				width: 86px;

				:deep(.el-input__wrapper) {
					padding: 0 20px 0 5px;
					height: inherit;
					background-color: transparent;
					border: none;
					border-radius: 0;
					border-bottom: 1px solid #424242;
					text-align: center;
					box-shadow: none;
				}

				:deep(.el-input__suffix) {
					color: #424242;
					width: 16px;
					height: inherit;
					line-height: var(--el-input-height);
				}
			}
		}

		/* 指令权限 */
		> .limit-management {
			.el-select {
				width: 186px;

				.el-input {
					height: var(--el-input-height);
					line-height: var(--el-input-height);
					font-size: 14px;
				}

				:deep(.el-input__wrapper) {
					border: none;
					background-color: transparent;
					color: #424242;
					padding: 0;
					box-shadow: none !important;
				}

				:deep(.el-input__inner) {
					&::placeholder {
						color: #424242;
						font-size: 14px;
					}
				}

				.limit-key-dropdown-item {
					font-size: 14px;
					line-height: 26px;
					height: 26px;
					color: #424242;
				}
			}

			.el-radio-group {
				margin-left: 32px;
			}

			:deep(.el-radio-button__inner) {
				padding: 0 10px;
				width: 50px;
				height: 28px;
				background-color: #f1f1f1;
				border-color: #616161;
				color: #333;
				font-size: 14px;
				line-height: 28px;
			}

			.is-active {
				:deep(.el-radio-button__inner) {
					background-color: #b1b1b1;
					box-shadow: none;
					color: #fff;
				}
			}
		}
	}
}

@media (max-width: 768px) {
	.user-detail {
		.user-base-info {
			> .avatar {
				width: 46px;
				height: 46px;
				align-self: center;
			}
		}

		.group-info,
		.limit-info,
		.sub-info {
			height: 40px;
		}

		.group-info p,
		.limit-info .limit-list > li,
		.sub-info .sub-list > li {
			font-size: 12px;
		}

		.management-info {
			> .article-item {
				margin: 4px;
				height: 24px;

				> .label {
					height: 24px;
					line-height: 24px;
					margin-right: 10px;
					font-size: 12px;
				}
			}

			> .int-management .el-input,
			> .limit-management .el-select .el-input {
				--el-input-height: 24px;
				height: var(--el-input-height);
				font-size: 12px;
			}

			.limit-management {
				.el-select {
					width: 140px;
				}
			}

			.auth-management {
				.el-radio-group {
					.el-radio-button {
						:deep(.el-radio-button__inner) {
							padding: 4px 6px;
							font-size: 12px;
						}
					}
				}
			}

			.limit-management {
				.el-radio-group {
					margin-left: 16px;
				}

				:deep(.el-radio-button__inner) {
					padding: 0 5px;
					width: 38px;
					height: 22px;
					line-height: 20px;
					font-size: 12px;
				}
			}
		}

		.save {
			height: 24px;
			width: 80px;
			padding: 2px 8px;
			font-size: 12px;
		}
	}
}
</style>