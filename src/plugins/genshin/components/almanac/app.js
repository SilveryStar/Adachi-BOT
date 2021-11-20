const template =
`<div class="almanac">
	<AlmanacHeader />
	<div class="today-fortune">
		<div class="container">
			<AlmanacFortune :data="auspicious" :isTop="true"/>
			<AlmanacFortune :data="inauspicious"/>
		</div>
	</div>
	<AlmanacFooter :d="direction" />
</div>`;

import { parseURL } from "../../public/js/src.js";
import AlmanacHeader from "./header.js";
import AlmanacFortune from "./fortune.js";
import AlmanacFooter from "./footer.js";
const { defineComponent } = Vue;

export default defineComponent( {
	name: "AlmanacApp",
	template,
	components: {
		AlmanacHeader,
		AlmanacFortune,
		AlmanacFooter
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = JSON.parse( decodeURIComponent( escape( atob( decodeURIComponent( urlParams.data ) ) ) ) );
		
		const { auspicious, inauspicious, direction } = data;
		
		return { auspicious, inauspicious, direction };
	}
} );