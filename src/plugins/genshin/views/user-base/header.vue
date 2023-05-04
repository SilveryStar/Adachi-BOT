<template>
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
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults( defineProps<{
	data: Record<string, any>;
	urlParams: Record<string, any>;
	infoList: any[];
}>(), {
	data: () => ( {} ),
	urlParams: () => ( {} ),
	infoList: () => [],
} );

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
</script>

<style lang="scss" scoped>
.header-base {
	position: relative;
	display: flex;
	align-items: flex-end;
	height: 280px;
	padding-bottom: 12px;
	border-radius: 12px 12px 0 0;
	background: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/card/user-top-bg.jpg") center no-repeat;
	background-size: cover;
	box-shadow: 0 2px 8px #666;
	color: #fff;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		background-color: #000;
		border-radius: 12px 12px 0 0;
		opacity: 0.5;
	}

	&::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-style: solid;
		border-width: 50px 50px 0;
		border-image: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/card/card-base-bg.png") 70 fill;
	}

	> div {
		position: relative;
		z-index: 10;
	}

	.card-avatar-box {
		position: absolute;
		left: 50%;
		bottom: -46px;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;

		p {
			margin-bottom: 18px;
			white-space: nowrap;
			font-size: 26px;
		}

		img {
			width: 156px;
			height: 156px;
			border: 1px solid #999;
			box-shadow: 0 0 0 6px #fff;
			border-radius: 50%;
			box-sizing: border-box;
			background: linear-gradient(0deg, #de9552 0%, #9a6d43 100%) #9a6d43;
			filter: drop-shadow(0 2px 4px #999);
		}
	}

	/* uid */
	.card-base-uid {
		position: absolute;
		left: 40px;
		top: 40px;
		font-size: 18px;
	}

	/* 等级盒子 */
	.card-level-box {
		position: absolute;
		right: 40px;
		top: 40px;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		align-self: flex-start;

		p {
			color: #fff;
			text-align: center;

			&:nth-of-type(1) {
				font-size: 26px;
				margin-bottom: 10px;
			}

			&:nth-of-type(2) {
				font-size: 16px;
			}
		}
	}

	/* 基本信息标签盒子 */
	.card-base-stats {
		display: flex;
		flex: 1;
		justify-content: space-between;
		padding: 0 34px;

		p {
			margin-right: 12px;
			border-radius: 4px;
			color: #fff;
			opacity: 0.8;
			font-size: 16px;

			&:nth-of-type(2) {
				flex: 1;
			}

			&:last-child {
				margin-right: 0;
			}

			label {
				margin-right: 5px;
			}
		}
	}
}
</style>