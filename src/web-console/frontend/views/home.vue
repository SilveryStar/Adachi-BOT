<template>
	<div class="table-container no-background fix-height">
			<div class="home-content">
				<p class="titleText">Hi~ 欢迎使用 Adachi-BOT 网页控制台</p>
				<p>这是一个正在进行初步测试的功能模块 (ノへ￣、)</p>
				<p>本功能旨在简化指令式繁琐的管理模式</p>
				<p>为用户提供更直观更简便的管理体验!</p>
				<br>
				<p>本项目目前只提供了如下功能</p>
				<p>实时日志监看</p>
				<p>历史日志查询</p>
				<p>用户权限设置</p>
				<p>指令使用统计</p>
				<p>未来还会陆续推出更多的管理设置</p>
				<br>
				<p>在使用时遇到任何 BUG</p>
				<p>都可以点击左上角进入项目首页提出 issue</p>
				<br>
				<p>尽管我们为移动端进行了适配</p>
				<p>但还是更建议你在 PC 上使用本功能</p>
			</div>
		<img :src="getAssetsFile('cover.jpg')" class="coverBg" alt="cover">
	</div>
</template>

<script lang="ts" setup>
import {getAssetsFile} from '&/utils/pub-use'

</script>

<style lang="scss" scoped>
.titleText {
	font-size: 25px;
	margin-top: 50px;
}
.coverBg {
	position: absolute;
	width: 450px;
	right: 0;
	bottom: 0;
}
.home-content {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 50%;
	transform: translateY(-50%);
	background: #fff;
	overflow: hidden;

	p {
		text-align: center;
		font-family: Consolas, "宋体", monospace;
		font-weight: 800;
		font-size: 17px;
		margin-bottom: 20px;
	}
}

@media (max-width: 768px) {
	.coverBg {
	display: none;
	}
	.titleText {
		color: #000;
		font-size: 20px!important;
		margin-top: 50px;
	}
	.home-content {
		z-index: 0;
		background: linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255, 0.7)), url('/assets/image/cover.jpg') no-repeat 10px 100px;
		background-size: cover;
		p {
			z-index: 999;
			//color: #000;
			color: #000;
			font-size: 16px;
			font-weight: 500;
		}
	}
}
</style>