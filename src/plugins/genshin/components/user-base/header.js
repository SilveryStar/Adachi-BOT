const template = `
<div class="header-base">
	<div
		class="card-avatar-box"
		:class="{
			'without-nickname': data.level === '0',
			'user': urlParams.profile === 'user',
			'not-stranger': urlParams.stranger !== 'true'
		}"
	>
		<p>{{ nicknameSpace }}</p>
		<img
			:class="{ user: urlParams.profile === 'user' && urlParams.appoint === 'empty' }"
			:src="defaultAvatar"
			alt="ERROR"
		/>
	</div>
	<div class="card-base-uid" v-show="urlParams.stranger === 'false'">
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
		const charNum = avatars.length;
		
		for ( let info of props.infoList ) {
			if ( info.value === "-" ) {
				info.value = "0-0";
			}
		}
		
		/* 获取头像 */
		function getProImg( id ) {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/characters/profile/${ id }.png`;
		}

		const defaultAvatar =
			profile === "random" || props.urlParams.stranger === "true"
				? getProImg( avatars[Math.floor( Math.random() * charNum )].id )
				: `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ props.urlParams.qq }`;
		
		/* 计算世界等级 */
		const worldLevel = computed( () => {
			if ( parseInt( level ) < 20 ) {
				return 0;
			}
			return Math.floor( ( parseInt( level ) - 15 ) / 5 );
		} );
		
		const nicknameSpace = computed( () => {
			return props.urlParams.stranger === "true"
				? `UID ${ props.data.uid }`
				: props.data.nickname
		} )
		
		return {
			defaultAvatar,
			worldLevel,
			nicknameSpace
		};
	}
} );
