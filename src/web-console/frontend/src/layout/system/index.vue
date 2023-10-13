<template>
	<div class="user-layout" :class="{ open: isOpen }">
		<div class="mask" :class="{ open: isOpen && isMobile }" @click="toggle( false )"/>
		<AsideView :is-open="isOpen" @toggle="toggle"/>
		<main class="content">
			<NavView :is-open="isOpen" @toggle="toggle"/>
			<el-scrollbar wrap-class="scrollbar-wrapper">
				<MainView/>
				<FooterView/>
			</el-scrollbar>
		</main>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { useAppStore } from "@/store";
import NavView from "./components/header.vue";
import AsideView from "./components/aside.vue";
import MainView from "./components/main.vue";
import FooterView from "./components/footer.vue";

const app = useAppStore();
const isMobile = computed( () => app.device === "mobile" );

const isOpen = ref( false );

const toggle = ( state: boolean ) => isOpen.value = state;

watch( () => isMobile.value, state => {
	isOpen.value = !state;
}, { immediate: true } );
</script>

<style lang="scss" scoped>
.user-layout {
	height: var(--app-height);
	font-family: "微软雅黑", sans-serif;
	color: #333;

	&:not( .open ) {
		.aside-view {
			pointer-events: none;
			transform: translateX(calc(-1 * var(--aside-width)));
		}

		.content {
			padding-left: 0;
		}
	}

	.content {
		padding-left: var(--aside-width);
		width: 100vw;
		height: 100%;
		box-sizing: border-box;
		transition: padding-left .3s;

		.el-scrollbar {
			--content-height: calc(var(--app-height) - var(--header-height) - var(--extra-header));
			height: var(--content-height);
			background-color: #f0f2f5;
		}
	}
}

/* 阴影 */
.open {
	&.mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 100;
		background-color: rgba(0, 0, 0, 0.28);
	}
}

@media (max-width: 768px) {
	.user-layout {
		.content {
			padding-left: 0;
		}
	}
}
</style>