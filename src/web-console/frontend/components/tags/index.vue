<template>
	<div class="tags">
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
				:disabled="disabled || false"
				@keyup.enter="addTag"
				@blur="addTag"
			/>
		</template>
		<el-button v-else class="add-tag-btn" size="small" :disabled="disabled" @click="showInput" round>+ 新增
		</el-button>
	</div>
</template>

<script lang="ts" setup>
import { watch, ref, nextTick, computed } from "vue";
import { ElInput } from "element-plus";

interface IProps {
	modelValue: ( string | number )[];
	disabled?: boolean;
	// 限制最小应该存在的tag数
	limit?: number;
	type?: "list" | "number"
}

const props = withDefaults( defineProps<IProps>(), {
	modelValue: () => [],
	disabled: false,
	limit: 0,
	type: "list"
} );

const emits = defineEmits<{
	( e: "update:modelValue", value: ( string | number )[] ): void;
	( e: "change", value: ( string | number )[] ): void;
}>();

const tagList = ref<( string | number )[]>( [] );

watch( () => props.modelValue, value => {
	tagList.value = value;
}, { immediate: true } )

const showCloseBtn = computed( () => {
	return !props.disabled && tagList.value.length > props.limit;
} );

function closeTag( index ) {
	if ( props.limit && props.limit === tagList.value.length ) {
		return;
	}
	tagList.value.splice( index, 1 );
	emits( "update:modelValue", tagList.value );
	emits( "change", tagList.value );
}


const newTag = ref( "" );
const inputVisible = ref( false );

function addTag() {
	if ( !newTag.value || tagList.value.includes( newTag.value ) ) {
		inputVisible.value = false;
		newTag.value = "";
		return;
	}
	if ( inputVisible.value ) {
		tagList.value.push( newTag.value )
	}
	emits( "update:modelValue", tagList.value );
	emits( "change", tagList.value );
	inputVisible.value = false;
	newTag.value = "";
}


const inputRef = ref<InstanceType<typeof ElInput> | null>( null );

function showInput() {
	inputVisible.value = true
	nextTick( () => {
		if ( inputRef.value ) {
			const input = props.type === "number" ? inputRef.value : inputRef.value.input;
			input?.focus();
		}
	} )
}
</script>

<style lang="scss" scoped>
.tags {
	display: flex;
	align-items: center;
	column-gap: 10px;
	height: 32px;

	.new-tag-input {
		width: 100px;

		.el-input__inner {
			text-align: left;
		}
	}
}
</style>
