const template = `<div class="footer-view">
	<div class="footer-content">
		<span v-if="!isMobile">MIT Licensed | </span>
		<span>Adachi管理面板 ©2021 SilveryStar</span>
	</div>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "FooterView",
	props: { isMobile: Boolean },
	template
} );