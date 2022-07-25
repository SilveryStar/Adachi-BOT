const template = `<div class="daily-app">
	<Header :week="week" :show-event="showEvent" :sub-state="subState" :user="user" />
	<Material v-if="showMaterial" :data="data" />
	<Event :show-event="showEvent" :show-material="showMaterial" :events="data.event" />
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
		const user = urlParams.id;
		const data = request( `/api/daily?id=${ user }` );
		
		const week = urlParams.week;
		const subState = computed( () => urlParams.type === "sub" );
		
		const objHasValue = params => {
			if ( !data[params] || typeof data[params] !== "object" ) return false;
			return Object.keys( data[params] ).length !== 0;
		}
		
		/* 是否显示素材（素材空） */
		const showMaterial = computed( () => objHasValue( "character" ) || objHasValue( "weapon" ) );
		
		/* 是否显示活动日历 */
		const showEvent = computed( () => week === "today" && data?.event.length !== 0 );
		
		return {
			data,
			week,
			user,
			subState,
			showMaterial,
			showEvent
		};
	}
} );
