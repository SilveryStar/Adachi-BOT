const template = `<div class="info">
	<InfoBase :data="data">
		<InfoWeapon v-if="data.type === '武器'" :data="data"></InfoWeapon>
		<InfoCharacter v-else-if="data.type === '角色'" :data="data"></InfoCharacter>
		<InfoArtifact v-else :data="data"></InfoArtifact>
	</InfoBase>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import InfoBase from "./base.js";
import InfoWeapon from "./weapon.js";
import InfoCharacter from "./character.js";
import InfoArtifact from "./artifact.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "InfoApp",
	template,
	components: {
		InfoBase,
		InfoWeapon,
		InfoCharacter,
		InfoArtifact
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/info?name=${ urlParams.name }` );
		
		function setStyle( colorList ) {
			document.body.style.setProperty( "--styleInfoColor", colorList[0] );
			document.body.style.setProperty( "--backgroundColor", colorList[2] );
			document.body.style.setProperty( "--dottedColor", colorList[1] );
		}
		
		switch ( data.rarity ) {
			case 5:
				setStyle( [ "rgb(205, 167, 101)", "rgb(211, 200, 187)", "rgb(198, 156, 80)" ] );
				break;
			case 4:
				setStyle( [ "rgb(142, 115, 170)", "rgb(211, 211, 212)", "rgb(72, 83, 101)" ] );
				break;
			case 3:
				setStyle( [ "rgb(98, 191, 218)", "rgb(210, 212, 225)", "rgb(3, 149, 166)" ] );
		}
		
		return {
			data
		}
	}
} );
