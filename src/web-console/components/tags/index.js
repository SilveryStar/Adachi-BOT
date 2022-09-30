const template = `<div class="tags">
	<el-tag
	  v-for="(t, tKey) of tagList"
	  :key="tKey"
	  effect="plain"
	  :closable="showCloseBtn"
	  :disable-transitions="false"
	  @close="closeTag(tKey)"
      round
	>
	  {{ t }}
	</el-tag>
	<template v-if="inputVisible">
		<el-input-number
			v-if="type === 'number'"
			ref="inputRef"
		  	class="new-tag-input"
		  	v-model="newTag"
		  	size="small"
			:min="0"
			:controls="false"
			:placeholder="placeholder"
			:disabled="disabled"
		  	@keyup.enter="addTag"
		  	@blur="addTag"
		/>
		<el-input
			v-else
		  	ref="inputRef"
		  	class="new-tag-input"
		  	v-model="newTag"
		  	size="small"
		  	:disabled="disabled"
		  	@keyup.enter="addTag"
		  	@blur="addTag"
		/>
	</template>
	<el-button v-else class="add-tag-btn" size="small" :disabled="disabled" @click="showInput" round>+ 新增</el-button>
</div>
`;

const { defineComponent, watch, reactive, ref, toRefs, nextTick, computed } = Vue;

export default defineComponent( {
	name: "Tags",
	template,
	components: {},
	emits: [ "update:modelValue", "change" ],
	props: {
		modelValue: {
			default: () => []
		},
		disabled: {
			type: Boolean,
			default: false
		},
		/* 限制最小应该存在的tag数 */
		limit: {
			type: Number,
			default: 0
		},
		type: {
			default: "normal",
			validator( value ) {
				return [ "normal", "number" ].includes( value );
			}
		}
	},
	setup( props, { emit } ) {
		const state = reactive( {
			tagList: [],
			newTag: "",
			inputVisible: false
		} );
		
		const inputRef = ref( null );
		
		watch( () => props.modelValue, value => {
			state.tagList = value;
		}, { immediate: true } )
		
		const showCloseBtn = computed( () => {
			return !props.disabled && state.tagList.length > props.limit;
		} )
		
		function closeTag( index ) {
			if ( props.limit && props.limit === state.tagList.length ) {
				return;
			}
			state.tagList.splice( index, 1 );
			emit( "update:modelValue", state.tagList );
			emit( "change", state.tagList );
		}
		
		function showInput() {
			state.inputVisible = true
			nextTick( () => {
				if ( inputRef.value ) {
					const input = props.type === "number" ? inputRef.value : inputRef.value.input;
					input.focus();
				}
			} )
		}
		
		function addTag() {
			if ( !state.newTag || state.tagList.includes( state.newTag ) ) {
				state.inputVisible = false;
				state.newTag = "";
				return;
			}
			if ( state.inputVisible ) {
				state.tagList.push( state.newTag )
			}
			emit( "update:modelValue", state.tagList );
			emit( "change", state.tagList );
			state.inputVisible = false;
			state.newTag = "";
		}
		
		return {
			...toRefs( state ),
			inputRef,
			showCloseBtn,
			showInput,
			closeTag,
			addTag
		}
	}
} )
