<template>
	<el-form-item class="form-item" :label="label">
		<div class="form-item-content" :class="{ 'no-desc': !desc || !showDesc }">
			<slot/>
		</div>
		<span class="form-item-desc" v-if="desc && showDesc">{{ desc }}</span>
	</el-form-item>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElFormItem } from "element-plus";

interface IProps {
	label?: string;
	desc?: string;
	disabled?: boolean;
}

const props = withDefaults( defineProps<IProps>(), {
	label: "",
	desc: "",
	disabled: false
} );

const showDesc = ref( true );

function changeDescDisplay( value ) {
	showDesc.value = value;
}

defineExpose( {
	changeDescDisplay
} )
</script>

<style lang="scss" scoped>
.form-item {
	flex-wrap: wrap;
	margin: 1px 0;
	padding: 3px 5px;

	> :deep(.el-form-item__label) {
		justify-content: flex-start;
		align-items: center;
		width: 140px;
		font-size: 12px;
		line-height: 18px;
		color: #666;
		text-align: left;
	}

	> :deep(.el-form-item__content) {
		width: 68%;
		font-size: 12px;
		line-height: 0;
		flex: 0 0 auto;
	}

	.form-item-content {
		margin-right: 10px;

		&.no-desc {
			margin-right: 0;
			width: 100%;
		}
	}

	.form-item-desc {
		color: #9ba3af;
		font-size: 12px;
		line-height: 18px;
	}

	.el-input,
	.el-radio__label {
		font-size: 12px;
	}
}

@media (max-width: 768px) {
	.form-item {
		.form-item-content {
			margin-right: 0;
			width: 100%;
		}
	}
}

@media (max-width: 514px) {
	.form-item {
		> :deep(.el-form-item__label) {
			width: 100%;
			font-size: 14px;
			font-weight: bold;
		}
		> :deep(.el-form-item__content) {
			width: 100%;
		}
	}
}
</style>
