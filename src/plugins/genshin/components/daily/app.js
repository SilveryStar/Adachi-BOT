const template = `<div>
	<Header :week="week" :show-event="showEvent" />
	<Material :data="data" />
	<Event :show-event="showEvent" :events="data.event" />
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import Header from "./header.js";
import Material from "./material.js";
import Event from "./event.js";

const { defineComponent, computed } = Vue;

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
		
		const week = urlParams.week;
		
		/* 是否显示活动日历 */
		const showEvent = computed( () => week === "today" );
		
		return { data, week, showEvent };
	}
} );
