const template = `<el-form-item class="form-item" :label="label">
	<div class="form-item-content" :class="{ 'no-desc': !desc || !showDesc }">
		<slot />
	</div>
	<span class="form-item-desc" v-if="desc && showDesc">{{ desc }}</span>
</el-form-item>`;

const { defineComponent, watch, reactive, ref, toRefs, nextTick } = Vue;

export default defineComponent( {
	name: "FormItem",
	template,
	components: {},
	emits: [ "update:modelValue", "change" ],
	props: {
		label: {
			type: String,
			default: ""
		},
		desc: {
			type: String,
			default: ""
		}
	},
	setup( props, { emit } ) {
		const state = reactive( {
			open: false,
			showDesc: true,
			formValue: ""
		} );
		
		const inputRef = ref( null );
		
		watch( () => props.modelValue, value => {
			state.formValue = value;
		}, { immediate: true } )
		
		function changeDescDisplay( value ) {
			state.showDesc = value;
		}
		
		/* 点击展开项 */
		function spreadItem() {
			if ( state.open || props.disabled ) return;
			state.open = true;
			nextTick( () => {
				inputRef.value.focus();
			} );
		}
		
		/* 保存数据 */
		function saveValue() {
			emit( "update:modelValue", state.formValue );
			emit( "change" );
			state.open = false;
		}
		
		return {
			...toRefs( state ),
			inputRef,
			changeDescDisplay,
			spreadItem,
			saveValue
		}
	}
} )
