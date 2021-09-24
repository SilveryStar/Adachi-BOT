const template =
`<div class="info">
	<InfoBase
		:rarity="data.rarity"
		:name="data.name"
		:id="data.id"
		:title="data.title"
		:type="data.type"
		:introduce="data.introduce"
	></InfoBase>
	<InfoWeapon v-if="data.type === '武器'"
		:access="data.access"
		:rarity="data.rarity"
		:mainStat="data.mainStat"
		:mainValue="data.mainValue"
		:baseATK="data.baseATK"
		:ascension="data.ascensionMaterials"
		:time="data.time"
		:skillName="data.skillName"
		:skillContent="data.skillContent"
	></InfoWeapon>
	<InfoCharacter v-else
		:birthday="data.birthday"
		:element="data.element"
		:constellationName="data.constellationName"
		:cv="data.cv"
		:rarity="data.rarity"
		:mainStat="data.mainStat"
		:mainValue="data.mainValue"
		:baseATK="data.baseATK"
		:ascension="data.ascensionMaterials"
		:levelUp="data.levelUpMaterials"
		:talent="data.talentMaterials"
		:time="data.time"
		:constellations="data.constellations"
	></InfoCharacter>
</div>`;

import Vue from "../../public/js/vue.js";
import { parseURL, request } from "../../public/js/src.js";
import InfoBase from "./base.js";
import InfoWeapon from "./weapon.js";
import InfoCharacter from "./character.js";

export default Vue.defineComponent( {
	name: "InfoApp",
	template,
	components: {
		InfoBase,
		InfoWeapon,
		InfoCharacter
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/info?name=${ urlParams.name }` );
		
		function setStyle( colorList ) {
			document.documentElement.style.setProperty("--styleInfoColor",    colorList[0]);
			document.documentElement.style.setProperty("--backgroundColor",  colorList[2]);
			document.documentElement.style.setProperty("--dottedColor",     colorList[1]);
		}
		
		switch ( data.rarity ) {
			case 5: setStyle( [
				"rgb(205, 167, 101)",
				"rgb(211, 200, 187)",
				"rgb(198, 156, 80)"
			] ); break;
			case 4: setStyle( [
				"rgb(142, 115, 170)",
				"rgb(211, 211, 212)",
				"rgb(72, 83, 101)"
			] ); break;
			case 3: setStyle( [
				"rgb(98, 191, 218)",
				"rgb(210, 212, 225)",
				"rgb(3, 149, 166)"
			] );
		}
		
		return {
			data
		}
	}
} );