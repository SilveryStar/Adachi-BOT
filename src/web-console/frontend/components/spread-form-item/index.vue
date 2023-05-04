<template>
	<form-item ref="spreadRef" class="spread-form-item" :class="{ open: open, disabled: disabled }" :label="label"
	           :desc="desc" @click="spreadItem" v-bind="$attrs">
	<span
		v-if="!open"
		:class="{ password: showBtnStyle }"
		class="spread-show-text"
	>
		{{ spreadShowText }}
	</span>
		<template v-else>
			<div class="input-content">
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
					:type="type"
					:disabled="disabled"
					:limit="1"
				/>
				<el-input
					v-else
					ref="inputRef"
					v-model="formValue"
					:type="type === 'textarea' ? 'textarea' : 'text'"
					:rows="rows"
					:placeholder="placeholder || ''"
					:disabled="disabled || false"
					:show-password="type === 'password'"
					@keyup.enter="type === 'textarea' ? '' : saveValue()"
					clearable
				/>
				<span class="spread-warn-msg" v-if="showErrMsg">{{ verifyMsg }}</span>
			</div>
			<div class="btn-list">
				<el-button type="primary" size="small" @click.stop="saveValue">确认</el-button>
				<el-button size="small" @click.stop="packUpItem">取消</el-button>
			</div>
		</template>
	</form-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent( {
	inheritAttrs: false
} )
</script>

<script lang="ts" setup>
import FormItem from "&/components/form-item/index.vue";
import Tags from "&/components/tags/index.vue";
import { defineComponent, getCurrentInstance, watch, ref, nextTick, computed } from "vue";
import { ElInput } from "element-plus";

type PropsType = "normal" | "number" | "password" | "list" | "textarea";
type ModuleValue = string[] | string | number;

interface IProps {
	modelValue: ModuleValue;
	// 当前展开的组件id
	activeSpread: number | null;
	label: string;
	placeholder?: string;
	type?: PropsType;
	desc?: string;
	// 行数，仅当 type 为 textarea 时有效
	rows?: number;
	// 当 type 为 password 时，该配置无效
	hideContent?: boolean;
	// 校验，可为返回值为 Boolean 的方法或正则字符串
	verifyReg?: ( ( value: string ) => boolean ) | string;
	// 校验错误提示文字
	verifyMsg?: string;
	disabled?: boolean;
}

const props = withDefaults( defineProps<IProps>(), {
	modelValue: "",
	activeSpread: null,
	label: "",
	placeholder: "",
	type: "normal",
	desc: "",
	rows: 6,
	hideContent: false,
	verifyReg: "",
	verifyMsg: "请检查填写内容",
	disabled: false
} );

const emits = defineEmits<{
	( e: "update:modelValue", state: ModuleValue ): void;
	( e: "change", state: ModuleValue ): void;
	( e: "open", uid: number ): void;
	( e: "close" ): void;
}>();

const uid = getCurrentInstance()!.uid;

/* 当前展开项切换时，若非本组件，收起 */
watch( () => props.activeSpread, value => {
	if ( value !== uid ) {
		packUpItem();
	}
} );

const open = ref( false );
const spreadRef = ref<InstanceType<typeof FormItem> | null>( null );
watch( () => open.value, value => {
	resetData();
	if ( spreadRef.value ) {
		spreadRef.value.changeDescDisplay( !value );
	}
} );

const inputRef = ref<InstanceType<typeof ElInput> | null>( null );

/* 点击展开项 */
function spreadItem() {
	if ( open.value || props.disabled ) return;
	emits( "open", uid );
	open.value = true;
	nextTick( () => {
		inputRef.value?.focus();
	} );
}

/* 收起展开项 */
function packUpItem() {
	emits( "close" );
	open.value = false;
}

const formValue = ref<string | string[] | number>( "" );

watch( () => props.modelValue, value => {
	formValue.value = value;
}, { immediate: true } );

/* 是否在未开启时展示按钮效果 */
const showBtnStyle = computed( () => {
	return props.hideContent || props.type === "password" || !formValue.value;
} );

const spreadShowText = computed( () => {
	return showBtnStyle.value
		? "点击设置"
		: formValue.value instanceof Array
			? formValue.value.join( "、" )
			: formValue.value
} );

const showErrMsg = ref( false );

/* 保存数据 */
function saveValue() {
	/* type为number时禁止为空 */
	if ( props.type === "number" && !formValue.value ) {
		showErrMsg.value = true;
		return;
	}
	const verify = props.verifyReg;
	if ( verify && typeof formValue.value === "string" ) {
		if ( typeof verify === "string" ) {
			const reg = new RegExp( `^${verify}$` );
			if ( reg && !reg.test( formValue.value ) ) {
				showErrMsg.value = true;
				return;
			}
		} else {
			if ( !verify( formValue.value ) ) {
				showErrMsg.value = true;
				return;
			}
		}
	}
	if ( formValue.value !== props.modelValue ) {
		emits( "update:modelValue", formValue.value );
		emits( "change", formValue.value );
	}
	packUpItem();
}

/* 重置数据 */
function resetData() {
	showErrMsg.value = false;
	formValue.value = props.type === "password" ? "" : props.modelValue;
}

defineExpose( {
	spreadItem
} );
</script>

<style lang="scss" scoped>
.spread-form-item {
	&:not([class*="open"]) {
		cursor: pointer;

		&:hover {
			background-color: #f6f6f6;
		}
	}

	&.open {
		background-color: #f6f6f6;
	}

	.spread-show-text {
		display: inline-block;
		padding: 7px 0;
		max-width: 310px;
		height: 32px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 12px;
		line-height: 18px;
		color: #444;
		box-sizing: border-box;

		&.password {
			color: var(--el-color-primary);
		}
	}

	.input-content {
		display: flex;
		flex-wrap: wrap;
		row-gap: 5px;
		column-gap: 10px;
		align-items: center;
	}

	.btn-list {
		margin-top: 10px;
	}

	el-input,
	.el-input-number {
		width: 270px;
	}

	.el-input-number {
		:deep(.el-input__inner) {
			text-align: left;
		}
	}

	.spread-warn-msg {
		line-height: 1.15;
		color: red;
	}
}

@media (max-width: 768px) {
	.form-item {
		> :deep(.el-form-item__content) {
			width: 100%;
		}
	}
}
</style>
