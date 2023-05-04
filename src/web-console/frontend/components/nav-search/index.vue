<template>
	<div class="nav-search">
		<div v-if="listLineItem.length > 0" class="left-container">
			<el-form label-width="60px" :model="searchData" class="search-form" @submit.prevent>
				<nav-form
					class="left-line-item"
					v-for="(i, iKey) in listLineItem.slice(0, showNum)"
					:key="iKey"
					:data="i"
					:search-data="searchData"
					:disabled="disabled || false"
					@query-table-data="queryTableData"
				></nav-form>
				<div class="search-btn">
					<el-button title="查询" round @click="queryTableData" :disabled="disabled">查询</el-button>
					<el-button title="重置" round @click="resetTableData" :disabled="disabled">重置</el-button>
					<el-popover
						placement="bottom-end"
						width="420"
						v-model="popperShow"
						popper-class="popper-form"
						:teleported="false"
						:disabled="disabled"
						trigger="click">
						<template #reference>
							<el-button v-show="listLineItem.length > showNum" size="small" type="primary" round
							           title="筛选" style="margin-left: 10px">筛选
							</el-button>
						</template>
						<div class="other-form">
							<nav-form
								v-for="(i, iKey) in listLineItem"
								:key="iKey"
								:data="i"
								:search-data="searchData"
								:show-label="true"
								:disabled="disabled || false"
								@query-table-data="queryTableData"
							></nav-form>
							<div class="bottom-btn">
								<el-button type="primary" size="small" :disabled="disabled" @click="queryTableData">确定
								</el-button>
								<el-button size="small" :disabled="disabled" @click="resetTableData">重置</el-button>
							</div>
						</div>
					</el-popover>
				</div>
			</el-form>
		</div>
		<div class="right-container">
			<slot></slot>
		</div>
	</div>
</template>

<script lang="ts" setup>
import NavForm from "./nav-form.vue";

import { watch, ref } from "vue";
import { SearchItem } from "./nav-form.vue";

interface IProps {
	searchList: SearchItem[]
	searchData: Record<string, string | any[]>;
	// 展示数量
	showNum: number;
	// 禁用状态
	disabled?: boolean;
}

const props = withDefaults( defineProps<IProps>(), {
	searchList: () => [],
	searchData: () => ( {} ),
	showNum: 1,
	disabled: false
} );

const emits = defineEmits<{
	( e: "change" ): void;
	( e: "reset" ): void;
}>();

const listLineItem = ref<SearchItem[]>( [] );
watch( () => props.searchList, ( value: SearchItem[] ) => {
	const showList = value.filter( item => !item.hidden );
	listLineItem.value = JSON.parse( JSON.stringify( showList ) );
}, { immediate: true } )


const popperShow = ref( false );

/* 触发父组件查询 */
function queryTableData( closePopper = true ) {
	if ( closePopper ) {
		popperShow.value = false
	}
	emits( "change" );
}

/* 重置数据 */
function resetTableData() {
	for ( const key in props.searchData ) {
		props.searchData[key] = ''
	}
	emits( "reset" ) // 发送重置搜索组件事件
	queryTableData( false )
}

function resetSearchList( props: string, value: any[], searchList: SearchItem[] ) {
	const changeSearchItem = searchList.find( searchItem => searchItem.id === props );
	changeSearchItem && ( changeSearchItem.itemList = value );
	return searchList.slice();
}

defineExpose({
	resetSearchList
})

</script>

<style lang="scss" scoped>
.nav-search {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: nowrap;
	/*width: 100%;*/
	height: 40px;
	border-radius: 4px;
	user-select: none;
	box-sizing: border-box;

	.left-line-item,
	.search-btn {
		margin: 0 10px 0 0;
		padding: 5px 0;
	}

	.search-btn {
		display: flex;
		align-items: center;
	}

	.right-container,
	.left-container .search-form {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
	}

	.left-line-item {
		:deep(.el-form-item__content) {
			margin-left: 0 !important;
			column-gap: 1px;
		}

		:deep(.form-item) {
			width: 180px;

			.el-input__wrapper {
				height: 28px;
				border-radius: 14px;
				box-sizing: border-box;
				font-size: 12px;
			}

			.el-input_suffix {
				margin-right: 5px;
			}
		}
	}

	.search-btn > .el-button,
	.right-container .el-button {
		padding: 0 14px;
		height: 28px;
		font-weight: 400;
		font-size: 12px;
	}

	.search-btn {
		.popper-form {
			.el-form-item {
				margin-bottom: 6px;
				user-select: none;
			}

			:deep(.el-form-item__label) {
				color: #000;
				font-weight: normal;
				user-select: none;
			}

			.form-item {
				width: 220px;
			}

			.bottom-btn {
				margin-top: 10px;
				padding-top: 10px;
				border-top: 1px solid #eee;
				text-align: center;
			}
		}
	}

	.other-form {
		.el-button {
			padding: 0 14px;
			height: 28px;
			font-weight: 400;
			font-size: 12px;
		}
	}
}
</style>