<template>
	<div class="default-layout">
		<router-view v-slot="{ Component }">
			<transition name="fade-transform" mode="out-in" appear>
				<component :is="Component"/>
			</transition>
		</router-view>
	</div>
</template>

<script lang="ts" setup></script>