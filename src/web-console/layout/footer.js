const template =
`<div class="layout-footer">
	<span v-if="!isMobile">MIT Licensed | </span>
	<span>Adachi管理面板 ©2021 SilveryStar</span>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "Footer",
	props: { isMobile: Boolean },
	template
} );