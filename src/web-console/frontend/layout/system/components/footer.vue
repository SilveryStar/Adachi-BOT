<template>
	<div class="footer-view">
		<div class="footer-content">
			<span v-if="!isMobile">MIT Licensed | </span>
			<span>Adachi管理面板 &copy;{{ currentYear }} SilveryStar</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useAppStore } from "&/store";

const app = useAppStore();
const isMobile = computed( () => app.device === "mobile" );
const currentYear: number = new Date().getFullYear();
</script>

<style lang="scss" scoped>
.footer-view {
	padding: 0 12px;
	height: var(--footer-height);

	.footer-content {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		border-top: 1px solid #c6c6c6;
		font-family: Consolas, Liberation Mono, sans-serif;
		text-align: center;
		font-size: 0.9rem;
		box-sizing: border-box;
	}
}
</style>