<template>
	<div class="table-container layout-page">
		<div class="layout-box" >
<!--			左侧画布-->
			<div class="canvas-draw">
			</div>
<!--			右侧工具栏-->
			<div class="canvas-operate">
				<div class="operate-item">
					<el-button type="primary"><i class="icon-shezhi"></i>加载配置文件</el-button>
					<el-button type="danger" plain>清空配置文件</el-button>
				</div>
				<div class="operate-item">
					<div>背景色： <el-color-picker v-model="color" show-alpha /></div>
					<br>
					<div>背景图：<el-button type="primary" style="width: 50%;margin-left: 5px">点击上传</el-button></div>
				</div>
				<div class="operate-item">
					<div  v-if="choise">
						<div>当前元素：<span v-html="domContent"></span> </div>
						<div>当前横坐标：{{mouseX}}</div>
						<div>当前纵坐标：{{mouseY}}</div>
						<div>pageX：{{pageX}}</div>
						<div>pageY：{{pageY}}</div>
					</div>
					<el-empty v-else description="请先选择要操作的元素" :image-size="75" />
				</div>

				<div class="operate-item">
					<div v-if="choise">
						<div>当前内容：<el-input  style="margin-top: 5px" v-model="input" placeholder="Please input" /></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
					<el-empty v-else description="请先选择要操作的元素" :image-size="75" />
				</div>
				<div class="footer-btn">
					<el-button style="width: 50%" type="primary">保存</el-button>
					<el-button style="width: 50%" type="success">导出</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const color = ref('rgba(19, 206, 102, 0.8)')
let choise = ref(false)
const input = ref('')
const domContent = ref('')
const mouseX = ref('');
const mouseY = ref('');
let pageX = ref(0);
let pageY = ref(0);


</script>

<style lang="scss" scoped>
.layout-box {
	width: 100%;
	display: flex;
	min-height: calc(var(--content-height) - var(--footer-height) - 10px);
	flex-wrap: nowrap;
	.canvas-draw{
		position: relative;
		overflow: hidden;
		border-radius: 3px;
		width: 70%;
		background:#ffffff;
		background-image:linear-gradient(45deg,#ebebeb 25%,transparent 0), linear-gradient(45deg,transparent 75%,#ebebeb 0), linear-gradient(45deg,#ebebeb 25%,transparent 0), linear-gradient(45deg,transparent 75%,#ebebeb 0);
		background-size:30px 30px;
		background-position: 0 0,15px 15px,15px 15px,30px 30px;
		border: 1px solid #ebebeb;
		box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
	}
	.canvas-operate{
		display: flex;
		flex-direction: column;
		border-radius: 3px;
		width: 30%;
		margin-left: 22px;
		.operate-item {
			margin-bottom: 10px;
			font-size: 14px;
			padding: 20px 15px;
			color:#8790a4;
			border-radius: 3px;
			box-shadow: rgba(9, 30, 66, 0.25) 0px 1px 1px -1px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;
		}
		.footer-btn{
			display: flex;
			flex-wrap: nowrap;
			justify-content: space-between;
		}
	}
}

@media (max-width: 768px) {
	.layout-box {

	}
}
</style>

