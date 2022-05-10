const template = `<div class="info">
	<InfoBase :data="data">
		<InfoCharacter v-if="data.type === '角色'" :data="data" :skill="skill"></InfoCharacter>
		<InfoWeapon v-else :data="data"></InfoWeapon>
	</InfoBase>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import InfoBase from "./base.js";
import InfoWeapon from "./weapon.js";
import InfoCharacter from "./character.js";

const { defineComponent } = Vue;

export default defineComponent( {
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
		
		const skill = urlParams.skill === "true";
		
		function setStyle( colorList ) {
			document.body.style.setProperty( "--base-color", colorList[0] );
			document.body.style.setProperty( "--shadow-color", colorList[1] );
			document.body.style.setProperty( "--light-color", colorList[2] );
		}
		
		switch ( data.rarity ) {
			case 5:
				setStyle( [ "rgba(115, 90, 44, 1)", "rgba(198, 156, 80, 0.4)", "rgba(198, 156, 80, 1)" ] );
				break;
			case 4:
				setStyle( [ "rgb(94,44,115)", "rgba(157,80,199,0.4)", "rgb(153,80,199)" ] );
				break;
			case 3:
				setStyle( [ "rgba(44, 69, 115, 1)", "rgba(80, 121, 199, 0.4)", "rgba(80, 121, 199, 1)" ] );
		}
		
		return {
			skill,
			data
		}
	}
} );
