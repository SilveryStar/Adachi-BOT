const template = `
<div class="header-base">
	<div
		class="card-avatar-box"
		:class="{
			'without-nickname': data.level === '0',
			'user': urlParams.profile === 'user'
		}"
	>
		<p>{{ data.nickname }}</p>
		<img
			:class="{ user: urlParams.profile === 'user' && urlParams.appoint === 'empty' }"
			:src="defaultAvatar"
			alt="ERROR"
		/>
	</div>
	<div class="card-base-uid">
		UID: {{ data.uid }}
	</div>
	<div class="card-base-stats">
		<p v-for="(base, index) in infoList" :key="index">
			<label>{{ base.label }}</label>
			<span>{{ base.value }}</span>
		</p>
	</div>
	<div v-if="data.level !== '0'" class="card-level-box">
		<p>{{ data.level }}级</p>
		<p>世界等级{{ worldLevel }}</p>
	</div>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "Header",
	template,
	props: {
		data: {
			type: Object,
			default: () => ( {} )
		},
		urlParams: {
			type: Object,
			default: () => ( {} )
		},
		infoList: {
			type: Array,
			default: () => []
		}
	},
	setup( props ) {
		const profile = props.urlParams.profile;
		
		const avatars = props.data.avatars;
		const level = props.data.level;
		
		for ( let info of props.infoList ) {
			if ( info.value === "-" ) {
				info.value = "0-0";
			}
		}
		
		/* 获取头像 */
		function getProImg( name ) {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/thumb/character/${ name }.png`;
		}
		
		const defaultAvatar = computed( () => {
			const avatarList = avatars?.length ? avatars : [ { name: "荧" }, { name: "空" } ];
			return profile === "random" || props.urlParams.stranger === "true"
				? getProImg( avatarList[Math.floor( Math.random() * avatarList.length )].name )
				: `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ props.urlParams.qq }`;
		} );
		
		/* 计算世界等级 */
		const worldLevel = computed( () => {
			if ( parseInt( level ) < 20 ) {
				return 0;
			}
			if ( parseInt( level ) === 60 ) {
				return 8;
			}
			return Math.floor( ( parseInt( level ) - 15 ) / 5 );
		} );
		
		
		return {
			avatars,
			defaultAvatar,
			worldLevel
		};
	}
} );
