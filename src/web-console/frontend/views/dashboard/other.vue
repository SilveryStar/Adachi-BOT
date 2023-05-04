<template>
	<div class="table-container config">
        <el-alert title="该页内容修改完毕后续重启BOT或刷新配置才能生效" type="warning" show-icon />
        <el-form class="config-form" @submit.prevent>
            <Whitelist />
            <Cookies :active-spread="activeSpread" @setActiveSpread="activeSpreadItem" />
        </el-form>
	</div>
</template>

<script lang="ts" setup>
import Whitelist from "./whitelist.vue";
import Cookies from "./cookies.vue";
import { ref } from "vue";
const activeSpread = ref<number | null>(null);

/* 设置当前正在展开的项目 */
function activeSpreadItem( index ) {
	activeSpread.value = index;
}
</script>

<style lang="scss" scoped>

</style>