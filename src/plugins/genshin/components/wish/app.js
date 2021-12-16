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

import { getFullDate, parseURL, request } from "../../public/js/src.js";
import WishBox from "./box.js";
const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "WishApp",
	template,
	components: {
		WishBox
	},
	setup() {
		const wishBackground = computed( () => {
			return "../../public/images/item/background.png";
		} );
		
		const urlParams = parseURL( location.search );
		const data = request( `/api/wish/result?qq=${ urlParams.qq }` );
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

		const fullDate = getFullDate();
		
		return {
			wishBackground,
			result,
			nickname,
			type,
			fullDate
		}
	}
} );