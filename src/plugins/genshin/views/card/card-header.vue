<template>
	<div class="header-base">
		<div class="card-avatar-box" :class="{ 'without-nickname': data.level === '0' }">
			<img
				:class="{ user: urlParams.appoint === 'empty' }"
				:src="defaultAvatar"
				alt="ERROR"
			/>
			<article>
				<p>{{ data.nickname }}</p>
				<p>UID: {{ data.uid }}</p>
			</article>
		</div>
		<div class="card-base-stats">
			<p v-for="(base, index) in infoList" :key="index">
				<label>{{ base.label }}</label>
				<span>{{ base.value }}</span>
			</p>
		</div>
		<div v-if="data.level !== '0'" class="card-level-box">
			<p class="card-adventure">{{ data.level }}级</p>
			<p class="card-world">世界等级{{ worldLevel }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(defineProps<{
	data: Record<string, any>;
	urlParams: Record<string, any>;
	infoList: any[];
}>(), {
	data: () => ( {} ),
	urlParams: () => ( {} ),
	infoList: () => []
});

const appoint = props.urlParams.appoint;
const profile = props.urlParams.profile;

const avatars = props.data.avatars;
const level = props.data.level;
const charNum = avatars.length;

/* 获取头像 */
function getProImg( name ) {
	return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/thumb/character/${ name }.png`;
}

const defaultAvatar = computed( () => {
	return appoint === "empty"
		? profile === "random"
			? getProImg( avatars[Math.floor( Math.random() * charNum )].name )
			: `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ props.urlParams.qq }`
		: getProImg( appoint );
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
	justify-content: space-between;
	align-items: flex-end;
	padding: 80px 80px 50px;
	border-radius: 24px 24px 0 0;
	background: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/card/user-top-bg.jpg") center no-repeat;
	background-size: cover;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		background-color: #000;
		border-radius: 24px 24px 0 0;
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
		border-width: 70px 70px 0;
		border-image: url("https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/card/card-base-bg.png") 70 fill;
	}

	> div {
		position: relative;
		z-index: 10;
	}

	.card-avatar-box {
		display: flex;
		align-items: center;
		width: 515px;
		height: 182px;
		border: 6px solid rgba(255, 255, 255, 0.4);
		border-radius: 91px;
		box-sizing: border-box;

		img {
			width: 162px;
			height: 162px;
			border-radius: 50%;
			border: 1px solid #999;
			background: linear-gradient(0deg, #de9552 0%, #9a6d43 100%) #9a6d43;
			box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.4);
			box-sizing: border-box;
		}

		article {
			margin-left: -6px;
			flex: 1;

			p {
				color: #fff;
				text-align: center;

				&:nth-of-type(1) {
					margin-bottom: 10px;
					font-size: 34px;
				}

				&:nth-of-type(2) {
					font-size: 20px;
					opacity: 0.65;
				}
			}
		}
	}

	/* 等级盒子 */
	.card-level-box {
		position: absolute;
		right: 80px;
		top: 80px;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		align-self: flex-start;

		p {
			color: #fff;
			text-align: center;

			&:nth-of-type(1) {
				font-size: 46px;
				margin-bottom: 10px;
			}

			&:nth-of-type(2) {
				font-size: 28px;
			}
		}
	}

	/* 基本信息标签盒子 */
	.card-base-stats {
		display: flex;

		p {
			margin-right: 12px;
			border-radius: 4px;
			color: #fff;
			opacity: 0.8;
			font-size: 18px;

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