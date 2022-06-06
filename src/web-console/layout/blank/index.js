const template = `<div class="blank-layout">
	<router-view v-slot="{ Component }">
		<transition name="fade-transform" mode="out-in" appear>
			<component :is="Component" />
        </transition>
	</router-view>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "BlankLayout",
	template
} );