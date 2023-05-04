<template>
	<section class="main-view">
		<router-view v-slot="{ Component }">
			<transition name="fade-transform" mode="out-in" appear>
				<component :is="Component"/>
			</transition>
		</router-view>
	</section>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.main-view {
	position: relative;
	padding: 12px;
	box-sizing: border-box;
	overflow: hidden;
}
</style>