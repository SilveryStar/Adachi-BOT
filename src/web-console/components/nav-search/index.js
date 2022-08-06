const template = `<div class="nav-search">
	<div v-if="listLineItem.length > 0" class="left-container">
		<el-form label-width="60px" :model="searchData" class="search-form" @submit.prevent>
			<nav-form
				class="left-line-item"
				v-for="(i, iKey) in listLineItem.slice(0, showNum)"
				:key="iKey"
				:data="i"
				:search-data="searchData"
				:disabled="disabled"
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
                		<el-button v-show="listLineItem.length > showNum" size="small" type="primary" round title="筛选" style="margin-left: 10px">筛选</el-button>
                    </template>
					<div class="other-form">
						<nav-form
							v-for="(i, iKey) in listLineItem"
							:key="iKey"
							:data="i"
							:search-data="searchData"
							:show-label="true"
							:disabled="disabled"
							@query-table-data="queryTableData"
						></nav-form>
                    	<div class="bottom-btn">
                    		<el-button type="primary" size="mini" :disabled="disabled" @click="queryTableData">确定</el-button>
                    		<el-button size="mini" :disabled="disabled" @click="resetTableData">重置</el-button>
                    	</div>
                    </div>
                </el-popover>
            </div>
        </el-form>
    </div>
    <div class="right-container">
    	<slot></slot>
    </div>
</div>`;

import NavForm from "./nav-form.js";

const { defineComponent, watch, reactive, toRefs } = Vue;

export function resetSearchList( props, value, searchList ) {
	const changeSearchItem = searchList.find( searchItem => searchItem.id === props );
	changeSearchItem && ( changeSearchItem.itemList = value );
	return searchList.slice();
}

export default defineComponent( {
	name: "NavSearch",
	template,
	components: {
		NavForm
	},
	emits: [ "change", "reset" ],
	props: {
		searchList: {
			type: Array,
			default: () => []
		},
		searchData: {
			type: Object,
			default: () => ( {} )
		},
		// 展示数量
		showNum: {
			type: Number,
			default: 1
		},
		// 禁用状态
		disabled: {
			type: Boolean,
			default: false
		}
	},
	setup( props, { emit } ) {
		const state = reactive( {
			listLineItem: [],
			popperShow: false
		} )
		
		watch( () => props.searchList, value => {
			const showList = value.filter( item => !item.hidden );
			state.listLineItem = JSON.parse( JSON.stringify( showList ) );
		}, { immediate: true } )
		
		/* 触发父组件查询 */
		function queryTableData( closePopper = true ) {
			if ( closePopper ) {
				state.popperShow = false
			}
			emit( "change" );
		}
		
		/* 重置数据 */
		function resetTableData() {
			for ( const key in props.searchData ) {
				props.searchData[key] = ''
			}
			emit( "reset" ) // 发送重置搜索组件事件
			queryTableData( false )
		}
		
		return {
			...toRefs( state ),
			queryTableData,
			resetTableData
		}
	}
} )
