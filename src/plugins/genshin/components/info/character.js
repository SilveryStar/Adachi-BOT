const template = `<div class="character">
	<character-skill v-if="skill" :data="data"></character-skill>
	<character-normal v-else :data="data"></character-normal>
</div>`;

import CharacterNormal from "./character-normal.js";
import CharacterSkill from "./character-skill.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "InfoCharacter",
	template,
	components: {
		CharacterNormal,
		CharacterSkill
	},
	props: {
		data: {
			type: Object,
			default: () => ( {
				birthday: "",
				element: "",
				cv: "",
				constellationName: "",
				rarity: null,
				mainStat: "",
				mainValue: "",
				baseHP: null,
				baseATK: null,
				baseDEF: null,
				ascensionMaterials: [],
				levelUpMaterials: [],
				talentMaterials: [],
				constellations: [],
				time: ""
			} )
		},
		skill: {
			type: Boolean,
			default: false
		}
	}
} );
