<template>
	<div>
		<component :is="layout"></component>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import * as l from "./layout";
import { useAppStore } from "./store";
import { onBeforeMount, onUnmounted, computed, provide } from "vue";
import { useRoute } from "vue-router";

const drawer = ref(false)

const route = useRoute();
const layout = computed( () => {
    const layout = {
        default: l.DefaultLayout,
        blank: l.BlankLayout,
        system: l.SystemLayout
    };

    const metaLayout = <keyof typeof layout>(route.meta.layout || "blank");
    return layout[metaLayout];
} );

const app = useAppStore();

function onLayoutResize() {
    /* 移动端地址栏问题 */
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    const device = width <= 768 ? "mobile" : "desktop";
    if ( app.device !== device ) {
        app.device = device;
    }
    if ( app.deviceWidth !== width ) {
        app.deviceWidth = width;
    }
    if ( app.deviceHeight !== height ) {
        document.documentElement.style.setProperty( "--app-height", `${ height }px` );
        app.deviceHeight = height;
    }
}

onBeforeMount( () => {
    onLayoutResize();
    window.addEventListener( "resize", onLayoutResize );
} )

onUnmounted( () => {
    window.removeEventListener( "resize", onLayoutResize );
} );
</script>

<style lang="scss">
.checkBtn{
	position: absolute;
	right: 0;
	top: 200px;
}
</style>