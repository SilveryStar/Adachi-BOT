const template = `<div class="user-detail">
	<div class="section-info">
		<p class="title">信息面板</p>
		<div class="user-base-info">
			<img class="avatar" :src="userInfo.avatar" alt="ERROR" draggable="false" />
			<div class="public-info">
				<p class="user-id">
					<span class="label">用户账号</span>
					<span>{{ userInfo.userID }}</span>
				</p>
				<p class="nickname">
					<span class="label">用户昵称</span>
					<span>{{ userInfo.nickname }}</span>
				</p>
				<p class="friend">
					<span class="label">已加好友</span>
					<span>{{ userInfo.isFriend ? "是" : "否" }}</span>
				</p>
				<p class="nickname">
					<span class="label">权限等级</span>
					<span>{{ authLevel[userInfo.botAuth]?.label }}</span>
				</p>
			</div>
		</div>
	</div>
	<div class="section-info">
		<p class="title">指令使用分布</p>
		<el-scrollbar class="group-info" wrap-class="scrollbar-wrapper">
			<p v-for="(el, elKey) in userInfo.groupInfoList" :key="elKey">{{ getUsedInfo(el) }}</p>
		</el-scrollbar>
	</div>
	<div class="section-info">
		<p class="title">禁用指令列表</p>
		<el-scrollbar class="limit-info" wrap-class="scrollbar-wrapper">
			<ul class="limit-list">
				<template v-if="management.limits?.length" >
					<li v-for="(l, lKey) of management.limits" :key="lKey" @click="changeCurrentKey(l)">{{ l }}</li>
				</template>
				<li class="limit-empty" v-else>该用户可以使用全部指令</li>
			</ul>
		</el-scrollbar>
	</div>
	<div class="section-info">
		<p class="title">订阅列表</p>
		<el-scrollbar class="sub-info" wrap-class="scrollbar-wrapper">
			<ul class="sub-list">
				<template v-if="userInfo.subInfo?.length" >
					<li v-for="(s, sKey) of userInfo.subInfo" :key="sKey">{{ s }}</li>
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
					<el-radio-group v-model="management.auth" :disabled="userInfo.botAuth === 3" >
						<el-radio-button
							v-for="a of authLevel"
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
					<el-select v-model="currentKey" placeholder="选择指令Key" :disabled="management.auth === 3" @change="changeCurrentKey" >
					    <el-option class="limit-key-dropdown-item" v-for="(c, cKey) of cmdKeys" :key="cKey" :value="c" />
					</el-select>
			    	<el-radio-group v-model="keyStatus" :disabled="!currentKey || management.auth === 3" @change="changeKeyStatus" >
						<el-radio-button :label="1">ON</el-radio-button>
						<el-radio-button :label="2">OFF</el-radio-button>
					</el-radio-group>
				</div>
			</li>
		</ul>
		<el-button class="save" @click="postChange" round>保存设置</el-button>
	</div>
</div>`;

import $http from "../../api/index.js"

const { defineComponent, reactive, toRefs, watch, computed } = Vue;
const { ElMessage } = ElementPlus;

export default defineComponent( {
	name: "UserDetail",
	template,
	emits: [ "reloadData", "closeDialog" ],
	props: {
		userInfo: {
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
			currentKey: "",
			keyStatus: 0
		} );
		
		const userInfo = props.userInfo;
		
		/* 填充管理字段对象 */
		watch( () => props.userInfo, ( val ) => {
			if ( Object.keys( val ).length !== 0 ) {
				state.currentKey = "";
				state.keyStatus = 0;
				state.management.auth = val.botAuth;
				state.management.int = val.interval;
				state.management.limits = val.limits ? JSON.parse( JSON.stringify( val.limits ) ) : [];
			}
		}, { immediate: true, deep: true } )
		
		function role( str ) {
			const map = {
				owner: "群主",
				admin: "管理员",
				member: "群员"
			};
			return map[str];
		}
		
		/* 获得地区分布展示内容 */
		function getUsedInfo( el ) {
			if ( typeof el === "string" ) {
				return el;
			}
			return `群 ${ el.group_id } - [${ role( el.role ) }]${ el.card || el.nickname }`;
		}
		
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
			$http.USER_SET( {
				target: userInfo.userID,
				auth: state.management.auth,
				int: state.management.int,
				limits: JSON.stringify( state.management.limits )
			}, "POST" ).then( () => {
				ElMessage.success( "设置保存成功" );
				emit( "reloadData" );
				emit( "closeDialog" );
			} ).catch( () => {
				ElMessage.error( "设置保存失败" );
			} );
		}
		
		return {
			...toRefs( state ),
			postChange,
			getUsedInfo,
			changeCurrentKey,
			changeKeyStatus,
		};
	}
} );