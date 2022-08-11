const template = `<div>
	<router-view />
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "DefaultLayout",
	template
} );