const template =
`<div class="abyss">
	<AbyssOverview v-if="floor === -1" :data="data"/>
	<AbyssFloor v-else :data="data"/>
</div>`;

import Vue from "../../public/js/vue.js";
import { parseURL } from "../../public/js/src.js";
import AbyssFloor from "./floor.js";
import AbyssOverview from "./overview.js";

export default Vue.defineComponent( {
	name: "AbyssApp",
	template,
	components: {
		AbyssFloor,
		AbyssOverview
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = JSON.parse( atob( urlParams.data ) );
		const [ nickname, uid ] = urlParams.info.split( "|" );
		const floor = parseInt( urlParams.floor );

		data.uid = uid;
		data.nickname = decodeURI( nickname );
		data.floor = floor;

		return { data, floor };
	}
} );