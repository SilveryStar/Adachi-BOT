const template = `<div>
	<Header />
	<Material :data="data" />
	<Event :events="data.event" />
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import Header from "./header.js";
import Material from "./material.js";
import Event from "./event.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "DailyApp",
	template,
	components: {
		Header,
		Material,
		Event
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/daily?id=${ urlParams.id }` );
		
		return { data };
	}
} );
