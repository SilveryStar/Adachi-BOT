const template =
`<div class="wish">
    <img class="background" :src="wishBackground" alt="ERROR"/>
    <p class="time">@{{ nickname }} at {{ fullDate }}</p>
    <div class="wish-list">
        <WishBox v-for="d in result"
            :d="d"
        ></WishBox>
    </div>
</div>`;

import Vue from "../../public/js/vue.js";
import { parseURL, request } from "../../public/js/src.js";
import WishBox from "./box.js";

export default Vue.defineComponent( {
	name: "WishApp",
	template,
	components: {
		WishBox
	},
	setup() {
		const wishBackground = Vue.computed( () => {
			return "/public/images/item/background.png";
		} );
		
		const urlParams = parseURL( location.search );
		const data = request( `/api/wish?qq=${ urlParams.qq }` );
		const weapon = request( "/api/wish/config?type=weapon" );
		const character = request( "/api/wish/config?type=character" );
		
		const type = data.type;
		const nickname = data.name;
		const result = data.data;
		
		for ( let key in result ) {
			if ( result.hasOwnProperty( key ) ) {
				const elType = result[key].type;
				const typeConfig = elType === "武器" ? weapon : character;
				result[key].el = typeConfig[result[key].name];
			}
		}
		
		result.sort( ( x, y ) => {
			const xType = x.type === "武器" ? 0 : 1;
			const yType = y.type === "武器" ? 0 : 1;
			if ( xType === yType ) {
				return y.rank - x.rank;
			} else {
				return yType - xType;
			}
		} );

		const date = new Date();
		let hour = date.getHours();
		let minute = date.getMinutes();
		let second = date.getSeconds();
		second = second < 10 ? "0" + second : second;
		minute = minute < 10 ? "0" + minute : minute;
		hour = hour < 10 ? "0" + hour : hour;
		const fullDate = `${ date.getMonth() + 1 }月${ date.getDate() }日 ${ date.getHours() }:${ date.getMinutes() }:${ second }`
		
		return {
			wishBackground,
			result,
			nickname,
			type,
			fullDate
		}
	}
} );