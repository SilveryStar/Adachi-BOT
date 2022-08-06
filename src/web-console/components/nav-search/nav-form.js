const template = `<el-form-item class="nav-form" :prop="data.id" :label="showLabel ? data.name : ''">
	<template v-if="data.type === 'input'">
		<el-input
			class="form-item"
			v-model.trim="searchData[data.id]"
			:placeholder="getPlaceholder(data, '请输入')"
			:disabled="disabled"
			clearable
			@keyup.enter="queryTableData"
			@input="inputValue(data.inputType, data.id)"
			@clear="clearData"
		></el-input>
	</template>
	<template v-if="data.type === 'select'">
		<el-select
			class="form-item"
			v-model="searchData[data.id]"
			:multiple="!!data.multiple"
			:placeholder="getPlaceholder(data, '请选择')"
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
`

const { defineComponent } = Vue;

export default defineComponent( {
	name: "NavForm",
	template,
	emits: [ "query-table-data" ],
	props: {
		searchData: {
			type: Object,
			default: () => ( {} )
		},
		data: {
			type: Object,
			default: () => ( {} )
		},
		// 是否显示label
		showLabel: {
			type: Boolean,
			default: false
		},
		// 禁用状态
		disabled: {
			type: Boolean,
			default: false
		}
	},
	setup( props, { emit } ) {
		/* 获取 placeholder */
		function getPlaceholder( item, prefix ) {
			return prefix + ( item.placeholder || item.name );
		}
		
		/* 处理 input 输入内容 */
		function inputValue( type, id ) {
			if ( type === "number" ) {
				props.searchData[id] = props.searchData[id].replace( /[^\d]/g, "" );
			}
		}
		
		/* 清空 input 数据并触发查询 */
		function clearData() {
			queryTableData()
		}
		
		/* 触发父组件查询 */
		function queryTableData() {
			emit( "query-table-data" )
		}
		
		return {
			getPlaceholder,
			inputValue,
			clearData,
			queryTableData
		}
	}
} )