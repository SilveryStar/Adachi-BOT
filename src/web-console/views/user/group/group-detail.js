const template = `<el-dialog v-model="showModal" custom-class="group-detail-dialog no-header" @closed="closeModal" draggable>
	<div class="dialog-body user-detail">
		<div class="section-info">
			<p class="title">信息面板</p>
			<div class="user-base-info">
				<img class="avatar" :src="groupInfo.groupAvatar" alt="ERROR" draggable="false" />
				<div class="public-info">
					<p class="user-id">
						<span class="label">群号</span>
						<span>{{ groupInfo.groupId }}</span>
					</p>
					<p class="nickname">
						<span class="label">群名</span>
						<span>{{ groupInfo.groupName }}</span>
					</p>
					<p class="auth">
						<span class="label">权限等级</span>
						<span>{{ authLevel[groupInfo.groupAuth - 1]?.label }}</span>
					</p>
					<p class="role">
						<span class="label">群身份</span>
						<span :style="{ color: role.color }" >{{ role.label }}</span>
					</p>
				</div>
			</div>
		</div>
		<div class="section-info">
			<p class="title">禁用指令列表</p>
			<el-scrollbar class="limit-info" wrap-class="scrollbar-wrapper">
				<ul class="limit-list">
					<template v-if="management.limits?.length" >
						<li v-for="(l, lKey) of management.limits" :key="lKey" @click="changeCurrentKey(l)">{{ l }}</li>
					</template>
					<li class="limit-empty" v-else>该群组可以使用全部指令</li>
				</ul>
			</el-scrollbar>
		</div>
		<div class="section-info">
			<p class="title">管理面板</p>
			<ul class="management-info">
				<li class="auth-management article-item">
					<p class="label">权限设置</p>
					<div class="content">
						<el-radio-group v-model="management.auth" >
							<el-radio-button
								v-for="a of authLevel"
								:key="a.value"
								:style="{ 'background-color': a.color }"
								:label="a.value"
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
						<el-select v-model="currentKey" placeholder="选择指令Key" @change="changeCurrentKey" >
						    <el-option class="limit-key-dropdown-item" v-for="(c, cKey) of cmdKeys" :key="cKey" :value="c" />
						</el-select>
				    	<el-radio-group v-model="keyStatus" :disabled="!currentKey" @change="changeKeyStatus" >
							<el-radio-button :label="1">ON</el-radio-button>
							<el-radio-button :label="2">OFF</el-radio-button>
						</el-radio-group>
					</div>
				</li>
			</ul>
			<el-button class="save" @click="postChange" round>保存设置</el-button>
		</div>
	</div>
</el-dialog>`;

import $http from "../../../api/index.js"
import { formatRole } from "../../../utils/format.js";

const { defineComponent, reactive, toRefs, watch } = Vue;
const { ElMessage } = ElementPlus;

export default defineComponent( {
	name: "GroupDetail",
	template,
	emits: [ "reloadData", "closeDialog" ],
	props: {
		groupInfo: {
			type: Object,
			default: () => ( {} )
		},
		authLevel: {
			type: Array,
			default: () => []
		},
		cmdKeys: {
			type: Array,
			default: () => []
		}
	},
	setup( props, { emit } ) {
		const state = reactive( {
			management: {
				auth: 0,
				int: 0,
				limits: []
			},
			role: {
				label: "未知",
				color: "#999"
			},
			currentKey: "",
			keyStatus: 0,
			showModal: false
		} );
		
		/* 填充管理字段对象 */
		watch( () => props.groupInfo, val => {
			if ( Object.keys( val ).length !== 0 ) {
				state.currentKey = "";
				state.keyStatus = 0;
				state.role = formatRole( val.groupRole ) || {
					label: "未知",
					color: "#999"
				};
				state.management.auth = val.groupAuth;
				state.management.int = val.interval;
				state.management.limits = val.limits ? JSON.parse( JSON.stringify( val.limits ) ) : [];
			}
		}, { immediate: true, deep: true } )
		
		/* 根据切换到的 key 更改按钮状态 */
		function changeCurrentKey( key ) {
			state.currentKey = key;
			state.keyStatus = key
				? state.management.limits.includes( key )
					? 2
					: 1
				: 0;
		}
		
		function changeKeyStatus( status ) {
			/* 当切换为 on 并 limit 数组中存在该key时，移除 */
			if ( status === 1 && state.management.limits.includes( state.currentKey ) ) {
				state.management.limits.splice( state.management.limits.findIndex( el => el === state.currentKey ), 1 );
			}
			/* 当切换为 off 并 limit 数组中不存在该key时，添加 */
			if ( status === 2 && !state.management.limits.includes( state.currentKey ) ) {
				state.management.limits.push( state.currentKey );
			}
		}
		
		function postChange() {
			$http.GROUP_SET( {
				target: props.groupInfo.groupId,
				auth: state.management.auth,
				int: state.management.int,
				limits: JSON.stringify( state.management.limits )
			}, "POST" ).then( () => {
				ElMessage.success( "设置保存成功" );
				state.showModal = false;
				emit( "reloadData" );
			} ).catch( () => {
				ElMessage.error( "设置保存失败" );
			} );
		}
		
		function openModal() {
			state.showModal = true;
		}
		
		function closeModal() {
			emit( "closeDialog" );
		}
		
		return {
			...toRefs( state ),
			postChange,
			changeCurrentKey,
			changeKeyStatus,
			openModal,
			closeModal
		};
	}
} );