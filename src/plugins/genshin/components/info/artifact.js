const template = `<div class="info-artifact">
	<div class="effect-list">
		<div class="effect" v-for="(e, i) in effects">
			<span class="suit">{{ suit( i ) }}</span>
			<div class="content" v-html="e"/>
		</div>
	</div>
</div>`;

const { defineComponent, toRefs } = Vue;

export default defineComponent( {
	name: "InfoArtifact",
	template,
	props: {
		data: {
			type: Object,
			default: () => ( {
				name: "",
				icon: 0,
				id: "",
				rarity: 0,
				minRarity: 0,
				access: "",
				effects: {}
			} )
		}
	},
	setup( props ) {
		const data = props.data;
		
		function suit( num ) {
			return `${ num } 件套效果`;
		}
	
		return {
			...toRefs( data ),
			suit
		}
	}
} );
