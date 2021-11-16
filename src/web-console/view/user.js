const template =
`<div class="user-page">
	<div class="search-container">
		<el-input
			class="input-box"
			v-model.number="searchID"
			placeholder="搜索QQ号"
			maxlength="12"
			clearable
		/>
		<el-scrollbar class="filtered-data">
			<p
				v-for="u in showUser"
				class="user-button"
				@click="chooseUser(u)"
			>{{ u }}</p>
		</el-scrollbar>
	</div>
	<div class="user-data-wrapper">
		<div class="user-data-container">
			<div class="empty" v-if="chooseUserID === 0">
				<p class="title">请选择要管理的用户账号</p>
			</div>
			<div style="height: 100%;" v-else>
				<p class="title">信息面板</p>
				<div class="user-base-info">
					<img class="avatar" :src="avatar" alt="ERROR"/>
					<div class="public-info">
						<div class="inner">
							<p class="user-id">
								<span class="bold">用户账号</span>
								<span>{{ chooseUserID }}</span>
							</p>
							<p class="nickname">
								<span class="bold">用户昵称</span>
								<span>{{ chooseUserData.nickname }}</span>
							</p>
							<p class="friend">
								<span class="bold">已加好友</span>
								<span>{{ chooseUserData.isFriend ? "是" : "否" }}</span>
							</p>
							<p class="nickname">
								<span class="bold">权限等级</span>
								<span>{{ auth }}</span>
							</p>
						</div>
					</div>
				</div>
				<div class="group-info">
					<p class="title" style="margin: 4px 0">指令使用分布</p>
					<div class="group-used-list">
						<div class="group-used-item" v-for="el in chooseUserData.groupInfoList">
							<p v-if="typeof el === 'string'">{{ el }}</p>
							<p v-else>群 {{ el.group_id }} - [{{ role( el.role ) }}]{{ el.card || el.nickname }}</p>
						</div>
					</div>
				</div>
				<div class="management-window">
					<p class="title" style="margin: 4px 0">管理面板</p>
					<div class="auth-management">
						<p class="content">权限设置</p>
						<el-radio-group
							v-model="management.auth"
							:disabled="management.auth === 'Master'"
						>
     						<el-radio-button label="Banned"/>
     						<el-radio-button label="User"/>
     						<el-radio-button label="Manager"/>
     						<el-radio-button label="Master" disabled/>
    					</el-radio-group>
					</div>
					<div class="int-management">
						<p class="content">操作冷却</p>
						<el-input v-model.number="management.int">
							<template #suffix>
								<span>ms</span>
							</template>
						</el-input>
					</div>
					<div class="limit-management">
						<p class="content">指令权限</p>
						<el-select
							v-model="tmpKey"
							placeholder="选择指令Key"
							:disabled="management.auth === 'Master'"
							@change="changeKey"
						>
						    <el-option
						    	class="limit-key-dropdown-item"
								v-for="el in cmdKeys"
								:key="el"
								:value="el"
						    />
						</el-select>
					    <el-radio-group
					    	v-model="tmpStatus"
					    	:disabled="tmpKey === ''"
					    >
     						<el-radio-button label="ON"/>
     						<el-radio-button label="OFF"/>
    					</el-radio-group>
					</div>
					<el-button class="save" @click="postChange">保存设置</el-button>
				</div>
			</div>
		</div>
	</div>
</div>`;

const { defineComponent, reactive, toRefs, watch, computed } = Vue;
const { get, post } = axios;
const { ElMessage } = ElementPlus;

export default defineComponent( {
	name: "User",
	template,
	setup() {
		const state = reactive( {
			searchID: null,
			cmdKeys: [],
			userIDs: [],
			showUser: [],
			chooseUserID: 0,
			chooseUserData: { nickname: "" },
			management: {
				auth: "",
				int: 0,
				limits: []
			},
			tmpKey: "",
			tmpStatus: "",
			lastKey: ""
		} );
		
		const authLevel = [ "Banned", "User", "Manager", "Master" ];
		const auth = computed( () => {
			return authLevel[ state.chooseUserData.botAuth ];
		} );
		const avatar = computed( () => {
			return `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ state.chooseUserID }`;
		} );
		
		get( "/api/user/list" )
			.then( resp => {
				state.userIDs.push( ...resp.data.userIDs );
				state.cmdKeys.push( ...resp.data.cmdKeys );
				state.showUser.push( ...state.userIDs );
			} );
		
		function role( str ) {
			const map = {
				owner: "群主",
				admin: "管理员",
				member: "群员"
			};
			return map[str];
		}
		
		/* 子序列匹配 */
		function checkSubsequence( pattern, template ) {
			const tLen = template.length;
			const pLen = pattern.length;
			
			let pos = -1;
			for ( let i = 0; i < tLen; i++ ) {
				let flag = false;
				for ( let j = i; j < pLen; j++ ) {
					if ( template[i] === pattern[j] && j > pos ) {
						pos = j;
						flag = true;
						break;
					}
				}
				if ( !flag ) {
					return false;
				}
			}
			return true;
		}
		
		async function chooseUser( userID ) {
			state.chooseUserID = userID;
			state.chooseUserData = ( await get( `/api/user/info?id=${ userID }` ) ).data;
			state.management.auth = authLevel[ state.chooseUserData.botAuth ];
			state.management.int = state.chooseUserData.interval;
			state.management.limits = [];
			state.management.limits.push( ...state.chooseUserData.limits );
		}
		
		function changeKey( nowKey ) {
			if ( state.tmpStatus === "ON" && state.management.limits.includes( state.lastKey ) ) {
				state.management.limits.splice( state.management.limits.findIndex( el => el === state.lastKey ), 1 );
			} else if ( state.tmpStatus === "OFF" && !state.management.limits.includes( state.lastKey ) ) {
				state.management.limits.push( state.lastKey );
			}
			state.tmpStatus = state.management.limits.includes( nowKey ) ? "OFF" : "ON";
			state.lastKey = nowKey;
		}
		
		function postChange() {
			changeKey( state.tmpKey );
			post( "/api/user/set", {
				target: state.chooseUserID,
				auth: authLevel.findIndex( el => el === state.management.auth ),
				int: state.management.int,
				limits: JSON.stringify( state.management.limits )
			} )
				.then( res => {
					ElMessage( {
						message: "设置保存成功",
						type: "success",
						duration: 1500
					} );
				} )
				.catch( err => {
					ElMessage( {
						message: "设置保存失败",
						duration: 1500,
						type: "warning"
					} );
				} );
		}
		
		watch( () => state.searchID, () => {
			if ( state.searchID === "" ) {
				state.showUser = [];
				state.showUser.push( ...state.userIDs );
				return;
			}
			state.showUser = [];
			for ( let userID of state.userIDs ) {
				if ( checkSubsequence( userID, state.searchID.toString() ) ) {
					state.showUser.push( userID );
				}
			}
		} );
		
		return {
			...toRefs( state ),
			chooseUser,
			postChange,
			changeKey,
			avatar, auth, role
		};
	}
} );