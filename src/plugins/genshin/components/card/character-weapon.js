const template = `
<div class="character-weapon">
	<div class="weapon-avatar-box" :style="{'background-image': getRarityBg(weapon.rarity)}">
		<img class="icon" :src="weapon.icon" alt="ERROR" />
	</div>
	<div class="weapon-detail">
		<p class="w-name">{{ weapon.name }}</p>
		<p class="w-info">
			<span class="level">Lv.{{ weapon.level }}</span>
			<span class="refine" :class="getAffixClass(weapon.rarity)">精炼{{ weapon.affixLevel }}阶</span>
		</p>
	</div>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "CharacterWeapon",
	template,
	props: {
		weapon: Object,
		getRarityBg: Function
	},
	setup() {
		/* 针对联动处理 */
		function getAffixClass( rarity ) {
			rarity = rarity === 105 ? "5a" : rarity;
			return `affix_${ rarity }`;
		}
		
		return { getAffixClass };
	}
} );
