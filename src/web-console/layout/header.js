const template =
`<div class="layout-header" @click="$emit( 't' )">
	<el-icon :size="28" color="#000">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1024 1024"
			data-v-394d1fd8=""
		>
			<path
				fill="currentColor"
				d="M896 192H128v128h768V192zm0 256H384v128h512V448zm0 256H128v128h768V704zM320 384 128 512l192 128V384z"
			/>
		</svg>
	</el-icon>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "Header",
	template
} );