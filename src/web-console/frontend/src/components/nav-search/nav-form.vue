<template>
	<el-form-item class="nav-form" :prop="data.id" :label="showLabel ? data.name : ''">
		<template v-if="data.type === 'input'">
			<el-input
				class="form-item"
				v-model.trim="searchData[data.id]"
				:placeholder="getPlaceholder('请输入')"
				:disabled="disabled"
				clearable
				@keyup.enter="queryTableData"
				@input="inputValue"
				@clear="clearData"
			></el-input>
		</template>
		<template v-if="data.type === 'select'">
			<el-select
				class="form-item"
				v-model="searchData[data.id]"
				:multiple="!!data.multiple"
				:placeholder="getPlaceholder('请选择')"
				:filterable="data.filterable"
				:teleported="false"
				:disabled="disabled"
				collapse-tags
				clearable
				@clear="clearData"
				@keyup.enter="queryTableData"
			>
				<el-option
					v-for="(s, sKey) in data.itemList"
					:key="sKey"
					:label="s[data.labelName || 'label']"
					:value="s[data.valueName || 'value']"
				></el-option>
			</el-select>
		</template>
	</el-form-item>
</template>

<script lang="ts" setup>
export interface SearchItem {
	id: string,
	name: string,
	type: "input" | "select",
	itemList?: any[],
	inputType?: "normal" | "number";
	labelName?: string;
	valueName?: string;
	placeholder?: string
	hidden?: boolean;
	filterable?: boolean;
	multiple?: boolean;
}

const props = withDefaults( defineProps<{
	searchData: Record<string, string | any[]>;
	data: SearchItem;
	// 是否显示label
	showLabel?: boolean;
	// 禁用状态
	disabled: boolean;
}>(), {
	searchData: () => ( {} ),
	showLabel: false,
	disabled: false
} );

const emits = defineEmits<{
	( e: "query-table-data" ): void;
}>();

/* 获取 placeholder */
function getPlaceholder( prefix ) {
	return prefix + ( props.data.placeholder || props.data.name );
}

/* 处理 input 输入内容 */
function inputValue() {
	if ( props.data.inputType === "number" ) {
		const value = props.searchData[props.data.id];
		if ( typeof value === "string" ) {
			props.searchData[props.data.id] = value.replace( /\D/g, "" );
		}
	}
}

/* 清空 input 数据并触发查询 */
function clearData() {
	queryTableData();
}

/* 触发父组件查询 */
function queryTableData() {
	emits( "query-table-data" );
}
</script>

<style lang="scss" scoped>
.nav-form {
	:deep(.el-form-item__label) {
		font-size: 12px;
	}

	.form-item {
		:deep(.el-input__wrapper) {
			height: 28px;
			box-sizing: border-box;
			font-size: 12px;
		}

		:deep(.el-input_suffix) {
			margin-right: 5px;
		}
	}
}
</style>