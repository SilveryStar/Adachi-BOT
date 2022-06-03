const template = `<section class="main-view">
	<router-view v-slot="{ Component }" :isMobile="isMobile">
		<transition name="fade-transform" mode="out-in" appear>
			<component :is="Component" />
        </transition>
	</router-view>
</section>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "MainView",
	template,
	props: {
		isMobile: {
			type: Boolean,
			default: false
		}
	}
} );