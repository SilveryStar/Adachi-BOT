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

import { request } from "../../public/js/src.js";
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
		const data = request( `/api/almanac` );
		
		return { ...data };
	}
} );