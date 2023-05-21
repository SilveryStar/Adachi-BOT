<script lang="ts" setup>
defineProps<{
	data: {
		icon?: {
			url: string;
			rank: number;
		};
		title: string;
	};
}>();
</script>

<template>
	<div class="common-title">
		<div v-if="data.icon" class="icon" :style="{ backgroundImage: `url(/assets/genshin/resource/rarity/bg/Background_Item_${ data.icon.rank }_Star.png)` }">
			<img :src="data.icon.url" alt="ERROR">
		</div>
		<div class="title">{{ data.title }}</div>
	</div>
</template>

<style lang="scss" scoped>
.common-title {
	display: flex;
	align-items: center;
	min-width: 150px;

	.icon {
		flex: 0 0 auto;
		margin-right: -24px;
		border: 2px solid var(--primary-base);
		border-radius: 50%;
		background-repeat: no-repeat;
		background-size: cover;
		filter: drop-shadow(0 2px 2px var(--shadow-dark));
		img {
			width: 42px;
			height: 42px;
		}
	}

	.title {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 12px;
		height: 30px;
		background-color: var(--primary-dark);
		border: 2px solid var(--primary-base);
		box-shadow: 0 2px 2px var(--primary-dark);
		border-radius: 17px;
		font-size: 16px;
		color: #fff;
	}
}
</style>