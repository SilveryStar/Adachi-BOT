const template =
`<div class="card">
	<CardUpper
        :uid="data.uid"
        :nickname="data.nickname"
        :level="data.level"
        :exploration="data.explorations"
        :profile="profile"
        :stats="data.stats"
        :homes="data.homes"
    ></CardUpper>
    <CardMiddle
        :characters="charData"
        :style="style"
    ></CardMiddle>
    <CardFooter></CardFooter>
</div>`;

import Vue from "../../public/js/vue.js";
import CardUpper from "./upper.js";
import CardMiddle from "./middle.js";
import CardFooter from "./footer.js"
import { parseURL, request } from "../../public/js/src.js";

export default Vue.defineComponent( {
	name: "CardApp",
	template,
	components: {
		CardUpper,
		CardMiddle,
		CardFooter
	},
	setup() {
		function cutArray( arr, step ) {
			let newArr = [], index = 0;
			const len = arr.length;
			while ( index < len ) {
				newArr.push( arr.slice( index, index += step ) );
			}
			return newArr;
		}
		
		const urlParams = parseURL( location.search );
		const data = request( `/api/card?qq=${ urlParams.qq }` );
		const style = urlParams.style;
		
		const charList = data.avatars;
		const charNum = charList.length;
		const profile = charList[ Math.floor( Math.random() * charNum ) ].id;
		
		charList.sort( ( x, y ) => {
			return x.level === y.level ? y.fetter - x.fetter : y.level - x.level;
		} );
		const charData = cutArray( charList, 7 );

		return { data, profile, charData, style };
	}
} );