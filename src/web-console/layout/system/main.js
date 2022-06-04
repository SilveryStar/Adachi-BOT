const template = `<section class="main-view">
	<transition name="fade-transform" mode="out-in" appear>
		<router-view :isMobile="isMobile" />
	</transition>
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