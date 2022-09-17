const template = `<form-item ref="spreadRef" class="spread-form-item" :class="{ open: open, disabled: disabled }" :label="label" :desc="desc" @click="spreadItem">
	<span
		v-if="!open"
		:class="{ password: showBtnStyle }"
		class="spread-show-text"
	>
		{{ spreadShowText }}
	</span>
	<template v-else>
		<el-input-number
			v-if="type === 'number'"
			ref="inputRef"
			v-model="formValue"
			:min="0"
			:controls="false"
			:placeholder="placeholder"
			:disabled="disabled"
			@keyup.enter="saveValue"
		/>
		<Tags
			v-else-if="type === 'list'"
			v-model="formValue"
			:disabled="disabled"
			:limit="1"
		/>
		<el-input
			v-else
			ref="inputRef"
			v-model="formValue"
			:type="type === 'textarea' ? 'textarea' : 'test'"
			:rows="4"
			:placeholder="placeholder"
			:disabled="disabled"
			:show-password="type === 'password'"
			@keyup.enter="type === 'textarea' ? '' : saveValue()"
			clearable
		/>
		<span class="spread-warn-msg" v-if="showErrMsg">{{ verifyMsg }}</span>
		<div class="btn-list">
			<el-button type="primary" size="small" @click.stop="saveValue">确认</el-button>
			<el-button size="small" @click.stop="packUpItem">取消</el-button>
		</div>
	</template>
</form-item>`;

import FormItem from "../form-item/index.js";
import Tags from "../../components/tags/index.js";

const { defineComponent, watch, reactive, ref, toRefs, nextTick, computed } = Vue;

export default defineComponent( {
	name: "SpreadFormItem",
	template,
	components: {
		FormItem,
		Tags
	},
	emits: [ "update:modelValue", "change", "open", "close" ],
	props: {
		modelValue: {
			default: ""
		},
		label: {
			type: String,
			default: ""
		},
		placeholder: {
			type: String,
			default: ""
		},
		type: {
			default: "normal",
			validator( value ) {
				return [ "normal", "number", "password", "list", "textarea" ].includes( value );
			}
		},
		desc: {
			type: String,
			default: ""
		},
		/* 正则校验 */
		verifyReg: {
			type: String,
			default: ""
		},
		/* 校验错误提示文字 */
		verifyMsg: {
			type: String,
			default: "请检查填写内容"
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	setup( props, { emit } ) {
		const state = reactive( {
			open: false,
			showErrMsg: false,
			formValue: ""
		} );
		
		const inputRef = ref( null );
		const spreadRef = ref( null );
		
		watch( () => props.modelValue, value => {
			state.formValue = value;
		}, { immediate: true } );
		
		watch( () => state.open, value => {
			resetData();
			if ( spreadRef.value ) {
				spreadRef.value.changeDescDisplay( !value );
			}
		} );
		
		/* 是否在未开启时展示按钮效果 */
		const showBtnStyle = computed( () => {
			return props.type === "password" || state.formValue.length === 0
		} );
		
		const spreadShowText = computed( () => {
			return showBtnStyle.value
				? "点击设置"
				: state.formValue instanceof Array
					? state.formValue.join( "、" )
					: state.formValue
		} );
		
		/* 点击展开项 */
		function spreadItem() {
			if ( state.open || props.disabled ) return;
			emit( "open" );
			state.open = true;
			nextTick( () => {
				inputRef.value.focus();
			} );
		}
		
		/* 收起展开项 */
		function packUpItem() {
			emit( "close" );
			state.open = false;
		}
		
		/* 保存数据 */
		function saveValue() {
			const reg = props.verifyReg ? new RegExp( `^${props.verifyReg}$` ) : null;
			if ( reg && !reg.test( state.formValue ) ) {
				state.showErrMsg = true;
				return;
			}
			if ( state.formValue !== props.modelValue ) {
				emit( "update:modelValue", state.formValue );
				emit( "change", state.formValue );
			}
			packUpItem();
		}
		
		/* 重置数据 */
		function resetData() {
			state.showErrMsg = false;
			state.formValue = props.type === "password" ? "" : props.modelValue;
		}
		
		return {
			...toRefs( state ),
			inputRef,
			spreadRef,
			showBtnStyle,
			spreadShowText,
			spreadItem,
			packUpItem,
			saveValue
		}
	}
} )
