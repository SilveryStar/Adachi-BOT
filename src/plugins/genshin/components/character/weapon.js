const template =
`<div class="character-weapon">
    <img class="icon" :src="weapon.icon" alt="ERROR"/>
    <div class="content">
        <div class="up">
            <p class="name">{{ weapon.name }}</p>
            <p class="refine">精炼{{ weapon.affixLevel }}阶</p>
        </div>
        <div class="down">
            <p class="rarity">{{ stars }}</p>
            <p class="level">Lv.{{ weapon.level }}</p>
        </div>
        <p class="desc">{{ weapon.desc }}</p>
    </div>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "CharacterWeapon",
	template,
	props: {
		weapon: Object
	},
	setup( props ) {
		const stars = computed( () => {
			const star = "★";
			return star.repeat( props.weapon.rarity );
		} );
		
		return {
			stars
		}
	}
} );