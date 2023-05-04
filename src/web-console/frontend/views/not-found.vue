<template>
	<div class="not-found-box">
		<div>
			<img :src="getAssetsFile('404.png')" alt="404图片">
		</div>
		<el-button type="primary" size="small" @click="$router.push('/')">回到首页</el-button>
	</div>
</template>

<script lang="ts" setup>
import { getAssetsFile } from "&/utils/pub-use";
</script>

<style lang="scss" scoped>
.not-found-box {
	width: 100%;
	text-align: center;
}
</style>