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
        :mode="profileMode"
        :appoint="appoint"
    ></CardUpper>
    <CardMiddle
        :characters="charData"
        :style="style"
    ></CardMiddle>
    <CardFooter></CardFooter>
</div>`;

import CardUpper from "./upper.js";
import CardMiddle from "./middle.js";
import CardFooter from "./footer.js"
import { parseURL, request } from "../../public/js/src.js";
const { defineComponent } = Vue;

export default defineComponent( {
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
		const profileMode = urlParams.profile;
		const appoint = urlParams.appoint;
		
		const charList = data.avatars;
		const charNum = charList.length;
		
		const getProImg = id => `https://adachi-bot.oss-cn-beijing.aliyuncs.com/characters/profile/${ id }.png`;
		const profile = appoint === "empty"
			? profileMode === "random"
			? getProImg( charList[ Math.floor( Math.random() * charNum ) ].id )
			: `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ urlParams.qq }`
			: getProImg( appoint );
		
		charList.sort( ( x, y ) => {
			return x.level === y.level ? y.fetter - x.fetter : y.level - x.level;
		} );
		const charData = cutArray( charList, 7 );

		return { data, profile, charData, style, profileMode, appoint };
	}
} );