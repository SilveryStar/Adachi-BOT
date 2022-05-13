const template = `<div class="info">
	<InfoBase :data="data">
		<InfoCharacter v-if="data.type === '角色'" :data="data" :skill="skill"></InfoCharacter>
		<InfoWeapon v-else :data="data"></InfoWeapon>
	</InfoBase>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import { initBaseColor } from "../../public/js/info-data-parser.js";
import InfoBase from "./base.js";
import InfoWeapon from "./weapon.js";
import InfoCharacter from "./character.js";

const { defineComponent, onMounted } = Vue;

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
		
		onMounted( () => {
			initBaseColor( data );
		} )
		
		return {
			skill,
			data
		}
	}
} );
