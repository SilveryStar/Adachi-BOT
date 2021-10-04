const template =
`<div class="unit">
	<div class="top-box">
		<div class="ascension-name">{{ ascensionName }}</div>
		<div class="materials-list">
			<img
				v-for="name in data.ascension"
				class="materials"
				:src="img( name )"
				alt="ERROR"
			/>
		</div>
	</div>
	<div class="item-list">
		<img
			class="item"
			v-for="d in data.list"
			:src="mainImage( d.name )"
			:style="styles( d.rarity )"
			alt="ERROR"
		/>
	</div>
</div>`;

import Vue from "../../public/js/vue.js";

export default Vue.defineComponent( {
	name: "DailyUnit",
	template,
	props: {
		data: Object,
		type: String
	},
	setup( props ) {
		let ascensionName = "";
		if ( props.type === "weapon" ) {
			 const de = props.data.ascension[0].split( "的" );
			 const zhi = props.data.ascension[0].split( "之" );
			 const arr = de.length === 1 ? zhi : de;
			 ascensionName = arr[0];
		} else {
			const regExp = new RegExp( /「(.*?)」/g );
			ascensionName = regExp.exec( props.data.ascension[0] )[0];
		}
		
		const mainImage = function ( name ) {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/thumb/${ props.type }/${ name }.png`;
		};
		const img = function ( name ) {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/image/${ name }.png`;
		}
		const styles = function ( rarity ) {
			return {
				background: `url('/public/images/rarity/${ rarity }-Star.png')`,
				"background-size": "100% 100%"
			}
		}
		
		return { ascensionName, mainImage, img, styles };
	}
} );